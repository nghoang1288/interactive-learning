import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import { join } from "path";
import { Readable, pipeline } from "stream";
import { promisify } from "util";

// Force Node.js runtime (critical for fs/streams)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Extend timeout for uploads

const pump = promisify(pipeline);

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        // 1. Check auth
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        // Verify user still exists in DB
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "Tài khoản không tồn tại. Vui lòng đăng nhập lại." }, { status: 401 });
        }

        // 2. Check for Raw Binary Upload Headers
        const headerTitle = req.headers.get("X-Upload-Title");
        const headerDesc = req.headers.get("X-Upload-Desc");
        const headerFilename = req.headers.get("X-Upload-Filename");

        let title = "";
        let description = "";
        let filename = "";
        let fileSize = 0;

        if (headerFilename) {
            // BINARY MODE
            console.log("[UPLOAD] Mode: Raw Binary Stream");
            try {
                title = Buffer.from(headerTitle || "", 'base64').toString('utf-8');
                description = Buffer.from(headerDesc || "", 'base64').toString('utf-8');
                filename = Buffer.from(headerFilename || "", 'base64').toString('utf-8');
                fileSize = parseInt(req.headers.get("content-length") || "0");
            } catch (e) {
                console.error("[UPLOAD] Header decode error:", e);
                return NextResponse.json({ error: "Invalid headers encoding" }, { status: 400 });
            }

            if (!title) return NextResponse.json({ error: "Thiếu tiêu đề" }, { status: 400 });

        } else {
            // Fallback (or Error) - We prefer binary mode now
            return NextResponse.json({ error: "Please use the official Upload page (Missing headers)" }, { status: 400 });
        }

        // 3. Validate file size
        const MAX_SIZE = (process.env.MAX_VIDEO_SIZE_MB ? parseInt(process.env.MAX_VIDEO_SIZE_MB) : 500) * 1024 * 1024;
        if (fileSize > MAX_SIZE) {
            return NextResponse.json({ error: `File quá lớn. Giới hạn ${MAX_SIZE / (1024 * 1024)}MB` }, { status: 400 });
        }

        // 4. Save file to public/uploads
        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), "public", "uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        // Sanitize filename
        const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "-");
        const finalFileName = `${Date.now()}-${safeName}`;
        const filePath = join(uploadDir, finalFileName);
        const relativeUrl = `/uploads/${finalFileName}`;

        console.log(`[UPLOAD] Processing file: ${filename} -> ${finalFileName}`);
        console.log(`[UPLOAD] Size: ${fileSize} bytes`);

        // Use standard Node streams with promisified pipeline
        try {
            // req.body is the file stream in binary mode
            if (!req.body) {
                return NextResponse.json({ error: "No file body" }, { status: 400 });
            }

            // @ts-ignore
            const nodeStream = Readable.fromWeb(req.body);
            const writable = createWriteStream(filePath);

            console.log(`[UPLOAD] Starting pipeline...`);
            await pump(nodeStream, writable);
            console.log(`[UPLOAD] Pipeline finished.`);
        } catch (streamError) {
            console.error("[UPLOAD] Stream error:", streamError);
            throw streamError;
        }

        // 5. Save to database
        console.log(`[UPLOAD] Saving to DB. User: ${session.user.id}`);

        try {
            const video = await prisma.video.create({
                data: {
                    title,
                    description,
                    filename: filename, // Original filename
                    url: relativeUrl,
                    duration: 0,
                    authorId: session.user.id as string,
                },
            });
            console.log(`[UPLOAD] DB Success: ${video.id}`);

            return NextResponse.json({
                message: "Upload thành công",
                video
            }, { status: 201 });
        } catch (dbError) {
            console.error("[UPLOAD] DB Error:", dbError);
            throw dbError; // rethrow to be caught by outer catch
        }

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Lỗi server khi upload video" }, { status: 500 });
    }
}

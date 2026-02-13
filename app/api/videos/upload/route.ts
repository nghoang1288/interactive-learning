import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import { join } from "path";
import { Readable, pipeline } from "stream";
import { promisify } from "util";

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

const pump = promisify(pipeline);

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Quota configuration (10GB)
const R2_QUOTA_BYTES = 10 * 1024 * 1024 * 1024;

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        // 1. Parse Headers
        const headerTitle = req.headers.get("X-Upload-Title");
        const headerDesc = req.headers.get("X-Upload-Desc");
        const headerFilename = req.headers.get("X-Upload-Filename");
        const fileSize = parseInt(req.headers.get("content-length") || "0");

        if (!headerFilename || !req.body) {
            return NextResponse.json({ error: "Missing file or headers" }, { status: 400 });
        }

        let title = "";
        let description = "";
        let filename = "";

        try {
            title = Buffer.from(headerTitle || "", 'base64').toString('utf-8');
            description = Buffer.from(headerDesc || "", 'base64').toString('utf-8');
            filename = Buffer.from(headerFilename || "", 'base64').toString('utf-8');
        } catch (e) {
            return NextResponse.json({ error: "Invalid headers encoding" }, { status: 400 });
        }

        if (!title) return NextResponse.json({ error: "Thiếu tiêu đề" }, { status: 400 });

        // 2. Check Quota & Decide Storage
        let useR2 = false;
        let quotaExceeded = false;

        // Only try R2 if credentials exist
        if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME) {
            try {
                // Calculate current month's usage
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const usageResult = await prisma.video.aggregate({
                    _sum: { size: true },
                    where: {
                        storage: "R2",
                        createdAt: { gte: startOfMonth }
                    }
                });

                const currentUsage = usageResult._sum.size || 0;

                if (currentUsage + fileSize > R2_QUOTA_BYTES) {
                    console.warn(`[UPLOAD] R2 Quota Exceeded: ${currentUsage} + ${fileSize} > ${R2_QUOTA_BYTES}. Switching to LOCAL.`);
                    quotaExceeded = true;
                    useR2 = false;
                } else {
                    useR2 = true;
                }
            } catch (err) {
                console.error("[UPLOAD] Failed to check quota, defaulting to LOCAL:", err);
                useR2 = false;
            }
        } else {
            console.warn("[UPLOAD] Missing R2 Credentials. Using LOCAL.");
        }

        const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "-");
        const finalFileName = `${Date.now()}-${safeName}`;
        let finalUrl = "";
        let storageType = "LOCAL";

        // 3. Execution (R2 or Local)
        if (useR2) {
            try {
                console.log(`[UPLOAD] Starting R2 Upload: ${finalFileName}`);

                const s3Client = new S3Client({
                    region: "auto",
                    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                    credentials: {
                        accessKeyId: R2_ACCESS_KEY_ID!,
                        secretAccessKey: R2_SECRET_ACCESS_KEY!,
                    },
                });

                // @ts-ignore - ReadableStream from web matches required stream type
                const upload = new Upload({
                    client: s3Client,
                    params: {
                        Bucket: R2_BUCKET_NAME,
                        Key: finalFileName,
                        Body: Readable.fromWeb(req.body as any),
                        ContentType: req.headers.get("content-type") || "video/mp4",
                    },
                });

                await upload.done();

                finalUrl = `${R2_PUBLIC_URL}/${finalFileName}`;
                storageType = "R2";
                console.log(`[UPLOAD] R2 Success: ${finalUrl}`);

            } catch (r2Error) {
                console.error("[UPLOAD] R2 Failed:", r2Error);
                // Fallback to local is implicitly handled by the next block if finalUrl is empty
                // But we must reset stream? No, stream can't be rewound.
                // CRITICAL: Request body stream is consumed. We cannot fallback if R2 fails mid-stream.
                // We must return error and ask user to retry (which essentially allows them to switch mode if we report it).

                // However, user requirement: "nếu gần đến giới hạn thì chuyển sang mức upload local" -> Handled by quota check.
                // "nếu local lỗi thì báo lỗi để chuyển sang dùng url youtube" -> That's for the next fallback.

                return NextResponse.json({
                    error: "Upload R2 thất bại. Vui lòng thử lại hoặc dùng link YouTube."
                }, { status: 500 });
            }
        }

        // Fallback or Force Local
        if (!useR2 && !finalUrl) {
            console.log(`[UPLOAD] Starting Local Upload: ${finalFileName}`);

            try {
                const uploadDir = join(process.cwd(), "public", "uploads");
                await mkdir(uploadDir, { recursive: true });

                const filePath = join(uploadDir, finalFileName);

                // Warning for Vercel
                if (process.env.VERCEL) {
                    console.warn("[UPLOAD] WARNING: Uploading to ephemeral storage on Vercel. File will persist only briefly.");
                }

                // @ts-ignore
                const nodeStream = Readable.fromWeb(req.body as any);
                const writable = createWriteStream(filePath);
                await pump(nodeStream, writable);

                finalUrl = `/uploads/${finalFileName}`;
                storageType = "LOCAL";

            } catch (localError: any) {
                console.error("[UPLOAD] Local Upload Failed:", localError);
                return NextResponse.json({
                    error: "Hệ thống lưu trữ đang gặp sự cố. Vui lòng sử dụng tính năng 'Thêm từ YouTube'.",
                    isStorageError: true
                }, { status: 500 });
            }
        }

        // 4. Save to Database
        const video = await prisma.video.create({
            data: {
                title,
                description,
                filename: filename,
                url: finalUrl,
                duration: 0,
                authorId: session.user.id as string,
                size: fileSize,
                storage: storageType
            },
        });

        return NextResponse.json({
            message: "Upload thành công",
            video,
            storage: storageType
        }, { status: 201 });

    } catch (error: any) {
        console.error("Upload handler error:", error);
        return NextResponse.json({ error: "Lỗi server không xác định" }, { status: 500 });
    }
}

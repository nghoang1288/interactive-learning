import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        const body = await req.json();
        const {
            title,
            description,
            filename,
            publicUrl,
            size,
            storage,
            duration
        } = body;

        if (!title || !publicUrl || !storage) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Save to Database
        const video = await prisma.video.create({
            data: {
                title,
                description: description || "",
                filename: filename?.replace(/[^a-zA-Z0-9.-]/g, "-"),
                url: publicUrl,
                duration: duration || 0,
                authorId: session.user.id as string,
                size: parseInt(size || "0"),
                storage: storage
            },
        });

        return NextResponse.json({
            message: "Video saved successfully",
            video
        }, { status: 201 });

    } catch (error: any) {
        console.error("[COMPLETE] Error:", error);
        return NextResponse.json({ error: "Database Error" }, { status: 500 });
    }
}

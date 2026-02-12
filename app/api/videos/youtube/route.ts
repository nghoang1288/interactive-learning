import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractYouTubeId } from "@/lib/utils";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
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

        const { url, title, description } = await req.json();

        if (!url || !title) {
            return NextResponse.json({ error: "Thiếu URL hoặc tiêu đề" }, { status: 400 });
        }

        const videoId = extractYouTubeId(url);
        if (!videoId) {
            return NextResponse.json({ error: "URL YouTube không hợp lệ" }, { status: 400 });
        }

        const video = await prisma.video.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                url: videoId, // Store just the YouTube video ID
                videoType: "YOUTUBE",
                author: { connect: { id: session.user.id! } },
            },
        });

        return NextResponse.json({ video }, { status: 201 });
    } catch (error: any) {
        console.error("YouTube save error:", error);
        return NextResponse.json({ error: error.message || "Lỗi server" }, { status: 500 });
    }
}

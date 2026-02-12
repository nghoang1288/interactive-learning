import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

// GET /api/videos/[id] - Get video details
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        const video = await prisma.video.findUnique({
            where: { id: id },
            include: {
                author: { select: { name: true } },
                quizzes: {
                    include: {
                        options: true
                    }
                }
            }
        });

        if (!video) {
            return NextResponse.json({ error: "Không tìm thấy video" }, { status: 404 });
        }

        return NextResponse.json(video);
    } catch (error: any) {
        console.error("GET /api/videos/[id] error:", error);
        return NextResponse.json({
            error: "Lỗi server",
            details: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }, { status: 500 });
    }
}

// PATCH /api/videos/[id] - Update video info (only author can edit)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
        }

        const { title, description } = await req.json();

        const video = await prisma.video.findUnique({
            where: { id: id }
        });

        if (!video || video.authorId !== session.user.id) {
            return NextResponse.json({ error: "Không tìm thấy video hoặc bạn không có quyền sửa" }, { status: 404 });
        }

        const updated = await prisma.video.update({
            where: { id: id },
            data: { title, description }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}

// DELETE /api/videos/[id] - Delete video (only author can delete)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
        }

        const video = await prisma.video.findUnique({
            where: { id: id }
        });

        if (!video || video.authorId !== session.user.id) {
            return NextResponse.json({ error: "Không tìm thấy video hoặc bạn không có quyền xóa" }, { status: 404 });
        }

        // 1. Delete file from disk (only for uploaded videos, not YouTube)
        if (video.videoType !== "YOUTUBE") {
            const filePath = join(process.cwd(), "public", video.url);
            try {
                await unlink(filePath);
            } catch (e) {
                console.warn("Could not delete file:", filePath);
            }
        }

        // 2. Delete from database
        await prisma.video.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: "Đã xóa video" });
    } catch (error) {
        console.error("Delete video error:", error);
        return NextResponse.json({ error: "Lỗi khi xóa video" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/progress/[videoId] - Get progress for a specific video
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ videoId: string }> }
) {
    try {
        const { videoId } = await params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        const progress = await prisma.progress.findUnique({
            where: {
                userId_videoId: {
                    userId: session.user.id as string,
                    videoId: videoId
                }
            }
        });

        return NextResponse.json(progress || { currentTime: 0, completed: false });
    } catch (error) {
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}

// POST /api/progress/[videoId] - Update progress
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ videoId: string }> }
) {
    try {
        const { videoId } = await params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        const { currentTime, completed } = await req.json();

        const progress = await prisma.progress.upsert({
            where: {
                userId_videoId: {
                    userId: session.user.id as string,
                    videoId: videoId
                }
            },
            update: {
                currentTime: currentTime || 0,
                completed: !!completed,
                completedAt: completed ? new Date() : null,
            },
            create: {
                userId: session.user.id as string,
                videoId: videoId,
                currentTime: currentTime || 0,
                completed: !!completed,
                completedAt: completed ? new Date() : null,
            }
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Update progress error:", error);
        return NextResponse.json({ error: "Lỗi khi cập nhật tiến trình" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/progress/update
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        const { videoId, currentTime, completed } = await req.json();

        if (!videoId) {
            return NextResponse.json({ error: "Thiếu videoId" }, { status: 400 });
        }

        const progress = await prisma.progress.upsert({
            where: {
                userId_videoId: {
                    userId: session.user.id as string,
                    videoId: videoId
                }
            },
            update: {
                ...(currentTime !== undefined && { currentTime }),
                ...(completed !== undefined && { completed: !!completed }),
                updatedAt: new Date()
            },
            create: {
                userId: session.user.id as string,
                videoId: videoId,
                currentTime: currentTime || 0,
                completed: completed || false
            }
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Update progress error:", error);
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}

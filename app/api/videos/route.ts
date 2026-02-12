import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/videos - List videos uploaded by the current user
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        const videos = await prisma.video.findMany({
            where: {
                authorId: session.user.id as string,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: { quizzes: true }
                }
            }
        });

        return NextResponse.json(videos);
    } catch (error) {
        console.error("List videos error:", error);
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}

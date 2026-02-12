import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stats/teacher → now /api/stats/my-content - Stats for user's uploaded content
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        const authorId = session.user.id as string;

        // Parallel stats fetching
        const [videoCount, totalLearners, totalQuizResults] = await Promise.all([
            prisma.video.count({ where: { authorId } }),
            prisma.progress.groupBy({
                by: ['userId'],
                where: {
                    video: { authorId }
                }
            }).then(r => r.length),
            prisma.quizResult.count({
                where: {
                    quiz: {
                        video: { authorId }
                    }
                }
            })
        ]);

        // Recent activity: Latest 5 videos
        const recentVideos = await prisma.video.findMany({
            where: { authorId },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                _count: {
                    select: { quizzes: true }
                }
            }
        });

        return NextResponse.json({
            stats: {
                videoCount,
                totalLearners,
                totalQuizResults,
            },
            recentVideos
        });
    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}

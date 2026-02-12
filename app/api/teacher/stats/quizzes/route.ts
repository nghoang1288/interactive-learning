import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        const authorId = session.user.id as string;

        // Get all quizzes for videos owned by this user
        const videos = await prisma.video.findMany({
            where: { authorId },
            include: {
                quizzes: {
                    include: {
                        results: true
                    }
                }
            }
        });

        const quizStats = videos.flatMap(v =>
            v.quizzes.map(q => {
                const totalAttempts = q.results.length;
                const correctAttempts = q.results.filter(r => r.isCorrect).length;
                const successRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

                return {
                    id: q.id,
                    question: q.question,
                    videoTitle: v.title,
                    totalAttempts,
                    correctAttempts,
                    successRate
                };
            })
        );

        // Sort by success rate ascending (hardest first)
        quizStats.sort((a, b) => a.successRate - b.successRate);

        return NextResponse.json(quizStats);
    } catch (error) {
        console.error("Quiz stats error:", error);
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}

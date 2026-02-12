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

        // 1. Total videos
        const totalVideos = await prisma.video.count({
            where: { authorId }
        });

        // 2. Total unique learners
        const learners = await prisma.progress.groupBy({
            by: ['userId'],
            where: {
                video: { authorId }
            }
        });
        const totalLearners = learners.length;

        // 3. Overall completion rate
        const totalProgress = await prisma.progress.count({
            where: {
                video: { authorId }
            }
        });
        const completedProgress = await prisma.progress.count({
            where: {
                video: { authorId },
                completed: true
            }
        });
        const completionRate = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0;

        // 4. Recent activity (last 5 progress updates)
        const recentActivity = await prisma.progress.findMany({
            where: {
                video: { authorId }
            },
            include: {
                user: { select: { name: true } },
                video: { select: { title: true } }
            },
            orderBy: { updatedAt: 'desc' },
            take: 5
        });

        // 5. Progress over time (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            return d;
        }).reverse();

        const dailyCompletions = await Promise.all(last7Days.map(async (date) => {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const count = await prisma.progress.count({
                where: {
                    video: { authorId },
                    completed: true,
                    completedAt: {
                        gte: date,
                        lt: nextDay
                    }
                }
            });

            return {
                name: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
                completions: count
            };
        }));

        return NextResponse.json({
            totalVideos,
            totalLearners,
            completionRate,
            recentActivity,
            dailyCompletions
        });
    } catch (error) {
        console.error("General stats error:", error);
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}

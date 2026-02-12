import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/quiz-results - Submit a quiz answer
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        const { quizId, optionId } = await req.json();

        // 1. Validate option belongs to quiz
        const option = await prisma.quizOption.findUnique({
            where: { id: optionId },
            include: { quiz: true }
        });

        if (!option || option.quizId !== quizId) {
            return NextResponse.json({ error: "Lựa chọn không hợp lệ cho quiz này" }, { status: 400 });
        }

        // 2. Save or update result
        const result = await prisma.quizResult.upsert({
            where: {
                userId_quizId: {
                    userId: session.user.id as string,
                    quizId: quizId
                }
            },
            update: {
                optionId: optionId,
                isCorrect: option.isCorrect,
                attempts: { increment: 1 },
                answeredAt: new Date(),
            },
            create: {
                userId: session.user.id as string,
                quizId: quizId,
                optionId: optionId,
                isCorrect: option.isCorrect,
            }
        });

        return NextResponse.json({
            isCorrect: option.isCorrect,
            result
        });
    } catch (error) {
        console.error("Submit quiz error:", error);
        return NextResponse.json({ error: "Lỗi khi nộp đáp án" }, { status: 500 });
    }
}

// GET /api/quiz-results - Get user's quiz results
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        const results = await prisma.quizResult.findMany({
            where: {
                userId: session.user.id as string
            },
            include: {
                quiz: true,
                option: true
            }
        });

        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}

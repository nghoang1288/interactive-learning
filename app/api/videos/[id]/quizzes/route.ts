import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/videos/[id]/quizzes - List quizzes for a specific video
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const quizzes = await prisma.quiz.findMany({
            where: { videoId: id },
            include: {
                options: true
            },
            orderBy: {
                timestamp: "asc"
            }
        });

        return NextResponse.json(quizzes);
    } catch (error) {
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}

// POST /api/videos/[id]/quizzes - Create a new quiz (only video author)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
        }

        const { question, timestamp, options } = await req.json();

        // Check video ownership
        const video = await prisma.video.findUnique({
            where: { id: id }
        });

        if (!video || video.authorId !== session.user.id) {
            return NextResponse.json({ error: "Không tìm thấy video hoặc không có quyền" }, { status: 404 });
        }

        // Validate options (min 2, at least 1 correct)
        if (!options || options.length < 2) {
            return NextResponse.json({ error: "Cần tối thiểu 2 lựa chọn" }, { status: 400 });
        }

        const hasCorrect = options.some((o: any) => o.isCorrect === true);
        if (!hasCorrect) {
            return NextResponse.json({ error: "Cần ít nhất một đáp án đúng" }, { status: 400 });
        }

        const quiz = await prisma.quiz.create({
            data: {
                videoId: id,
                question,
                timestamp,
                options: {
                    create: options.map((o: any) => ({
                        text: o.text,
                        isCorrect: !!o.isCorrect
                    }))
                }
            },
            include: {
                options: true
            }
        });

        return NextResponse.json(quiz, { status: 201 });
    } catch (error) {
        console.error("Create quiz error:", error);
        return NextResponse.json({ error: "Lỗi khi tạo quiz" }, { status: 500 });
    }
}

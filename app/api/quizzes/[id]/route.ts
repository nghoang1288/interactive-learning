import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/quizzes/[id] - Update a quiz (only video author can edit)
export async function PUT(
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

        // Check ownership through video
        const existingQuiz = await prisma.quiz.findUnique({
            where: { id: id },
            include: { video: true }
        });

        if (!existingQuiz || existingQuiz.video.authorId !== session.user.id) {
            return NextResponse.json({ error: "Không tìm thấy quiz hoặc không có quyền" }, { status: 404 });
        }

        // Update quiz
        const updatedQuiz = await prisma.$transaction(async (tx) => {
            // 1. Delete old options
            await tx.quizOption.deleteMany({
                where: { quizId: id }
            });

            // 2. Update quiz and create new options
            return tx.quiz.update({
                where: { id: id },
                data: {
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
        });

        return NextResponse.json(updatedQuiz);
    } catch (error) {
        console.error("Update quiz error:", error);
        return NextResponse.json({ error: "Lỗi khi cập nhật quiz" }, { status: 500 });
    }
}

// DELETE /api/quizzes/[id] - Delete a quiz (only video author can delete)
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

        const quiz = await prisma.quiz.findUnique({
            where: { id: id },
            include: { video: true }
        });

        if (!quiz || quiz.video.authorId !== session.user.id) {
            return NextResponse.json({ error: "Không tìm thấy quiz hoặc không có quyền" }, { status: 404 });
        }

        await prisma.quiz.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: "Đã xóa quiz" });
    } catch (error) {
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}

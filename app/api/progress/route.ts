import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/progress - List all progress for the current user
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        const progressList = await prisma.progress.findMany({
            where: {
                userId: session.user.id as string
            },
            include: {
                video: {
                    include: {
                        author: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        return NextResponse.json(progressList);
    } catch (error) {
        console.error("List progress error:", error);
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}

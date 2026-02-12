import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/lessons - List all available lessons (videos)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";

        const videos = await prisma.video.findMany({
            where: {
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ]
            },
            include: {
                author: {
                    select: { name: true }
                },
                _count: {
                    select: { quizzes: true }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(videos);
    } catch (error) {
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}

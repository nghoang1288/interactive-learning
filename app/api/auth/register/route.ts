import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Vui lòng điền đầy đủ thông tin" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Mật khẩu phải có ít nhất 6 ký tự" },
                { status: 400 }
            );
        }

        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email đã được sử dụng" },
                { status: 409 }
            );
        }

        // Hash password & create user
        const hashedPassword = await hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            {
                message: "Đăng ký thành công!",
                user: { id: user.id, name: user.name, email: user.email },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Register error:", JSON.stringify({
            name: error?.name,
            code: error?.code,
            message: error?.message,
            meta: error?.meta,
            clientVersion: error?.clientVersion,
        }));
        return NextResponse.json(
            { error: error?.message || "Đã xảy ra lỗi. Vui lòng thử lại." },
            { status: 500 }
        );
    }
}

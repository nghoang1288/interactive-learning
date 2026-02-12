import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

// export default NextAuth(authConfig).auth;

export default function middleware() {
    // Debug: Pass-through to verify if NextAuth is causing the crash
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
    ],
};

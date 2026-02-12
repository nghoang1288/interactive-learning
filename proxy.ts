import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

// export default NextAuth(authConfig).auth;

export default function proxy(request: NextRequest) {
    console.log("Proxy invoked for:", request.nextUrl.pathname);
    // Debug: Pass-through to verify if NextAuth is causing the crash
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads/).*)"],
};

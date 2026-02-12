import { NextRequest, NextResponse } from "next/server";

// Simple pass-through middleware — auth disabled for debugging
export function middleware(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads/).*)"],
};

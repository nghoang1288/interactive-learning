import { NextResponse } from "next/server";

export async function GET() {
    const dbUrl = process.env.DATABASE_URL || "";
    return NextResponse.json({
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlLength: dbUrl.length,
        dbUrlPrefix: dbUrl.substring(0, 15),
        startsWithPostgres: dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://"),
        firstChar: dbUrl.charCodeAt(0),
        lastChar: dbUrl.charCodeAt(dbUrl.length - 1),
        hasQuotes: dbUrl.includes('"') || dbUrl.includes("'"),
        hasSpaces: dbUrl.startsWith(" ") || dbUrl.endsWith(" "),
    });
}

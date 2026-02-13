import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Quota configuration (9GB)
const R2_QUOTA_BYTES = 9 * 1024 * 1024 * 1024;

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        // Parse Body (JSON now, not stream)
        const body = await req.json();
        const { filename, contentType, size } = body;

        if (!filename || !size) {
            return NextResponse.json({ error: "Missing filename or size" }, { status: 400 });
        }

        const fileSize = parseInt(size);

        // 1. Quota Check
        if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME) {
            try {
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const usageResult = await prisma.video.aggregate({
                    _sum: { size: true },
                    where: {
                        storage: "R2",
                        createdAt: { gte: startOfMonth }
                    }
                });

                const currentUsage = usageResult._sum?.size || 0;

                if (currentUsage + fileSize > R2_QUOTA_BYTES) {
                    return NextResponse.json({
                        error: "R2 Quota Exceeded. Please use YouTube.",
                        code: "QUOTA_EXCEEDED"
                    }, { status: 403 });
                }
            } catch (err) {
                console.error("[UPLOAD] Quota check failed:", err);
                // Proceed cautiously or fail? Proceeding might mean overage.
                // But risk is low.
            }

            // 2. Generate Presigned URL
            const s3Client = new S3Client({
                region: "auto",
                endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: R2_ACCESS_KEY_ID,
                    secretAccessKey: R2_SECRET_ACCESS_KEY,
                },
            });

            const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "-");
            const finalFileName = `${Date.now()}-${safeName}`;

            const command = new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: finalFileName,
                ContentType: contentType || "video/mp4",
                ContentLength: fileSize,
            });

            // Expiration: 1 hour
            const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            const publicUrl = `${R2_PUBLIC_URL}/${finalFileName}`;

            return NextResponse.json({
                uploadUrl,
                publicUrl,
                finalFileName,
                storage: "R2"
            });
        } else {
            return NextResponse.json({
                error: "R2 Configuration Missing. Local upload not supported for large files on Vercel.",
                code: "CONFIG_MISSING"
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Presign error:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}

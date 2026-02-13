import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';
dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

async function main() {
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
        console.error("Missing R2 credentials");
        process.exit(1);
    }

    const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
    });

    const command = new PutBucketCorsCommand({
        Bucket: R2_BUCKET_NAME,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedHeaders: ["*"],
                    AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
                    AllowedOrigins: ["*"], // For development. specific domain recommended for prod
                    ExposeHeaders: ["ETag", "Content-Range", "Content-Length", "Accept-Ranges"],
                    MaxAgeSeconds: 3600,
                },
            ],
        },
    });

    try {
        await s3Client.send(command);
        console.log("Successfully set CORS configuration for bucket:", R2_BUCKET_NAME);
    } catch (err) {
        console.error("Error setting CORS:", err);
    }
}

main();

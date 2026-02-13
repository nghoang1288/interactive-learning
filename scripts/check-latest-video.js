const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const video = await prisma.video.findFirst({
        orderBy: { createdAt: 'desc' }
    });
    console.log("Video:", video);

    if (video && video.url.startsWith("http")) {
        try {
            console.log("\n--- URL CHECK ---");
            console.log("URL:", video.url);
            const res = await fetch(video.url, { method: 'HEAD' });
            console.log("STATUS:", res.status); // 200, 403, 404?
            console.log("TYPE:", res.headers.get("content-type"));
            console.log("-----------------\n");
        } catch (e) {
            console.error("Fetch Error:", e.message);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

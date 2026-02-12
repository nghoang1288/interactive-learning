import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...");

    // Clean existing data
    await prisma.quizResult.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.quizOption.deleteMany();
    await prisma.quiz.deleteMany();
    await prisma.video.deleteMany();
    await prisma.user.deleteMany();

    // Create users (no role distinction)
    const user1 = await prisma.user.upsert({
        where: { email: "doctor@test.com" },
        update: { role: "ADMIN" },
        create: {
            name: "BS. Minh",
            email: "doctor@test.com",
            password: hashSync("123456", 10),
            role: "ADMIN",
        },
    });
    console.log(`🩺 Created user: ${user1.email}`);

    const user2 = await prisma.user.create({
        data: {
            name: "Nguyễn Văn A",
            email: "member1@test.com",
            password: hashSync("123456", 10),
        },
    });

    const user3 = await prisma.user.create({
        data: {
            name: "Trần Thị B",
            email: "member2@test.com",
            password: hashSync("123456", 10),
        },
    });
    console.log(`👤 Created members: ${user2.email}, ${user3.email}`);

    // Create a sample Video (authorId instead of teacherId)
    const video = await prisma.video.create({
        data: {
            title: "Bài 1: Hướng dẫn đọc X-Quang ngực cơ bản",
            description: "Học cách đọc phim X-Quang ngực từ cơ bản đến nâng cao.",
            filename: "sample-xray-intro.mp4",
            url: "/uploads/sample-xray-intro.mp4",
            duration: 600,
            authorId: user1.id,
        },
    });
    console.log(`📹 Created video: ${video.title}`);

    // Create Quizzes at timestamps
    await prisma.quiz.create({
        data: {
            videoId: video.id,
            timestamp: 120,
            question: "Vùng nào trên X-Quang ngực thường cho thấy tim?",
            options: {
                create: [
                    { text: "Trung thất", isCorrect: true },
                    { text: "Phổi phải", isCorrect: false },
                    { text: "Xương sườn", isCorrect: false },
                    { text: "Cơ hoành", isCorrect: false },
                ],
            },
        },
    });

    await prisma.quiz.create({
        data: {
            videoId: video.id,
            timestamp: 300,
            question: "Chỉ số CTR bình thường là bao nhiêu?",
            options: {
                create: [
                    { text: "< 50%", isCorrect: true },
                    { text: "< 80%", isCorrect: false },
                    { text: "> 50%", isCorrect: false },
                    { text: "= 100%", isCorrect: false },
                ],
            },
        },
    });
    console.log(`❓ Created 2 quizzes`);

    console.log("✅ Seed completed!");
    console.log("\n📋 Test accounts:");
    console.log("  Doctor:  doctor@test.com / 123456");
    console.log("  Member:  member1@test.com / 123456");
    console.log("  Member:  member2@test.com / 123456");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

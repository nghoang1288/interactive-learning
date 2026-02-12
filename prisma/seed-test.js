const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    const email = "manual@test.com"; // Our test student
    const teacherEmail = "teacher@test.com";

    // Create/Update teacher
    const teacherPassword = await bcrypt.hash("123456", 10);
    const teacher = await prisma.user.upsert({
        where: { email: teacherEmail },
        update: { password: teacherPassword },
        create: {
            name: "Teacher Test",
            email: teacherEmail,
            password: teacherPassword,
            role: "TEACHER",
        },
    });

    // Create/Update student
    const studentPassword = await bcrypt.hash("123456", 10);
    await prisma.user.upsert({
        where: { email: email },
        update: { password: studentPassword },
        create: {
            name: "Manual Test",
            email: email,
            password: studentPassword,
            role: "STUDENT",
        },
    });

    // Create a sample video with quizzes
    const video = await prisma.video.create({
        data: {
            title: "Interactive Video Test",
            description: "Học về Next.js và Trình phát video tương tác.",
            url: "https://vjs.zencdn.net/v/oceans.mp4",
            teacherId: teacher.id,
            quizzes: {
                create: [
                    {
                        question: "Next.js là gì?",
                        timestamp: 10,
                        options: {
                            create: [
                                { text: "Một framework React", isCorrect: true },
                                { text: "Một thư viện CSS", isCorrect: false },
                                { text: "Một database", isCorrect: false },
                            ]
                        }
                    },
                    {
                        question: "Interactive Video có ưu điểm gì?",
                        timestamp: 30,
                        options: {
                            create: [
                                { text: "Tăng tương tác", isCorrect: true },
                                { text: "Giảm dung lượng video", isCorrect: false },
                                { text: "Làm video chạy nhanh hơn", isCorrect: false },
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log("Seed complete! Video ID:", video.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

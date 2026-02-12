/*
  Warnings:

  - The values [TEACHER,STUDENT] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `studentId` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `QuizResult` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `Video` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,videoId]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,quizId]` on the table `QuizResult` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `QuizResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('UPLOAD', 'YOUTUBE');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_studentId_fkey";

-- DropForeignKey
ALTER TABLE "QuizResult" DROP CONSTRAINT "QuizResult_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_teacherId_fkey";

-- DropIndex
DROP INDEX "Progress_studentId_videoId_key";

-- DropIndex
DROP INDEX "QuizResult_studentId_quizId_key";

-- AlterTable
ALTER TABLE "Progress" DROP COLUMN "studentId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuizResult" DROP COLUMN "studentId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "teacherId",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "videoType" "VideoType" NOT NULL DEFAULT 'UPLOAD',
ALTER COLUMN "filename" DROP NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_videoId_key" ON "Progress"("userId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizResult_userId_quizId_key" ON "QuizResult"("userId", "quizId");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

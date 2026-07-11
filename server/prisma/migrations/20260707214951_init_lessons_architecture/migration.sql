/*
  Warnings:

  - You are about to drop the column `nusGroupId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `nusGroupId` on the `tests` table. All the data in the column will be lost.
  - You are about to drop the `chat_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[lessonId]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lessonId]` on the table `tests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lessonId` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lessonId` to the `tests` table without a default value. This is not possible if the table is not empty.

*/

-- DropForeignKey
ALTER TABLE "chat_members" DROP CONSTRAINT "chat_members_chatId_fkey";

-- DropForeignKey
ALTER TABLE "chat_members" DROP CONSTRAINT "chat_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_chatId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_nusGroupId_fkey";

-- DropForeignKey
ALTER TABLE "tests" DROP CONSTRAINT "tests_nusGroupId_fkey";

-- AlterTable
ALTER TABLE "gradebooks" ADD COLUMN     "lessonId" TEXT;

-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "lessonId" TEXT;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "nusGroupId" TEXT;

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "nusGroupId",
ADD COLUMN     "lessonId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tests" DROP COLUMN "nusGroupId",
ADD COLUMN     "lessonId" TEXT NOT NULL;

-- DropTable
DROP TABLE "chat_members";

-- DropTable
DROP TABLE "chats";

-- DropTable
DROP TABLE "messages";

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "courseModuleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TaskNusGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskNusGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LessonNusGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LessonNusGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskNusGroups_B_index" ON "_TaskNusGroups"("B");

-- CreateIndex
CREATE INDEX "_LessonNusGroups_B_index" ON "_LessonNusGroups"("B");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_lessonId_key" ON "tasks"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "tests_lessonId_key" ON "tests"("lessonId");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_courseModuleId_fkey" FOREIGN KEY ("courseModuleId") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_nusGroupId_fkey" FOREIGN KEY ("nusGroupId") REFERENCES "nus_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gradebooks" ADD CONSTRAINT "gradebooks_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskNusGroups" ADD CONSTRAINT "_TaskNusGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "nus_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskNusGroups" ADD CONSTRAINT "_TaskNusGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonNusGroups" ADD CONSTRAINT "_LessonNusGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonNusGroups" ADD CONSTRAINT "_LessonNusGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "nus_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

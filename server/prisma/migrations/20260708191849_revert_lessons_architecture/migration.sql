/*
  Warnings:

  - You are about to drop the column `lessonId` on the `gradebooks` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `nusGroupId` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `tests` table. All the data in the column will be lost.
  - You are about to drop the `_LessonNusGroups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TaskNusGroups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lessons` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LessonNusGroups" DROP CONSTRAINT "_LessonNusGroups_A_fkey";

-- DropForeignKey
ALTER TABLE "_LessonNusGroups" DROP CONSTRAINT "_LessonNusGroups_B_fkey";

-- DropForeignKey
ALTER TABLE "_TaskNusGroups" DROP CONSTRAINT "_TaskNusGroups_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskNusGroups" DROP CONSTRAINT "_TaskNusGroups_B_fkey";

-- DropForeignKey
ALTER TABLE "gradebooks" DROP CONSTRAINT "gradebooks_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_courseId_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_courseModuleId_fkey";

-- DropForeignKey
ALTER TABLE "materials" DROP CONSTRAINT "materials_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_nusGroupId_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "tests" DROP CONSTRAINT "tests_lessonId_fkey";

-- DropIndex
DROP INDEX "tasks_lessonId_key";

-- DropIndex
DROP INDEX "tests_lessonId_key";

-- AlterTable
ALTER TABLE "gradebooks" DROP COLUMN "lessonId";

-- AlterTable
ALTER TABLE "materials" DROP COLUMN "lessonId";

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "nusGroupId";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "lessonId",
ADD COLUMN     "nusGroupId" TEXT;

-- AlterTable
ALTER TABLE "tests" DROP COLUMN "lessonId",
ADD COLUMN     "nusGroupId" TEXT;

-- DropTable
DROP TABLE "_LessonNusGroups";

-- DropTable
DROP TABLE "_TaskNusGroups";

-- DropTable
DROP TABLE "lessons";

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_nusGroupId_fkey" FOREIGN KEY ("nusGroupId") REFERENCES "nus_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_nusGroupId_fkey" FOREIGN KEY ("nusGroupId") REFERENCES "nus_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

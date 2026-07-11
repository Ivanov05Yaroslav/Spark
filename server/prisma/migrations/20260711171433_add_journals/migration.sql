/*
  Warnings:

  - A unique constraint covering the columns `[studentId,lessonId]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lessonId` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `attendances` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `gradebooks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('ABSENT', 'SICK');

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lessonId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "date" DROP DEFAULT,
DROP COLUMN "status",
ADD COLUMN     "status" "AttendanceStatus" NOT NULL;

-- AlterTable
ALTER TABLE "course_modules" ADD COLUMN     "semester" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "gradebooks" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "finalGrade" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "attendances_courseId_lessonId_idx" ON "attendances"("courseId", "lessonId");

-- CreateIndex
CREATE INDEX "attendances_studentId_courseId_idx" ON "attendances"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentId_lessonId_key" ON "attendances"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "course_modules_courseId_semester_idx" ON "course_modules"("courseId", "semester");

-- CreateIndex
CREATE INDEX "gradebooks_courseId_studentId_idx" ON "gradebooks"("courseId", "studentId");

-- CreateIndex
CREATE INDEX "gradebooks_lessonId_idx" ON "gradebooks"("lessonId");

-- CreateIndex
CREATE INDEX "gradebooks_taskId_idx" ON "gradebooks"("taskId");

-- CreateIndex
CREATE INDEX "gradebooks_testId_idx" ON "gradebooks"("testId");

-- CreateIndex
CREATE INDEX "gradebooks_nusGroupId_idx" ON "gradebooks"("nusGroupId");

-- CreateIndex
CREATE INDEX "submissions_studentId_taskId_idx" ON "submissions"("studentId", "taskId");

-- CreateIndex
CREATE INDEX "submissions_studentId_testId_idx" ON "submissions"("studentId", "testId");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

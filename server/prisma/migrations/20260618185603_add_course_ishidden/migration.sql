/*
  Warnings:

  - You are about to drop the `attendance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_courseId_fkey";

-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_studentId_fkey";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "attendance";

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

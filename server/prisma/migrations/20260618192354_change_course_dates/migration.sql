/*
  Warnings:

  - You are about to drop the column `academicYear` on the `courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "academicYear",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

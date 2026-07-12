/*
  Warnings:

  - You are about to drop the column `lessonId` on the `materials` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "materials" DROP CONSTRAINT "materials_lessonId_fkey";

-- AlterTable
ALTER TABLE "materials" DROP COLUMN "lessonId";

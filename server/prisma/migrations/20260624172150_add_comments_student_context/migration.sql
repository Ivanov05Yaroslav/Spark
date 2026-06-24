/*
  Warnings:

  - Added the required column `targetStudentId` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "targetStudentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_targetStudentId_fkey" FOREIGN KEY ("targetStudentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

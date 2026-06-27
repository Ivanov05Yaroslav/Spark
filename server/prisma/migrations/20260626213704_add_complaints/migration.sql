/*
  Warnings:

  - Added the required column `updatedAt` to the `complaints` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "commentsBlockedUntil" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

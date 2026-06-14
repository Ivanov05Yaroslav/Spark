/*
  Warnings:

  - You are about to drop the column `isDiiaVerified` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `schools` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "schools" DROP COLUMN "isDiiaVerified",
DROP COLUMN "name",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "directorFullName" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL DEFAULT 'Оновлена школа',
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "shortName" TEXT,
ADD COLUMN     "website" TEXT;

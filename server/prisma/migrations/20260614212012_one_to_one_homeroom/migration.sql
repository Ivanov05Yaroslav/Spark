/*
  Warnings:

  - A unique constraint covering the columns `[homeroomTeacherId]` on the table `classes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "classes_homeroomTeacherId_key" ON "classes"("homeroomTeacherId");

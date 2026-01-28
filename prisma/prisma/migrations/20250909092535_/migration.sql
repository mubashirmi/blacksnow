/*
  Warnings:

  - You are about to drop the column `role` on the `Auth` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Auth" DROP COLUMN "role",
ADD COLUMN     "roles" "Role"[] DEFAULT ARRAY[]::"Role"[];

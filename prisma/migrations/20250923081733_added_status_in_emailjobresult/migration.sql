-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('pending', 'sent');

-- AlterTable
ALTER TABLE "EmailJobResult" ADD COLUMN     "status" "EmailStatus" NOT NULL DEFAULT 'pending';

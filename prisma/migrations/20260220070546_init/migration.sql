-- CreateTable
CREATE TABLE "notifications" (
    "_id" TEXT NOT NULL,
    "user_id_receiver" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("_id")
);

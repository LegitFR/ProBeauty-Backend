-- CreateTable
CREATE TABLE "salon_favourites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "salon_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salon_favourites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "salon_favourites_user_id_idx" ON "salon_favourites"("user_id");

-- CreateIndex
CREATE INDEX "salon_favourites_salon_id_idx" ON "salon_favourites"("salon_id");

-- CreateIndex
CREATE UNIQUE INDEX "salon_favourites_user_id_salon_id_key" ON "salon_favourites"("user_id", "salon_id");

-- AddForeignKey
ALTER TABLE "salon_favourites" ADD CONSTRAINT "salon_favourites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salon_favourites" ADD CONSTRAINT "salon_favourites_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

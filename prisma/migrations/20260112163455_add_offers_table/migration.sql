-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "salon_id" TEXT NOT NULL,
    "product_id" TEXT,
    "service_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "offer_type" TEXT NOT NULL,
    "discount_type" TEXT NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "offers_salon_id_idx" ON "offers"("salon_id");

-- CreateIndex
CREATE INDEX "offers_product_id_idx" ON "offers"("product_id");

-- CreateIndex
CREATE INDEX "offers_service_id_idx" ON "offers"("service_id");

-- CreateIndex
CREATE INDEX "offers_is_active_idx" ON "offers"("is_active");

-- CreateIndex
CREATE INDEX "offers_starts_at_ends_at_idx" ON "offers"("starts_at", "ends_at");

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

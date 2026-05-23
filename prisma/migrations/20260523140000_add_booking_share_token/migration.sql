ALTER TABLE "Booking" ADD COLUMN "shareToken" TEXT;
CREATE UNIQUE INDEX "Booking_shareToken_key" ON "Booking"("shareToken");

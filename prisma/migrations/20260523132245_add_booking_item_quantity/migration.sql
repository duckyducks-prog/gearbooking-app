-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BookingItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookingItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BookingItem" ("bookingId", "equipmentId", "id") SELECT "bookingId", "equipmentId", "id" FROM "BookingItem";
DROP TABLE "BookingItem";
ALTER TABLE "new_BookingItem" RENAME TO "BookingItem";
CREATE UNIQUE INDEX "BookingItem_bookingId_equipmentId_key" ON "BookingItem"("bookingId", "equipmentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

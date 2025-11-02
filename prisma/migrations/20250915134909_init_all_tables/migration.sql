-- CreateTable
CREATE TABLE "Artikel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "artnr" TEXT NOT NULL,
    "bezeichnung" TEXT NOT NULL,
    "preis1" REAL NOT NULL,
    "preis2" REAL,
    "preis3" REAL,
    "preis4" REAL,
    "preis5" REAL,
    "preis6" REAL,
    "preis7" REAL,
    "preis8" REAL,
    "preis9" REAL,
    "kachel" TEXT
);

-- CreateTable
CREATE TABLE "Mitglied" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mitgliedsnr" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strasse" TEXT NOT NULL,
    "landkz" TEXT NOT NULL,
    "plz" TEXT NOT NULL,
    "ort" TEXT NOT NULL,
    "preisgruppe" TEXT NOT NULL,
    "ausweisnr" TEXT,
    "mitglied" BOOLEAN NOT NULL DEFAULT true,
    "gesperrt" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Kasse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datum" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uhrzeit" TEXT NOT NULL,
    "menge" INTEGER NOT NULL,
    "einzelpreis" REAL NOT NULL,
    "gesamtpreis" REAL NOT NULL,
    "mitgliedId" INTEGER,
    "artikelId" INTEGER,
    "benutzerId" INTEGER,
    CONSTRAINT "Kasse_mitgliedId_fkey" FOREIGN KEY ("mitgliedId") REFERENCES "Mitglied" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Kasse_artikelId_fkey" FOREIGN KEY ("artikelId") REFERENCES "Artikel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Kasse_benutzerId_fkey" FOREIGN KEY ("benutzerId") REFERENCES "Benutzer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entnahme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datum" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "betragCents" INTEGER NOT NULL,
    "benutzerId" INTEGER,
    CONSTRAINT "Entnahme_benutzerId_fkey" FOREIGN KEY ("benutzerId") REFERENCES "Benutzer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Artikel_artnr_key" ON "Artikel"("artnr");

-- CreateIndex
CREATE UNIQUE INDEX "Mitglied_mitgliedsnr_key" ON "Mitglied"("mitgliedsnr");

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
);
INSERT INTO _prisma_migrations VALUES('e94b2197-cb2a-4713-9a35-03d7d33458bf','f63431309263406c5eef979dccd476901186819b2d88159d2434c3b074956ef6',1757944094915,'20250915125136_init',NULL,NULL,1757944094899,1);
INSERT INTO _prisma_migrations VALUES('cc287317-6258-426c-83c5-634c073e8c60','eeb83485dd2b24b6d6159e908b6f4b3330646b31900c696151819726db3674df',1757944149878,'20250915134909_init_all_tables',NULL,NULL,1757944149857,1);
CREATE TABLE IF NOT EXISTS "Benutzer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "kennwort" TEXT NOT NULL,
    "istadmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO Benutzer VALUES(1,'admin','$2b$10$.rznXblNzvixPQ9xN/8s0uUY5PK29XEZ.oAoOfCIS7SVtWca8op7C',1,1757944276221);
INSERT INTO Benutzer VALUES(3,'Esel','$2b$10$vSXXA5xxKXermaHv.v0b7.Ua4AWDMw5R4EqnD9rP7YxcCq2Rv5Siy',0,1757946206962);
INSERT INTO Benutzer VALUES(4,'Heini','$2b$10$lnsndtcUjxR4ZDCtOKTkWe/ma1wE1hWmFs2Mt48/qI12Q9NUdE2k6',0,1757953677403);
INSERT INTO Benutzer VALUES(12,'Admin','$2b$10$qxPcGLWXxZ7T.WggpKprUej1dB2XuygNg4foC8kz6P6VIYj1WeTBe',1,1758042643965);
CREATE TABLE IF NOT EXISTS "Artikel" (
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
CREATE TABLE IF NOT EXISTS "Mitglied" (
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
CREATE TABLE IF NOT EXISTS "Kasse" (
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
CREATE TABLE IF NOT EXISTS "Entnahme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datum" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "betragCents" INTEGER NOT NULL,
    "benutzerId" INTEGER,
    CONSTRAINT "Entnahme_benutzerId_fkey" FOREIGN KEY ("benutzerId") REFERENCES "Benutzer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('Benutzer',13);
CREATE UNIQUE INDEX "Benutzer_name_key" ON "Benutzer"("name");
CREATE UNIQUE INDEX "Artikel_artnr_key" ON "Artikel"("artnr");
CREATE UNIQUE INDEX "Mitglied_mitgliedsnr_key" ON "Mitglied"("mitgliedsnr");
COMMIT;

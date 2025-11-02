import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
try {
  const n = await p.benutzer.count();
  console.log("BENUTZER_COUNT", n);
} catch (e) {
  console.error("COUNT_ERR:", e);
} finally {
  await p.$disconnect();
}

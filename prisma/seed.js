const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  try {
    const hash = bcrypt.hashSync('admin', 10); // Passwort: admin
    await prisma.benutzer.upsert({
      where: { name: 'admin' },
      update: { kennwort: hash, istadmin: true },
      create: { name: 'admin', kennwort: hash, istadmin: true },
    });
    console.log('Admin angelegt:  Benutzer=admin  Passwort=admin');
  } finally {
    await prisma.$disconnect();
  }
})();

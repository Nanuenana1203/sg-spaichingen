// SGS Screenshot-Tool
// Aufruf: node manual/take-screenshots.js <benutzername> <passwort>
// Beispiel: node manual/take-screenshots.js "Admin" "meinpasswort"

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const OUT  = path.join(__dirname, 'screenshots');

const USER = process.argv[2];
const PASS = process.argv[3];

if (!USER || !PASS) {
  console.error('Verwendung: node manual/take-screenshots.js <benutzername> <passwort>');
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

async function shot(page, name, waitFor = null) {
  if (waitFor) await page.waitForSelector(waitFor, { timeout: 8000 }).catch(() => {});
  else await page.waitForTimeout(1200);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log('  ✓', name);
  return file;
}

async function login(page) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  // Felder befüllen – verschiedene mögliche Selektoren abfangen
  const nameField = page.locator('input[type="text"], input[placeholder*="Name"], input[placeholder*="name"], input:not([type="password"])').first();
  const passField = page.locator('input[type="password"]').first();
  await nameField.fill(USER);
  await passField.fill(PASS);
  await page.locator('button[type="submit"], button:has-text("Anmeld"), button:has-text("Login")').first().click();
  await page.waitForURL('**/dashboard**', { timeout: 10000 });
  console.log('  ✓ Login erfolgreich');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,  // Retina-Qualität
  });
  const page = await context.newPage();

  // CSS für sauberere Screenshots (Scrollbars ausblenden)
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = '::-webkit-scrollbar { display: none !important; }';
    document.head?.appendChild(style);
  });

  console.log('\nSGS Screenshot-Tool');
  console.log('===================\n');

  // ── Login-Seite ──────────────────────────────────────────────────────────
  console.log('[ Login ]');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await shot(page, '01-login');

  // ── Einloggen ────────────────────────────────────────────────────────────
  console.log('\n[ Anmelden ]');
  try {
    await login(page);
  } catch (e) {
    console.error('Login fehlgeschlagen:', e.message);
    await browser.close();
    process.exit(1);
  }

  // ── Dashboard ────────────────────────────────────────────────────────────
  console.log('\n[ Dashboard ]');
  await page.waitForTimeout(1500);
  await shot(page, '02-dashboard', 'h1');

  // ── Kunden ───────────────────────────────────────────────────────────────
  console.log('\n[ Kunden ]');
  await page.goto(`${BASE}/mitglieder`, { waitUntil: 'networkidle' });
  await shot(page, '03-kunden', 'table');

  // ── Artikel ──────────────────────────────────────────────────────────────
  console.log('\n[ Artikel ]');
  await page.goto(`${BASE}/artikel`, { waitUntil: 'networkidle' });
  await shot(page, '04-artikel', 'table');

  // ── Artikel Neu ──────────────────────────────────────────────────────────
  console.log('\n[ Artikel Neu ]');
  await page.goto(`${BASE}/artikel/neu`, { waitUntil: 'networkidle' });
  await shot(page, '05-artikel-neu', 'form');

  // ── Kasse ────────────────────────────────────────────────────────────────
  console.log('\n[ Kasse ]');
  await page.goto(`${BASE}/kasse`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Kacheln laden
  await shot(page, '06-kasse');

  // ── Kassenbuch ───────────────────────────────────────────────────────────
  console.log('\n[ Kassenbuch ]');
  await page.goto(`${BASE}/kassenbuch`, { waitUntil: 'networkidle' });
  await shot(page, '07-kassenbuch', 'select');

  // ── Kassenbestand ────────────────────────────────────────────────────────
  console.log('\n[ Kassenbestand ]');
  await page.goto(`${BASE}/kassenbestand`, { waitUntil: 'networkidle' });
  await shot(page, '08-kassenbestand');

  // ── Bahnbuchung (öffentlich) ─────────────────────────────────────────────
  console.log('\n[ Bahnbuchung ]');
  await page.goto(`${BASE}/bahnbuchung-public`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await shot(page, '09-bahnbuchung');

  // ── Dienstbuchung (öffentlich) ───────────────────────────────────────────
  console.log('\n[ Dienstbuchung ]');
  await page.goto(`${BASE}/dienstbuchung-public`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await shot(page, '10-dienstbuchung');

  // ── Admin: Bahnen ────────────────────────────────────────────────────────
  console.log('\n[ Admin: Bahnen ]');
  await page.goto(`${BASE}/bahnen`, { waitUntil: 'networkidle' });
  await shot(page, '11-bahnen', 'table, h1');

  // ── Admin: Zeitregeln ────────────────────────────────────────────────────
  console.log('\n[ Admin: Zeitregeln ]');
  await page.goto(`${BASE}/zeitregeln`, { waitUntil: 'networkidle' });
  await shot(page, '12-zeitregeln');

  // ── Admin: Dienste ───────────────────────────────────────────────────────
  console.log('\n[ Admin: Dienste ]');
  await page.goto(`${BASE}/dienste`, { waitUntil: 'networkidle' });
  await shot(page, '13-dienste', 'table, h1');

  // ── Admin: Benutzer ──────────────────────────────────────────────────────
  console.log('\n[ Admin: Benutzer ]');
  await page.goto(`${BASE}/benutzer`, { waitUntil: 'networkidle' });
  await shot(page, '14-benutzer', 'table, h1');

  // ── Admin: Passwort ──────────────────────────────────────────────────────
  console.log('\n[ Admin: Passwort ]');
  await page.goto(`${BASE}/passwort`, { waitUntil: 'networkidle' });
  await shot(page, '15-passwort', 'form');

  // ── Mitgliederverwaltung ─────────────────────────────────────────────────
  console.log('\n[ Mitgliederverwaltung ]');
  await page.goto(`${BASE}/mitgliederverwaltung`, { waitUntil: 'networkidle' });
  await shot(page, '16-mitgliederverwaltung');

  await browser.close();

  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.png'));
  console.log(`\n✅ Fertig! ${files.length} Screenshots gespeichert in: ${OUT}\n`);
  console.log('Nächster Schritt: node manual/generate-manual.js');
})();

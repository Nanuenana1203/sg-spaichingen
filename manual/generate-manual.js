// SGS Bedienungsanleitung – PDF Generator (mit echten Screenshots)
// Voraussetzung: node manual/take-screenshots.js <user> <pass>  muss zuerst laufen
// Aufruf: node manual/generate-manual.js
'use strict';
const PDFDocument = require('pdfkit');
const fs   = require('fs');
const path = require('path');

const SHOTS = path.join(__dirname, 'screenshots');
const OUT   = path.join(__dirname, 'SGS-Bedienungsanleitung.pdf');

// ─── Hilfsfunktion: Screenshot-Pfad ──────────────────────────────────────
function ss(name) {
  const p = path.join(SHOTS, `${name}.png`);
  return fs.existsSync(p) ? p : null;
}

// ─── PDF-Dokument ─────────────────────────────────────────────────────────
const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false });
doc.pipe(fs.createWriteStream(OUT));

const W = 595.28, H = 841.89, M = 36;

// ─── Farben ───────────────────────────────────────────────────────────────
const C = {
  cover:   '#1E3A5F',
  accent:  '#2563EB',
  bg:      '#F8FAFC',
  white:   '#FFFFFF',
  border:  '#E2E8F0',
  text:    '#1E293B',
  muted:   '#64748B',
  blue:    '#2563EB',
  green:   '#16A34A',
  red:     '#DC2626',
  amber:   '#D97706',
  violet:  '#7C3AED',
  teal:    '#0F766E',
};

// ─── Seitenzähler ─────────────────────────────────────────────────────────
let _pageNum = 0;

// ─── Basis-Helfer ─────────────────────────────────────────────────────────
function newPage(withChrome = true) {
  doc.addPage({ size: 'A4', margin: 0 });
  _pageNum++;
  doc.rect(0, 0, W, H).fill(C.bg);
  if (withChrome) { topBar(); bottomBar(); }
}

function topBar() {
  doc.rect(0, 0, W, 32).fill(C.cover);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
    .text('SGS Vereinssoftware – Bedienungsanleitung', M, 12, { width: W - M * 2, align: 'left' });
  doc.font('Helvetica').fontSize(8).fillColor('#93C5FD')
    .text(`Seite ${_pageNum}`, 0, 12, { width: W - M, align: 'right' });
}

function bottomBar() {
  doc.rect(0, H - 24, W, 24).fill(C.cover);
  doc.font('Helvetica').fontSize(7).fillColor('#64748B')
    .text('© SGS Vereinssoftware 2026 – Vertraulich', M, H - 15, { width: W - M * 2 });
}

// ─── Text-Helfer ──────────────────────────────────────────────────────────
function chapterHeader(num, title, color = C.cover) {
  const y = 40;
  doc.rect(M, y, W - M * 2, 36).fill(color);
  const label = num ? `${num}  ${title}` : title;
  doc.font('Helvetica-Bold').fontSize(15).fillColor('#FFFFFF')
    .text(label, M + 14, y + 10, { width: W - M * 2 - 14 });
  return y + 50;
}

function sectionHead(txt, y) {
  doc.font('Helvetica-Bold').fontSize(12).fillColor(C.text).text(txt, M, y);
  return y + 18;
}

function body(txt, y, opts = {}) {
  const x = opts.x ?? M;
  const w = opts.width ?? (W - M * 2);
  doc.font('Helvetica').fontSize(9.5).fillColor(C.text)
    .text(txt, x, y, { width: w, lineGap: 2.5, ...opts });
  return y + doc.heightOfString(txt, { width: w, lineGap: 2.5 }) + 7;
}

function infoBox(txt, y, bg = '#EFF6FF', accent = C.blue) {
  const w = W - M * 2;
  const th = doc.font('Helvetica').fontSize(9.5).heightOfString(txt, { width: w - 26, lineGap: 2.5 });
  const h = th + 18;
  doc.rect(M, y, w, h).fill(bg);
  doc.rect(M, y, 4, h).fill(accent);
  doc.font('Helvetica').fontSize(9.5).fillColor(C.text)
    .text(txt, M + 14, y + 9, { width: w - 26, lineGap: 2.5 });
  return y + h + 8;
}
function warnBox(txt, y)  { return infoBox(txt, y, '#FFFBEB', C.amber); }
function tipBox(txt, y)   { return infoBox(txt, y, '#F0FDF4', C.green); }
function dangerBox(txt, y){ return infoBox(txt, y, '#FEF2F2', C.red); }

function stepList(steps, y) {
  steps.forEach((s, i) => {
    doc.circle(M + 9, y + 7, 8).fill(C.blue);
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFF')
      .text(String(i + 1), M + 4, y + 3, { width: 12, align: 'center' });
    const h = doc.font('Helvetica').fontSize(9.5).heightOfString(s, { width: W - M * 2 - 26, lineGap: 2 });
    doc.font('Helvetica').fontSize(9.5).fillColor(C.text)
      .text(s, M + 24, y + 1, { width: W - M * 2 - 26, lineGap: 2 });
    y += Math.max(22, h + 10);
  });
  return y + 4;
}

function bulletList(items, y) {
  items.forEach(item => {
    doc.rect(M + 4, y + 5, 4, 4).fill(C.blue);
    const h = doc.font('Helvetica').fontSize(9.5).heightOfString(item, { width: W - M * 2 - 20, lineGap: 2 });
    doc.font('Helvetica').fontSize(9.5).fillColor(C.text)
      .text(item, M + 16, y, { width: W - M * 2 - 20, lineGap: 2 });
    y += Math.max(18, h + 6);
  });
  return y + 4;
}

// ─── Screenshot einbetten ────────────────────────────────────────────────
// Bettet ein Screenshot ein und gibt das Y nach dem Bild zurück.
// Das Bild wird auf maxWidth/maxHeight skaliert und mit einem Schatten-Rahmen versehen.
function embedScreenshot(file, y, opts = {}) {
  if (!file || !fs.existsSync(file)) {
    // Platzhalter wenn Screenshot fehlt
    const ph = opts.maxH ?? 180;
    doc.rect(M, y, W - M * 2, ph).fill('#E2E8F0');
    doc.font('Helvetica').fontSize(10).fillColor(C.muted)
      .text('(Screenshot nicht verfügbar – bitte take-screenshots.js ausführen)', M, y + ph / 2 - 10, { width: W - M * 2, align: 'center' });
    return y + ph + 12;
  }

  const maxW = opts.maxW ?? (W - M * 2);
  const maxH = opts.maxH ?? 420;
  const x = opts.x ?? M;

  // Bildgröße ermitteln (pdfkit gibt uns das bei image())
  // Wir benutzen fit: [maxW, maxH] damit das Bild nie größer als der verfügbare Platz wird
  const imgW = maxW;

  // Leichter Schatten-Rahmen
  doc.rect(x + 2, y + 2, imgW, maxH).fill('#00000011');
  // Bild
  doc.image(file, x, y, { fit: [maxW, maxH], align: 'left', valign: 'top' });

  // Tatsächliche Höhe ermitteln: pdfkit skaliert proportional, wir approximieren
  // (pdfkit gibt die tatsächliche Höhe nicht zurück, daher nutzen wir maxH als Worst-Case
  //  und fügen etwas Puffer hinzu)
  return y + maxH + 14;
}

// Kleines Screenshot-Bild (z.B. halbe Breite)
function embedSmall(file, y, label, opts = {}) {
  const w2 = opts.w ?? (W - M * 2);
  const h2 = opts.h ?? 200;
  if (label) {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(C.muted)
      .text(label, M, y, { width: w2 });
    y += 14;
  }
  return embedScreenshot(file, y, { maxW: w2, maxH: h2, ...opts });
}

// Caption unter einem Screenshot
function caption(txt, y) {
  doc.font('Helvetica').fontSize(8.5).fillColor(C.muted)
    .text(txt, M, y - 8, { width: W - M * 2, align: 'center' });
  return y + 6;
}

// ══════════════════════════════════════════════════════════════════════════
// TITELSEITE
// ══════════════════════════════════════════════════════════════════════════
doc.addPage({ size: 'A4', margin: 0 });
_pageNum++;
doc.rect(0, 0, W, H).fill(C.cover);
doc.rect(0, 0, W, 5).fill(C.accent);
doc.rect(0, H - 5, W, 5).fill(C.accent);

// Logo-Block
doc.rect(M, 130, W - M * 2, 100).fill('#163259');
doc.font('Helvetica-Bold').fontSize(54).fillColor('#FFFFFF').text('SGS', M + 28, 150);
doc.font('Helvetica').fontSize(20).fillColor('#93C5FD').text('Vereinssoftware', M + 28, 210);

// Trennlinie
doc.rect(M, 244, W - M * 2, 3).fill(C.accent);

// Titel
doc.font('Helvetica-Bold').fontSize(30).fillColor('#FFFFFF')
  .text('Bedienungsanleitung', M, 260, { width: W - M * 2, align: 'center' });
doc.font('Helvetica').fontSize(13).fillColor('#93C5FD')
  .text('Vollständiges Handbuch für alle Benutzer', M, 300, { width: W - M * 2, align: 'center' });

// Info-Box
doc.rect(M, 348, W - M * 2, 58).fill('#163259');
[['Version', '1.0'], ['Stand', 'März 2026'], ['Zielgruppe', 'Alle Benutzer']].forEach(([k, v], i) => {
  const bx = M + i * ((W - M * 2) / 3);
  const bw = (W - M * 2) / 3;
  doc.font('Helvetica').fontSize(9).fillColor('#93C5FD').text(k, bx, 361, { width: bw, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#FFFFFF').text(v, bx, 376, { width: bw, align: 'center' });
});

// Abschnitt "Für wen"
doc.rect(M, 430, W - M * 2, 105).fill('#163259');
doc.font('Helvetica-Bold').fontSize(10).fillColor('#93C5FD').text('Dieses Handbuch richtet sich an:', M + 18, 443);
[
  'Kassenpersonal – tägliche Buchungen und Kassenvorgänge',
  'Administratoren – Verwaltung von Benutzern, Artikeln und Einstellungen',
  'Mitgliederbetreuung – Kundenstamm und Buchungen',
].forEach((line, i) => {
  doc.rect(M + 26, 463 + i * 22, 4, 4).fill(C.accent);
  doc.font('Helvetica').fontSize(10).fillColor('#FFFFFF').text(line, M + 38, 460 + i * 22, { width: W - M * 2 - 50 });
});

doc.font('Helvetica').fontSize(8.5).fillColor('#334155')
  .text('Vertrauliches Dokument – Nur für interne Verwendung', M, H - 40, { width: W - M * 2, align: 'center' });

// ══════════════════════════════════════════════════════════════════════════
// INHALTSVERZEICHNIS
// ══════════════════════════════════════════════════════════════════════════
doc.addPage({ size: 'A4', margin: 0 });
_pageNum++;
doc.rect(0, 0, W, H).fill(C.bg);
topBar();
bottomBar();

doc.rect(M, 40, W - M * 2, 42).fill(C.cover);
doc.font('Helvetica-Bold').fontSize(20).fillColor('#FFFFFF').text('Inhaltsverzeichnis', M + 16, 52);

const toc = [
  ['1',    'Anmeldung',                        '4'],
  ['2',    'Dashboard',                        '5'],
  ['3',    'Kunden (Mitglieder)',               '6'],
  ['3.1',  'Kundenliste & Suche',              '6'],
  ['3.2',  'Kunden anlegen & bearbeiten',      '7'],
  ['4',    'Artikelverwaltung',                '8'],
  ['4.1',  'Artikelliste',                     '8'],
  ['4.2',  'Artikel anlegen & bearbeiten',     '9'],
  ['5',    'Kasse',                           '10'],
  ['5.1',  'Artikel buchen',                  '10'],
  ['5.2',  'Storno',                          '12'],
  ['6',    'Kassenbuch',                      '13'],
  ['7',    'Kassenbestand',                   '15'],
  ['8',    'Bahnbuchung',                     '16'],
  ['9',    'Dienstbuchung',                   '17'],
  ['10',   'Administration',                  '18'],
  ['10.1', 'Bahnen verwalten',               '18'],
  ['10.2', 'Zeitregeln',                     '19'],
  ['10.3', 'Dienste verwalten',              '19'],
  ['10.4', 'Benutzerverwaltung',             '20'],
  ['10.5', 'Passwort ändern',               '21'],
  ['11',   'Kurzreferenz & häufige Fragen',   '22'],
];

let ty = 96;
toc.forEach(([num, title, pg]) => {
  const isSub = num.includes('.');
  doc.font(isSub ? 'Helvetica' : 'Helvetica-Bold')
    .fontSize(isSub ? 10 : 11)
    .fillColor(isSub ? C.muted : C.text)
    .text(`${num}   ${title}`, M + (isSub ? 18 : 0), ty, { width: W - M * 2 - 40 });
  doc.font('Helvetica-Bold').fontSize(isSub ? 10 : 11).fillColor(C.blue)
    .text(pg, 0, ty, { width: W - M, align: 'right' });
  if (!isSub) {
    doc.lineWidth(0.4).moveTo(M, ty + 13).lineTo(W - M - 36, ty + 13)
      .strokeColor(C.border).dash(2, { space: 3 }).stroke().undash();
  }
  ty += isSub ? 17 : 23;
});

// ══════════════════════════════════════════════════════════════════════════
// 1 – ANMELDUNG
// ══════════════════════════════════════════════════════════════════════════
newPage();
let y = chapterHeader('1', 'Anmeldung');

y = body('Die Anmeldung erfolgt über die Startseite. Geben Sie Ihren Benutzernamen und Ihr Passwort ein und klicken Sie auf "Anmelden".', y);
y += 8;

y = embedScreenshot(ss('01-login'), y, { maxH: 340 });
y = caption('Anmeldemaske der SGS Vereinssoftware', y);

y = stepList([
  'Öffnen Sie die SGS-Software im Browser (Adresse von Ihrem Administrator).',
  'Geben Sie Ihren Benutzernamen ein.',
  'Geben Sie Ihr Passwort ein.',
  'Klicken Sie auf "Anmelden" – Sie werden zum Dashboard weitergeleitet.',
], y);

y = warnBox('Die Sitzung wird automatisch beendet, wenn das Browser-Fenster geschlossen wird. Melden Sie sich über den Abmelden-Button regulär ab.', y);
y = infoBox('Neue Benutzer können nur von einem Administrator angelegt werden.', y);

// ══════════════════════════════════════════════════════════════════════════
// 2 – DASHBOARD
// ══════════════════════════════════════════════════════════════════════════
newPage();
y = chapterHeader('2', 'Dashboard');

y = body('Das Dashboard ist die Startseite nach der Anmeldung. Es zeigt auf einen Blick die wichtigsten Kennzahlen sowie die heutigen Bahnbuchungen.', y);
y += 8;

y = embedScreenshot(ss('02-dashboard'), y, { maxH: 370 });
y = caption('Dashboard mit Kennzahlen und Bahnbuchungsübersicht', y);

y = sectionHead('Erklärung der Kennzahlen', y);
const dashItems = [
  ['Artikel',            'Gesamtanzahl aller im System hinterlegten Artikel.'],
  ['Mitglieder',         'Gesamtanzahl der Mitglieder, darunter die Neuzugänge im laufenden Monat.'],
  ['Kassenstand',        'Aktueller Kassensaldo aller bisherigen Ein- und Ausgaben.'],
  ['Einnahmen (Monat)',  'Summe aller positiven Kassenbuchungen im laufenden Monat.'],
  ['Ausgaben (Monat)',   'Summe aller negativen Buchungen (Stornos, Ausgaben) im laufenden Monat.'],
  ['Bahnbuchungen heute','Alle Bahnreservierungen des heutigen Tages mit Uhrzeit und Name.'],
];
dashItems.forEach(([k, v]) => {
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C.text).text(`${k}: `, M, y, { continued: true });
  doc.font('Helvetica').fontSize(9.5).fillColor(C.muted).text(v, { lineGap: 2 });
  y += 18;
});

y = tipBox('Das Dashboard wird bei jedem Aufruf live aktualisiert – Sie müssen die Seite nicht manuell neu laden.', y);

// ══════════════════════════════════════════════════════════════════════════
// 3 – KUNDEN
// ══════════════════════════════════════════════════════════════════════════
newPage();
y = chapterHeader('3', 'Kunden (Mitglieder)');

y = sectionHead('3.1  Kundenliste & Suche', y);
y = body('Unter "Kunden" finden Sie alle gespeicherten Mitglieder. Sie können nach Name, Mitgliedsnummer oder Ort suchen.', y);
y += 6;

y = embedScreenshot(ss('03-kunden'), y, { maxH: 320 });
y = caption('Kundenliste mit Suchfunktion', y);

y = bulletList([
  'Suchfeld: Mindestens 1 Zeichen eingeben – die Liste filtert automatisch nach Nr., Name und Ort.',
  'Bearbeiten: Klick auf das Bearbeiten-Symbol öffnet den Datensatz.',
  'Löschen: Nur für Administratoren sichtbar.',
], y);

// Zweite Kunden-Seite
newPage();
y = chapterHeader('3', 'Kunden (Mitglieder)', C.blue);
y = sectionHead('3.2  Kunden anlegen & bearbeiten', y);
y = body('Klicken Sie auf "+ Neuer Kunde" oder das Bearbeiten-Symbol. Das Formular gilt für beide Aktionen.', y);
y += 6;

y = embedScreenshot(ss('16-mitgliederverwaltung'), y, { maxH: 340 });
y = caption('Kundenformular – Anlegen und Bearbeiten', y);

y = sectionHead('Preisgruppen', y);
const pg = [
  ['1', 'Gast / Nicht-Mitglied'],
  ['2', 'Mitglied ohne Aufsicht'],
  ['3', 'Mitglied mit Aufsicht'],
  ['4', 'Mitglied mit Jahreskarte'],
  ['5–9', 'Weitere individuelle Gruppen'],
];
const pgW = (W - M * 2 - 10) / 2;
pg.forEach(([nr, bez], i) => {
  const px = M + (i % 2) * (pgW + 10);
  const py2 = y + Math.floor(i / 2) * 26;
  doc.rect(px, py2, pgW, 20).fill(C.white)
    .rect(px, py2, pgW, 20).lineWidth(0.5).strokeColor(C.border).stroke();
  doc.rect(px, py2, 3, 20).fill(C.blue);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.blue).text(`Gr. ${nr}`, px + 8, py2 + 5, { width: 45 });
  doc.font('Helvetica').fontSize(9).fillColor(C.text).text(bez, px + 58, py2 + 5, { width: pgW - 66 });
});
y += Math.ceil(pg.length / 2) * 26 + 10;
y = infoBox('Die Preisgruppe bestimmt, welcher Preis beim Kassiervorgang automatisch ausgewählt wird (Preis 1 = Gruppe 1 usw.).', y);

// ══════════════════════════════════════════════════════════════════════════
// 4 – ARTIKEL
// ══════════════════════════════════════════════════════════════════════════
newPage();
y = chapterHeader('4', 'Artikelverwaltung');

y = sectionHead('4.1  Artikelliste', y);
y = body('Unter "Artikel" verwalten Sie den Artikelstamm. Jeder Artikel kann einer Gruppe zugeordnet und als Kachel in der Kasse angezeigt werden.', y);
y += 6;

y = embedScreenshot(ss('04-artikel'), y, { maxH: 330 });
y = caption('Artikelliste mit Gruppe und Preis', y);

y = bulletList([
  'Spalte "Gruppe": Sport / Munition / Scheiben / Sonstiges – für Filterung im Kassenbuch.',
  'Spalte "Preis 1": Standardpreis (Gäste). Weitere Preise werden beim Kassieren automatisch nach Preisgruppe des Mitglieds gewählt.',
  'Suchfeld: Filtert nach Artikelnummer oder Bezeichnung.',
], y);

newPage();
y = chapterHeader('4', 'Artikelverwaltung', C.blue);
y = sectionHead('4.2  Artikel anlegen & bearbeiten', y);
y = body('Klicken Sie auf "+ Neuer Artikel" für einen neuen Datensatz, oder auf das Bearbeiten-Symbol bei einem vorhandenen.', y);
y += 6;

y = embedScreenshot(ss('05-artikel-neu'), y, { maxH: 360 });
y = caption('Artikelformular – alle Felder im Überblick', y);

y = bulletList([
  'Art.-Nr.: Eindeutige Artikelnummer (optional, aber empfohlen).',
  'Bezeichnung: Pflichtfeld – erscheint in der Kasse und im Kassenbuch.',
  'Artikelgruppe: Sport / Munition / Scheiben / Sonstiges – für Kassenbuch-Filter.',
  'Preis 1–9: Je ein Preis für jede Kundengruppe. Preis 1 = Gäste.',
  'Als Kachel anzeigen: Aktiviert die Kachel-Ansicht in der Kasse.',
], y);

// ══════════════════════════════════════════════════════════════════════════
// 5 – KASSE
// ══════════════════════════════════════════════════════════════════════════
newPage();
y = chapterHeader('5', 'Kasse');

y = sectionHead('5.1  Artikel buchen', y);
y = body('Die Kasse ist das zentrale Werkzeug für Kassierungen. Vor dem Kassieren muss zwingend ein Mitglied ausgewählt werden – ohne Mitglied ist kein Kassiervorgang möglich.', y);
y += 6;

y = embedScreenshot(ss('06-kasse'), y, { maxH: 390 });
y = caption('Kassen-Maske mit Mitgliedersuche, Kacheln und Warenkorb', y);

newPage();
y = chapterHeader('5', 'Kasse', C.blue);
y = sectionHead('Schritt für Schritt – Kassenvorgang', y);
y += 4;
y = stepList([
  'Mitglied auswählen (Pflicht): Tippen Sie im Suchfeld oben mindestens 3 Zeichen des Namens oder der Mitgliedsnummer. Wählen Sie das Mitglied aus der Trefferliste und klicken Sie auf "Übernehmen". Der Preis passt sich automatisch an die Preisgruppe des Mitglieds an.',
  'Artikel hinzufügen: Klicken Sie auf eine Kachel oder suchen Sie über das Artikelsuchfeld. Der Artikel erscheint im Warenkorb rechts.',
  'Menge prüfen: Im Warenkorb können Sie die Menge anpassen.',
  'Bezahlen: Klicken Sie auf "Bezahlen". Der Vorgang wird gespeichert und der Warenkorb geleert.',
], y);

y = dangerBox('Wichtig: Ohne ausgewähltes Mitglied kann kein Kassiervorgang abgeschlossen werden. Das Mitglied muss immer zuerst ausgewählt werden.', y);

y = sectionHead('5.2  Storno', y);
y = body('Aktivieren Sie den Storno-Modus über den roten Button unten. Buchen Sie die gleichen Artikel wie beim ursprünglichen Vorgang – der Betrag wird negativ gebucht.', y);
y = dangerBox('Ein Storno kann nicht rückgängig gemacht werden. Prüfen Sie vorher genau, welche Artikel storniert werden sollen.', y);

// ══════════════════════════════════════════════════════════════════════════
// 6 – KASSENBUCH
// ══════════════════════════════════════════════════════════════════════════
newPage();
y = chapterHeader('6', 'Kassenbuch');

y = body('Das Kassenbuch zeigt alle Kassenvorgänge tabellarisch. Filtern Sie nach Zeitraum, Mitglied, Artikelgruppe oder Artikelnummer-Bereich.', y);
y += 6;

y = embedScreenshot(ss('07-kassenbuch'), y, { maxH: 400 });
y = caption('Kassenbuch mit Filter-Optionen', y);

newPage();
y = chapterHeader('6', 'Kassenbuch', C.blue);
y = sectionHead('Filter im Detail', y);
y += 6;

const kbFilters = [
  ['Datum von / bis',   'Schränkt den Zeitraum ein. Standard: 1. Januar bis heute.'],
  ['Mitglied',          'Filtert nach einem Mitglied. Mindestens 3 Zeichen tippen, dann aus der Trefferliste wählen und "Übernehmen" klicken.'],
  ['Artikelgruppe',     'Zeigt nur Buchungen einer Gruppe: Sport / Munition / Scheiben / Sonstiges.'],
  ['Art.-Nr. von',      'Startpunkt der Artikelnummer-Filterung. Tippen Sie eine Zahl oder Bezeichnung – es erscheint eine Auswahlliste aus dem Artikelstamm.'],
  ['Art.-Nr. bis',      'Endpunkt der Filterung. Kombiniert mit "von" werden alle Artikel im Bereich angezeigt.'],
];
kbFilters.forEach(([k, v]) => {
  const h5 = Math.max(36, doc.font('Helvetica').fontSize(9.5).heightOfString(v, { width: W - M * 2 - 150, lineGap: 2 }) + 16);
  doc.rect(M, y, W - M * 2, h5).fill(C.white)
    .rect(M, y, W - M * 2, h5).lineWidth(0.5).strokeColor(C.border).stroke()
    .rect(M, y, 4, h5).fill(C.blue);
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C.text).text(k, M + 14, y + (h5 - 14) / 2, { width: 130 });
  doc.font('Helvetica').fontSize(9.5).fillColor(C.muted).text(v, M + 148, y + 8, { width: W - M * 2 - 158, lineGap: 2 });
  y += h5 + 6;
});

y += 6;
y = tipBox('CSV-Export: Klicken Sie auf "Exportieren (CSV)" um die aktuelle Ansicht als CSV-Datei herunterzuladen (kompatibel mit Excel und LibreOffice).', y);
y = infoBox('Klicken Sie nach jeder Filteränderung auf "Anzeigen" um die Tabelle zu aktualisieren.', y);

// ══════════════════════════════════════════════════════════════════════════
// 7 – KASSENBESTAND
// ══════════════════════════════════════════════════════════════════════════
newPage();
y = chapterHeader('7', 'Kassenbestand');

y = body('Der Kassenbestand dient zur Kontrolle, ob die tatsächliche Kasse mit dem Systemsaldo übereinstimmt. Der Kassierer zählt die vorhandenen Münzen und Scheine und trägt die jeweiligen Beträge ein – die Software berechnet daraus den Gesamtbetrag und zeigt ab, ob dieser mit dem Systemsaldo übereinstimmt.', y);
y += 6;

y = embedScreenshot(ss('08-kassenbestand'), y, { maxH: 380 });
y = caption('Kassenbestand – Zählung von Münzen und Scheinen', y);

y = stepList([
  'Zählen Sie alle vorhandenen Münzen und Scheine in der Kasse.',
  'Tragen Sie die Anzahl für jeden Münz- und Scheinwert in die entsprechenden Felder ein.',
  'Die Software berechnet automatisch den Gesamtbetrag.',
  'Der Vergleich mit dem Systemsaldo zeigt, ob die Kasse stimmt (Differenz = 0,00 €) oder ob eine Abweichung besteht.',
], y);

y = infoBox('Diese Funktion dient ausschließlich zur Kontrolle. Sie verändert den Kassenstand im System nicht.', y);

// ══════════════════════════════════════════════════════════════════════════
// 8 – BAHNBUCHUNG
// ══════════════════════════════════════════════════════════════════════════
newPage();
y = chapterHeader('8', 'Bahnbuchung');

y = body('Über die Bahnbuchung können Schießstände reserviert werden. Die Seite ist auch ohne Login öffentlich erreichbar (/bahnbuchung-public).', y);
y += 6;

y = embedScreenshot(ss('09-bahnbuchung'), y, { maxH: 380 });
y = caption('Bahnbuchung – Tagesübersicht mit freien (weiß) und belegten (rot) Slots', y);

y = stepList([
  'Datum wählen über den Kalender oben auf der Seite.',
  'Freie Slots werden weiß angezeigt, belegte Slots rot.',
  'Auf einen freien Slot klicken um ihn zu buchen.',
  'Name und E-Mail-Adresse eingeben (beide Felder sind Pflichtfelder) und bestätigen.',
  'Storno: Auf einen eigenen roten Slot klicken und "Stornieren" wählen.',
], y);

y = infoBox('Die öffentliche Seite zeigt keine persönlichen Daten anderer Nutzer. Sie ist für einen Empfangs- oder Aushang-Bildschirm geeignet.', y);

// ══════════════════════════════════════════════════════════════════════════
// 9 – DIENSTBUCHUNG
// ══════════════════════════════════════════════════════════════════════════
newPage();
y = chapterHeader('9', 'Dienstbuchung');

y = body('Mitglieder und Interessierte können sich über die Dienstbuchung für Veranstaltungen, Kurse und Dienste anmelden. Die Seite ist öffentlich erreichbar.', y);
y += 6;

y = embedScreenshot(ss('10-dienstbuchung'), y, { maxH: 360 });
y = caption('Öffentliche Dienstbuchungsseite', y);

y = stepList([
  'Gewünschten Dienst (Kurs, Veranstaltung) aus der Liste auswählen.',
  'Auf "Anmelden" klicken.',
  'Namen und Telefonnummer eingeben, bestätigen.',
  'Storno: /dienstbuchung-storno aufrufen, Namen eingeben und den Eintrag auswählen.',
], y);

y = infoBox('Wenn alle Plätze belegt sind, erscheint ein entsprechender Hinweis. Die Verwaltung von Diensten erfolgt durch Administratoren unter Admin → Dienste.', y);

// ══════════════════════════════════════════════════════════════════════════
// 10 – ADMINISTRATION
// ══════════════════════════════════════════════════════════════════════════
newPage();
y = chapterHeader('10', 'Administration', C.violet);

y = warnBox('Alle Funktionen in diesem Kapitel sind ausschließlich für Administratoren zugänglich.', y);
y += 8;

y = sectionHead('10.1  Bahnen verwalten', y);
y = body('Unter "Bahnen" werden die verfügbaren Schießstände und Bahnen angelegt und verwaltet.', y);
y += 6;

y = embedScreenshot(ss('11-bahnen'), y, { maxH: 300 });
y = caption('Bahnverwaltung – Liste aller Bahnen', y);

y = bulletList([
  'Nummer: Wird in der Bahnbuchung angezeigt.',
  'Name: Beschreibender Name (z.B. "Schießstand A").',
  'Löschen einer Bahn entfernt auch alle zugehörigen Buchungen.',
], y);

newPage();
y = chapterHeader('10', 'Administration', C.violet);

y = sectionHead('10.2  Zeitregeln', y);
y = body('Zeitregeln legen fest, wann und wie lange eine Bahn buchbar ist. Pro Bahn können mehrere Regeln mit verschiedenen Zeitfenstern definiert werden.', y);
y += 6;

y = bulletList([
  'Gültigkeitszeitraum: Ab welchem Datum die Regel gilt.',
  'Wochentage: An welchen Tagen die Bahn buchbar ist.',
  'Buchungszeiten: Früheste und späteste Startzeit.',
  'Mindest-/Maximaldauer: In Minuten.',
], y);

y += 10;
y = sectionHead('10.3  Dienste verwalten', y);
y = body('Administratoren legen hier Veranstaltungen und Kurse an, für die sich Mitglieder öffentlich anmelden können.', y);
y += 6;

y = embedScreenshot(ss('13-dienste'), y, { maxH: 250 });
y = caption('Dienstverwaltung – Übersicht und Buchungsstand', y);

newPage();
y = chapterHeader('10', 'Administration', C.violet);

y = stepList([
  'Klicken Sie auf "+ Neuer Dienst" und geben Sie Titel und Beschreibung ein.',
  'Speichern Sie den Dienst.',
  'Fügen Sie Zeitslots hinzu: Datum, Uhrzeit und maximale Teilnehmerzahl festlegen.',
  'Setzen Sie den Dienst auf "Aktiv" damit er öffentlich buchbar ist.',
], y);

y += 8;
y = sectionHead('10.4  Benutzerverwaltung', y);
y = body('Hier verwalten Sie alle Benutzer die Zugang zur Software haben.', y);
y += 6;

y = embedScreenshot(ss('14-benutzer'), y, { maxH: 280 });
y = caption('Benutzerverwaltung', y);

y = bulletList([
  'Name: Anzeigename (wird beim Login verwendet).',
  'Admin: Administratoren haben Zugriff auf alle Funktionen.',
  'Rechner-Freigabe: Jeder Computer muss einmalig durch einen Admin freigegeben werden.',
  'Benutzer löschen entfernt die Anmeldedaten – Kassenbuchungen bleiben erhalten.',
], y);

y = infoBox('Neuer Benutzer: "+ Neuer Benutzer" klicken, Name und Passwort vergeben. Der Benutzer kann sein Passwort danach selbst ändern.', y);

newPage();
y = chapterHeader('10', 'Administration', C.violet);

y = sectionHead('10.5  Passwort ändern', y);
y = body('Jeder Benutzer kann sein eigenes Passwort unter "Passwort" in der Navigation ändern.', y);
y += 6;

y = embedScreenshot(ss('15-passwort'), y, { maxH: 320 });
y = caption('Passwort-Änderungsformular', y);

y = stepList([
  'Aktuelles Passwort eingeben.',
  'Neues Passwort eingeben (mindestens 8 Zeichen empfohlen).',
  'Neues Passwort zur Bestätigung wiederholen.',
  'Auf "Passwort ändern" klicken.',
], y);

y = infoBox('Administratoren können auch Passwörter anderer Benutzer zurücksetzen.', y);

// ══════════════════════════════════════════════════════════════════════════
// 11 – KURZREFERENZ
// ══════════════════════════════════════════════════════════════════════════
newPage();
y = chapterHeader('11', 'Kurzreferenz – Häufige Fragen', C.teal);

const faqs = [
  ['Ich kann mich nicht anmelden.',
   'Prüfen Sie Benutzername und Passwort. Möglicherweise muss Ihr Computer erst durch einen Administrator freigegeben werden (Rechner-Freigabe).'],
  ['Warum sehe ich nicht alle Menüpunkte?',
   'Admin-Funktionen (Bahnen, Dienste, Benutzer etc.) sind nur für Administratoren sichtbar.'],
  ['Wie storniere ich einen Kassenvorgang?',
   'Kasse öffnen → roten Storno-Button aktivieren → gleiche Artikel wie beim Original buchen → "Bezahlen" klicken.'],
  ['Wie exportiere ich das Kassenbuch?',
   'Im Kassenbuch auf "Exportieren (CSV)" klicken. Die Datei kann in Excel oder LibreOffice geöffnet werden.'],
  ['Ein Artikel erscheint nicht als Kachel in der Kasse.',
   'Prüfen Sie in der Artikelverwaltung, ob "Als Kachel anzeigen" aktiviert ist. Alternativ über das Artikelsuchfeld in der Kasse suchen.'],
  ['Wie ändere ich die Artikelgruppe?',
   'Artikelverwaltung öffnen → Bearbeiten-Symbol klicken → Dropdown "Artikelgruppe" ändern → Speichern.'],
  ['Wie filtere ich das Kassenbuch nach Artikelnummer?',
   'Im Kassenbuch die Felder "Art.-Nr. von" und "Art.-Nr. bis" ausfüllen. Ein Tipp-Dropdown zeigt passende Artikel aus dem Stamm an.'],
  ['Wie lege ich eine neue Bahn an?',
   'Admin → Bahnen → "+ Neue Bahn". Danach unter Zeitregeln die Buchungszeiten festlegen.'],
  ['Wie melde ich mich ab?',
   'Dashboard-Seite öffnen → oben rechts auf das Benutzer-Icon klicken → "Abmelden". Die Sitzung endet auch automatisch beim Schließen des Browsers.'],
  ['Was ist die öffentliche Bahnbuchungsseite?',
   'Die Adresse /bahnbuchung-public ist ohne Login zugänglich, z.B. für einen Bildschirm im Empfangsbereich. Persönliche Daten anderer werden nicht angezeigt.'],
];

faqs.forEach(([frage, antwort]) => {
  const h6 = Math.max(46, doc.font('Helvetica').fontSize(9.5).heightOfString(antwort, { width: W - M * 2 - 160, lineGap: 2 }) + 20);
  if (y + h6 > H - 40) {
    bottomBar();
    newPage();
    y = chapterHeader('11', 'Kurzreferenz – Häufige Fragen', C.teal);
  }
  doc.rect(M, y, W - M * 2, h6).fill(C.white)
    .rect(M, y, W - M * 2, h6).lineWidth(0.5).strokeColor(C.border).stroke()
    .rect(M, y, 4, h6).fill(C.teal);
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C.text)
    .text('F: ' + frage, M + 14, y + 8, { width: 148 });
  doc.font('Helvetica').fontSize(9.5).fillColor(C.muted)
    .text('A: ' + antwort, M + 166, y + 8, { width: W - M * 2 - 176, lineGap: 2 });
  y += h6 + 6;
});

bottomBar();

// ─── Abschluss ────────────────────────────────────────────────────────────
doc.end();
console.log(`\n✅ PDF erstellt: ${OUT}`);
console.log(`   Seiten: wird beim Öffnen angezeigt\n`);

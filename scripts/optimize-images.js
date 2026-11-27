'use strict';

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const SOURCE_DIR = path.join(__dirname, '..', 'photo-sources');
const OUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'img');

// Each output key points to a photograph collected from the church's own
// public channels. See photo-sources/SOURCES.md for the exact source of each file.
const MAP = {
  hero: 'hero.jpg',
  exterior: 'exterior.jpg',
  welcome: 'welcome.jpg',
  pastor: 'pastor.jpg',
  choir: 'choir.jpg',
  prayer: 'prayer.jpg',
  'bible-study': 'bible-study.jpg',
  outreach: 'outreach.jpg',
  youth: 'youth.jpg',
  women: 'women.jpg',
  worship: 'worship.jpg',
  preaching: 'preaching.jpg',
};

const WIDTHS = [480, 800, 1200, 1600];

fs.mkdirSync(OUT_DIR, { recursive: true });

function sourcePath(file) {
  const full = path.join(SOURCE_DIR, file);
  if (!fs.existsSync(full)) throw new Error(`Missing source photograph: ${file}`);
  return full;
}

(async () => {
  for (const [outKey, file] of Object.entries(MAP)) {
    const source = sourcePath(file);
    const meta = await sharp(source).metadata();
    for (const width of WIDTHS) {
      const resized = sharp(source).resize({ width });
      await Promise.all([
        resized.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT_DIR, `${outKey}-${width}.jpg`)),
        resized.clone().webp({ quality: 78, effort: 5 }).toFile(path.join(OUT_DIR, `${outKey}-${width}.webp`)),
      ]);
    }
    console.log(`optimized ${outKey} (source ${meta.width}x${meta.height})`);
  }

  // Social sharing image (1200x630 crop of the hero photograph).
  await sharp(sourcePath(MAP.hero))
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(OUT_DIR, 'og-image.jpg'));

  console.log('done');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

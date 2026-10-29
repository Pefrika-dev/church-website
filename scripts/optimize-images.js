'use strict';

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const SOURCE_DIR = path.join(__dirname, '..', 'vibe_images');
const OUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'img');

const MAP = {
  'hero-worship': 'hero',
  'community-welcome': 'welcome',
  'pastor-portrait': 'pastor',
  'gospel-choir': 'choir',
  'prayer-bible': 'prayer',
  'bible-study': 'bible-study',
  'community-outreach': 'outreach',
  'youth-fellowship': 'youth',
  'womens-fellowship': 'women',
  'church-exterior': 'exterior',
  'hands-raised': 'worship',
  'preaching': 'preaching',
};

const WIDTHS = [480, 800, 1200, 1600];

fs.mkdirSync(OUT_DIR, { recursive: true });

function findSource(prefix) {
  const file = fs
    .readdirSync(SOURCE_DIR)
    .find((name) => name.startsWith(prefix + '_') && name.endsWith('.png'));
  if (!file) throw new Error(`Missing source image for ${prefix}`);
  return path.join(SOURCE_DIR, file);
}

(async () => {
  for (const [srcKey, outKey] of Object.entries(MAP)) {
    const source = findSource(srcKey);
    const meta = await sharp(source).metadata();
    for (const width of WIDTHS) {
      if (width > meta.width) continue;
      const base = sharp(source).resize({ width, withoutEnlargement: true });
      await Promise.all([
        base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT_DIR, `${outKey}-${width}.jpg`)),
        base.clone().webp({ quality: 78, effort: 5 }).toFile(path.join(OUT_DIR, `${outKey}-${width}.webp`)),
      ]);
    }
    console.log(`optimized ${outKey} (${meta.width}x${meta.height})`);
  }

  // Social sharing image (1200x630 crop of the hero)
  const hero = findSource('hero-worship');
  await sharp(hero).resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(OUT_DIR, 'og-image.jpg'));

  console.log('done');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

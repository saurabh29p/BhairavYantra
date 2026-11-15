/**
 * Screenshots for pull requests: each page at desktop and phone width, light and dark.
 *
 * Usage: npm run screenshots -- <build dir> <out dir> /path/ [/path/ ...]
 * e.g.   npm run screenshots -- dist docs/screenshots/phase-0 / /devata/
 * Set CHROMIUM_PATH to use a preinstalled Chromium.
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { serve } from './lib/site';

const [dir = 'dist', out = 'screenshots', ...paths] = process.argv.slice(2);
if (paths.length === 0) paths.push('/');
mkdirSync(out, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900, isMobile: false },
  { name: 'phone', width: 390, height: 844, isMobile: true },
] as const;

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const { url, server } = await serve(dir);
const slug = (p: string) => p.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';

for (const vp of VIEWPORTS) {
  for (const scheme of ['light', 'dark'] as const) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      colorScheme: scheme,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    for (const p of paths) {
      await page.goto(url + p, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const file = path.join(out, `${slug(p)}-${vp.name}-${scheme}.jpg`);
      await page.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: 70 });
      console.log(file);
    }
    await context.close();
  }
}
server.close();
await browser.close();

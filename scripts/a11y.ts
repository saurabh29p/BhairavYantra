/**
 * Accessibility check with axe-core (WCAG 2.1 A/AA) on every built page, in light and dark
 * mode, at desktop and phone widths.
 *
 * Usage: npm run check:a11y -- dist [dist-fixtures ...]
 * Set CHROMIUM_PATH to use a preinstalled Chromium instead of Playwright's download.
 */
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { pagesIn, serve } from './lib/site';

const dirs = process.argv.slice(2);
if (dirs.length === 0) dirs.push('dist');

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 390, height: 844 },
] as const;
const SCHEMES = ['light', 'dark'] as const;

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
let violations = 0;
let runs = 0;

for (const dir of dirs) {
  const { url, server } = await serve(dir);
  try {
    for (const vp of VIEWPORTS) {
      for (const scheme of SCHEMES) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: scheme,
          reducedMotion: 'reduce',
        });
        const page = await context.newPage();
        for (const p of pagesIn(dir)) {
          await page.goto(url + p, { waitUntil: 'load' });
          await page.evaluate(() => document.fonts.ready);
          const result = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();
          runs++;
          for (const v of result.violations) {
            violations++;
            console.error(`  ✗ ${dir}${p} [${vp.name}, ${scheme}] ${v.id}: ${v.help}`);
            for (const n of v.nodes.slice(0, 3)) console.error(`      ${n.target.join(' ')} — ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`);
          }
          // No horizontal scrolling at phone width.
          if (vp.name === 'phone') {
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            if (overflow > 0) {
              violations++;
              console.error(`  ✗ ${dir}${p} [phone, ${scheme}] page scrolls sideways by ${overflow}px`);
            }
          }
        }
        await context.close();
      }
    }
  } finally {
    server.close();
  }
}
await browser.close();

if (violations > 0) {
  console.error(`\nAccessibility check failed: ${violations} problem${violations === 1 ? '' : 's'} in ${runs} page checks.`);
  process.exit(1);
}
console.log(`Accessibility check passed: ${runs} page checks (light + dark, desktop + phone), no WCAG 2.1 AA violations.`);

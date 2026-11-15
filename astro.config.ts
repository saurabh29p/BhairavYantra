import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import contentIntegrity from './src/integrations/content-integrity';
import pagefindIndex from './src/integrations/pagefind';

// The site's domain is still an open decision (CLAUDE.md), so `site` is not set yet.
export default defineConfig({
  trailingSlash: 'always',
  build: { format: 'directory' },
  outDir: process.env.BY_OUT_DIR ?? 'dist',
  integrations: [contentIntegrity(), mdx(), pagefindIndex()],
});

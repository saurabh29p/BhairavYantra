/**
 * Builds the Pagefind search index after `astro build` (concept §11). Only content inside
 * elements marked data-pagefind-body is indexed, so headers, footers and the search page
 * itself are left out.
 */
import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import * as pagefind from 'pagefind';

export default function pagefindIndex(): AstroIntegration {
  return {
    name: 'bhairavyantra:pagefind',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const site = fileURLToPath(dir);
        const { index, errors } = await pagefind.createIndex({});
        if (!index) throw new Error(`Pagefind: ${errors.join('; ')}`);
        const added = await index.addDirectory({ path: site });
        if (added.errors.length) throw new Error(`Pagefind: ${added.errors.join('; ')}`);
        const written = await index.writeFiles({ outputPath: `${site}/pagefind` });
        if (written.errors.length) throw new Error(`Pagefind: ${written.errors.join('; ')}`);
        await pagefind.close();
        logger.info(`Search index built: ${added.page_count} pages.`);
      },
    },
  };
}

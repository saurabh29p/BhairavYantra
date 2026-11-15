/**
 * Runs the content schema and integrity check before every `astro build`, so the build fails
 * on an uncited claim, an unknown citation key, a wrong grade or an image without a record.
 * In `astro dev` the same problems are logged as errors without stopping the server.
 */
import type { AstroIntegration } from 'astro';
import { checkContent, formatIssues } from '../lib/content-check';
import { contentRoot } from '../schemas';

export default function contentIntegrity(): AstroIntegration {
  const run = () => {
    const root = contentRoot();
    const { issues } = checkContent(root);
    return { root, issues };
  };
  return {
    name: 'bhairavyantra:content-integrity',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const { root, issues } = run();
        if (issues.length > 0) {
          throw new Error(
            `Content check failed for ${root}/ (${issues.length} problem${issues.length === 1 ? '' : 's'}):\n${formatIssues(issues)}`,
          );
        }
        logger.info(`Content check passed for ${root}/.`);
      },
      'astro:server:start': ({ logger }) => {
        const { root, issues } = run();
        if (issues.length > 0) logger.error(`Content check failed for ${root}/:\n${formatIssues(issues)}`);
      },
    },
  };
}

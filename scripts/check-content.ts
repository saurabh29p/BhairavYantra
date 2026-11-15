/** Schema and integrity check for content/. Usage: npm run check:content */
import { checkContent, formatIssues } from '../src/lib/content-check';
import { contentRoot } from '../src/schemas';

const root = process.argv[2] ?? contentRoot();
const { issues, entries } = checkContent(root);
const counts = Object.entries(entries)
  .map(([k, v]) => `${k} ${v.length}`)
  .join(', ');

if (issues.length > 0) {
  console.error(`Content check failed for ${root}/ (${issues.length} problem${issues.length === 1 ? '' : 's'}):\n`);
  console.error(formatIssues(issues));
  process.exit(1);
}
console.log(`Content check passed for ${root}/: ${counts}.`);

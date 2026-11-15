/** Helpers shared by the link, accessibility and screenshot scripts. */
import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import path from 'node:path';

/** All HTML files in a build folder, as site paths ("/devata/"). */
export function pagesIn(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const p = path.join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith('.html')) {
        const rel = '/' + path.relative(dir, p).split(path.sep).join('/');
        out.push(rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel);
      }
    }
  };
  walk(dir);
  return out.sort();
}

/** Resolves a site path to a file in the build folder, as a static host would. */
export function resolveFile(dir: string, sitePath: string): string | undefined {
  const clean = decodeURIComponent(sitePath.split(/[?#]/)[0] ?? '/');
  const root = path.resolve(dir);
  const base = path.join(root, clean);
  if (base !== root && !base.startsWith(root + path.sep)) return undefined;
  const candidates = clean.endsWith('/') ? [path.join(base, 'index.html')] : [base, `${base}.html`];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile());
}

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

/** A minimal static server for a build folder, on a free port. */
export async function serve(dir: string): Promise<{ url: string; server: Server }> {
  const root = path.resolve(dir);
  const server = createServer((req, res) => {
    const file = resolveFile(root, req.url ?? '/');
    if (!file) {
      res.writeHead(404, { 'content-type': TYPES['.html']! });
      const notFound = path.join(root, '404.html');
      return existsSync(notFound) ? createReadStream(notFound).pipe(res) : res.end('Not found');
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('Could not start server');
  return { url: `http://127.0.0.1:${addr.port}`, server };
}

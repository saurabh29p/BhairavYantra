/**
 * Prepares the HTML of an owner's Markdown document (docs/) for a site page WITHOUT changing
 * its wording:
 *  - gives chosen headings stable ids (e.g. "grades" for the evidence-grade section),
 *  - unlinks relative links to .md files that are not pages on the site (the text stays),
 *  - marks elements whose text is mostly Devanāgarī as lang="hi", so they get the Hindi
 *    typeface and line height.
 */
const DEV = /\p{Script=Devanagari}/gu;
const LAT = /\p{Script=Latin}/gu;

export interface DocOptions {
  /** heading text pattern → id */
  anchors?: Array<{ match: RegExp; id: string }>;
}

function textOf(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

export function prepareDocHtml(html: string, opts: DocOptions = {}): string {
  let out = html;

  for (const { match, id } of opts.anchors ?? []) {
    out = out.replace(/<(h[1-6])(\s[^>]*)?>([\s\S]*?)<\/\1>/g, (whole, tag: string, attrs = '', inner: string) => {
      if (!match.test(textOf(inner))) return whole;
      const rest = String(attrs).replace(/\sid="[^"]*"/, '');
      return `<${tag} id="${id}"${rest}>${inner}</${tag}>`;
    });
  }

  // Relative links to Markdown files: keep the words, drop the link.
  out = out.replace(/<a\s+href="(?!https?:|mailto:|#|\/)([^"]*\.md(?:#[^"]*)?)"[^>]*>([\s\S]*?)<\/a>/g, '$2');

  // Mostly-Devanāgarī blocks get lang="hi".
  out = out.replace(/<(p|li|td|th|em)(\s[^>]*)?>([\s\S]*?)<\/\1>/g, (whole, tag: string, attrs = '', inner: string) => {
    if (/\slang=/.test(String(attrs))) return whole;
    const t = textOf(inner);
    const dev = t.match(DEV)?.length ?? 0;
    const lat = t.match(LAT)?.length ?? 0;
    return dev > lat ? `<${tag}${attrs} lang="hi">${inner}</${tag}>` : whole;
  });

  return out;
}

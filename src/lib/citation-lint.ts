/**
 * Citation lint for library MDX bodies (CLAUDE.md rule 2, concept §6.1 and §11).
 *
 * Every paragraph, list item and table body row in a library entry must carry a citation:
 *   <CitationBadge cite="edition-id" loc="31.30" grade="A-w" />
 * or embed an entry that carries its own source and grade:
 *   <Passage id="passage-id" />   <MantraBlock id="mantra-id" />
 * Text inside <Pending what="…">…</Pending> is a visible placeholder, not a claim, and is
 * exempt. Headings are exempt. Markdown images are rejected: images need an Image record.
 *
 * The check is per block, not per sentence: splitting Hindi and Sanskrit prose into sentences
 * reliably is not possible, so a paragraph that makes several claims should cite each one.
 */
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { gfm } from 'micromark-extension-gfm';
import { mdxjs } from 'micromark-extension-mdxjs';
import { GRADES, isGrade, normaliseGrade } from '../schemas/common';

export const CITATION_ELEMENT = 'CitationBadge';
/** Elements that embed a whole entry carrying its own location and grade. */
export const SOURCED_ELEMENTS: Record<string, string> = {
  Passage: 'passage',
  MantraBlock: 'mantra',
};
export const EXEMPT_ELEMENTS = new Set(['Pending']);

export interface LintIssue {
  line?: number;
  message: string;
}

export interface LintContext {
  /** Known edition ids (citation keys). */
  editions: ReadonlySet<string>;
  /** Known entry ids per collection, for Passage/MantraBlock references. */
  entries: Readonly<Record<string, ReadonlySet<string>>>;
}

interface Node {
  type: string;
  name?: string | null;
  children?: Node[];
  attributes?: Array<{ type: string; name?: string; value?: unknown }>;
  position?: { start: { line: number } };
  value?: string;
}

function attr(node: Node, name: string): { present: boolean; literal?: string } {
  const a = node.attributes?.find((x) => x.type === 'mdxJsxAttribute' && x.name === name);
  if (!a) return { present: false };
  return typeof a.value === 'string' ? { present: true, literal: a.value } : { present: true };
}

const isJsx = (n: Node) => n.type === 'mdxJsxFlowElement' || n.type === 'mdxJsxTextElement';

export function lintMdx(source: string, ctx: LintContext): LintIssue[] {
  const issues: LintIssue[] = [];
  let tree: Node;
  try {
    tree = fromMarkdown(source, {
      extensions: [mdxjs(), gfm()],
      mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown()],
    }) as unknown as Node;
  } catch (err) {
    return [{ message: `Could not parse MDX: ${(err as Error).message}` }];
  }

  const line = (n: Node) => n.position?.start.line;

  /** Validates citing elements wherever they appear. */
  function checkElement(n: Node): void {
    if (!isJsx(n) || !n.name) return;
    if (n.name === CITATION_ELEMENT) {
      const cite = attr(n, 'cite');
      const g = attr(n, 'grade');
      if (!cite.present || !g.present) {
        issues.push({ line: line(n), message: `<${CITATION_ELEMENT}> needs both cite and grade.` });
        return;
      }
      if (cite.literal === undefined || g.literal === undefined) {
        issues.push({
          line: line(n),
          message: `<${CITATION_ELEMENT}> cite and grade must be plain strings so they can be checked.`,
        });
        return;
      }
      if (!ctx.editions.has(cite.literal))
        issues.push({
          line: line(n),
          message: `Citation key "${cite.literal}" is not in content/bibliography.yaml.`,
        });
      if (!isGrade(normaliseGrade(g.literal)))
        issues.push({
          line: line(n),
          message: `Grade "${g.literal}" is not one of ${GRADES.join(', ')}.`,
        });
    } else if (n.name in SOURCED_ELEMENTS) {
      const collection = SOURCED_ELEMENTS[n.name]!;
      const ref = attr(n, 'id');
      if (ref.literal === undefined)
        issues.push({ line: line(n), message: `<${n.name}> needs a plain-string id.` });
      else if (!ctx.entries[collection]?.has(ref.literal))
        issues.push({
          line: line(n),
          message: `<${n.name} id="${ref.literal}"> does not match any ${collection} entry.`,
        });
    }
  }

  /** True when the subtree carries a citation (exempt placeholders count as covered). */
  function cited(n: Node): boolean {
    if (isJsx(n) && n.name) {
      if (n.name === CITATION_ELEMENT || n.name in SOURCED_ELEMENTS) return true;
      if (EXEMPT_ELEMENTS.has(n.name)) return true;
    }
    return (n.children ?? []).some(cited);
  }

  /** True when the subtree has visible text outside exempt placeholders. */
  function hasText(n: Node): boolean {
    if (isJsx(n) && n.name && EXEMPT_ELEMENTS.has(n.name)) return false;
    if (n.type === 'text' || n.type === 'inlineCode') return (n.value ?? '').trim().length > 0;
    return (n.children ?? []).some(hasText);
  }

  function requireCitation(n: Node, what: string): void {
    if (hasText(n) && !cited(n))
      issues.push({
        line: line(n),
        message: `${what} has no citation. Add <${CITATION_ELEMENT} cite="…" grade="…" />, or mark missing material with <Pending what="…">.`,
      });
  }

  function walk(n: Node): void {
    checkElement(n);
    if (n.type === 'image' || n.type === 'imageReference') {
      issues.push({
        line: line(n),
        message: 'Markdown images are not allowed in library content: every image needs an Image record in content/images/.',
      });
    }
    if (isJsx(n) && n.name && EXEMPT_ELEMENTS.has(n.name)) {
      // Placeholders: still validate any citing elements inside, but nothing is required.
      (n.children ?? []).forEach(function visit(c) {
        checkElement(c);
        (c.children ?? []).forEach(visit);
      });
      return;
    }
    switch (n.type) {
      case 'heading':
        (n.children ?? []).forEach(walk);
        return;
      case 'paragraph':
        requireCitation(n, 'Paragraph');
        (n.children ?? []).forEach(walk);
        return;
      case 'listItem': {
        // The item's own content (not nested lists) must be cited; nested items are checked
        // on their own.
        const own: Node = { type: 'root', children: (n.children ?? []).filter((c) => c.type !== 'list') };
        requireCitation(own, 'List item');
        (n.children ?? []).forEach((c) => (c.type === 'list' ? walk(c) : walkInline(c)));
        return;
      }
      case 'table':
        (n.children ?? []).forEach((row, i) => {
          if (i > 0) requireCitation(row, 'Table row');
          walkInline(row);
        });
        return;
      default:
        (n.children ?? []).forEach(walk);
    }
  }

  /** Walks a subtree that has already been checked as a unit: validate elements only. */
  function walkInline(n: Node): void {
    checkElement(n);
    if (n.type === 'image' || n.type === 'imageReference')
      issues.push({
        line: line(n),
        message: 'Markdown images are not allowed in library content: every image needs an Image record in content/images/.',
      });
    (n.children ?? []).forEach((c) => (c.type === 'list' || c.type === 'table' ? walk(c) : walkInline(c)));
  }

  walk(tree);
  return issues;
}

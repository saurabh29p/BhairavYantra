/**
 * Plain hierarchical navigation (concept §2.4, CLAUDE.md): the yantra is never the only route.
 * Used by the header (top level), the footer site map (everything) and the A–Z index.
 */
import { UI, type Label } from '../i18n/ui';

export interface NavItem {
  href: string;
  label: Label;
  children?: NavItem[];
}

export const NAV: NavItem[] = [
  {
    href: '/devata/',
    label: UI.devata,
    children: [
      { href: '/mantra/', label: UI.mantra },
      { href: '/images/', label: UI.image },
    ],
  },
  {
    href: '/grantha/',
    label: UI.grantha,
    children: [{ href: '/passage/', label: UI.passage }],
  },
  {
    href: '/parampara/',
    label: UI.parampara,
    children: [
      { href: '/parampara/person/', label: UI.person },
      { href: '/parampara/place/', label: UI.place },
    ],
  },
  {
    href: '/sources/',
    label: UI.sources,
    children: [
      { href: '/sources/bibliography/', label: UI.bibliography },
      { href: '/claims/', label: UI.claims },
      { href: '/corrections/', label: UI.corrections },
    ],
  },
  { href: '/glossary/', label: UI.glossary },
  { href: '/about/', label: UI.about },
];

/** Always-present utility links, shown on every page. */
export const UTILITY: NavItem[] = [
  { href: '/search/', label: UI.search },
  { href: '/a-z/', label: UI.az },
];

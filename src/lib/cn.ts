/**
 * Minimal class-name joiner. Falsy entries are dropped.
 * Kept dependency-free on purpose: `clsx` is 240 bytes of value and one more
 * thing to audit, and this app never needs the object/array overloads.
 */
export const cn = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

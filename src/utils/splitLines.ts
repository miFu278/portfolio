/**
 * How a block of text is broken up for its entrance.
 *
 * - `lines`  one clipping box per rendered line; the line rises out of it.
 * - `words`  same boxes, but each word rises inside its own line.
 * - `type`   each character appears in reading order, with a caret.
 */
export type SplitMode = 'lines' | 'words' | 'type';

/** Milliseconds between two characters in `type` mode. */
export const CHAR_STEP = 18;

/**
 * Breaks a text element up for its entrance and returns a restore function.
 *
 * Lines are found by measuring, not by guessing: every word is wrapped, their
 * offsets decide where the lines break, and the result is written once. The
 * original markup is kept so a resize can start over and so the caller can put
 * the text back untouched.
 *
 * Every mode rewrites the text into spans, and assistive tech reading a heading
 * letter by letter is a real failure, so the element also gets an `aria-label`
 * with the plain text, removed again on restore.
 */
export const splitLines = (el: HTMLElement, mode: SplitMode): (() => void) => {
  const original = el.innerHTML;
  const label = (el.textContent ?? '').replace(/\s+/g, ' ').trim();

  if (label && !el.hasAttribute('aria-label')) {
    el.setAttribute('aria-label', label);
    el.dataset.autoLabel = 'true';
  }

  const restore = () => {
    el.innerHTML = original;
    if (el.dataset.autoLabel === 'true') {
      el.removeAttribute('aria-label');
      delete el.dataset.autoLabel;
    }
    el.style.removeProperty('--type-ms');
  };

  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (walker.currentNode.textContent?.trim()) textNodes.push(walker.currentNode as Text);
  }

  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    for (const part of (node.textContent ?? '').split(/(\s+)/)) {
      if (!part) continue;
      if (!part.trim()) {
        fragment.append(document.createTextNode(part));
        continue;
      }
      const word = document.createElement('span');
      word.className = 'line__w';
      word.textContent = part;
      fragment.append(word);
    }
    node.replaceWith(fragment);
  });

  const words = [...el.querySelectorAll<HTMLElement>('.line__w')];
  if (words.length === 0) return restore;

  const groups: HTMLElement[][] = [];
  let top: number | null = null;
  for (const word of words) {
    const next = word.getBoundingClientRect().top;
    if (top === null || Math.abs(next - top) > 2) {
      groups.push([]);
      top = next;
    }
    groups[groups.length - 1].push(word);
  }

  el.textContent = '';
  let step = 0;

  groups.forEach((group, index) => {
    const line = document.createElement('span');
    line.className = 'line';
    const inner = document.createElement('span');
    inner.className = 'line__in';
    inner.style.setProperty('--line-i', String(index));

    group.forEach((word, i) => {
      if (i > 0) {
        inner.append(document.createTextNode(' '));
        // A space costs a beat, the way it does on a keyboard.
        step += 1;
      }

      if (mode === 'type') {
        for (const char of word.textContent ?? '') {
          const glyph = document.createElement('span');
          glyph.className = 'line__c';
          glyph.style.setProperty('--char-i', String(step));
          glyph.textContent = char;
          inner.append(glyph);
          step += 1;
        }
        return;
      }

      if (mode === 'words') word.style.setProperty('--word-i', String(i));
      inner.append(word);
    });

    line.append(inner);
    el.append(line);
  });

  if (mode === 'type') {
    const caret = document.createElement('span');
    caret.className = 'line__c type-caret';
    caret.setAttribute('aria-hidden', 'true');
    caret.style.setProperty('--char-i', String(step));
    el.lastElementChild?.querySelector('.line__in')?.append(caret);
    el.style.setProperty('--type-ms', `${step * CHAR_STEP + 260}ms`);
  }

  return restore;
};

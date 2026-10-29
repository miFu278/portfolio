/**
 * Wraps each visual line of a text element in its own clipping box, so an
 * entrance can slide a line up from behind its own box instead of fading it in.
 * With `perWord` every word also gets an index, so the line can be set word by
 * word inside the same mask.
 *
 * Lines are found by measuring, not by guessing: every word is wrapped, their
 * offsets decide where the lines break, and the result is written once. The
 * original markup is kept so a resize can start over and so the caller can put
 * the text back untouched.
 *
 * Returns a restore function.
 */
export const splitLines = (el: HTMLElement, perWord = false): (() => void) => {
  const original = el.innerHTML;

  const restore = () => {
    el.innerHTML = original;
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
  groups.forEach((group, index) => {
    const line = document.createElement('span');
    line.className = 'line';
    const inner = document.createElement('span');
    inner.className = 'line__in';
    inner.style.setProperty('--line-i', String(index));
    group.forEach((word, i) => {
      if (i > 0) inner.append(document.createTextNode(' '));
      if (perWord) word.style.setProperty('--word-i', String(i));
      inner.append(word);
    });
    line.append(inner);
    el.append(line);
  });

  return restore;
};

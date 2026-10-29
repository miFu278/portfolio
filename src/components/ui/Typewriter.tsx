import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface TypewriterProps {
  lines: readonly string[];
  /** Milliseconds per typed character. */
  typeMs?: number;
  /** How long a finished line is left on screen. */
  holdMs?: number;
  /** Milliseconds between two characters leaving on the way out. */
  eraseMs?: number;
}

/** How long a character takes to fade once it starts leaving. */
const FADE_MS = 210;

/**
 * A line of text that types itself, holds, dissolves a character at a time and
 * moves to the next one.
 *
 * Characters are written straight into the node as spans rather than held in
 * state: one every 50ms through React would re-render this tree twenty times a
 * second for no reason. Leaving by fade instead of by deletion is what makes the
 * line read as dissolving rather than as being backspaced, and the spans are
 * what makes that possible.
 *
 * The full current line sits beside the visible one in a visually hidden span,
 * because a screen reader reading a half-typed sentence is a failure, and
 * reduced motion gets the first line and no caret at all.
 */
const Typewriter = ({
  lines,
  typeMs = 50,
  holdMs = 8000,
  eraseMs = 40,
}: TypewriterProps) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();
  const [spoken, setSpoken] = useState(lines[0] ?? '');

  useEffect(() => {
    if (reduced || lines.length === 0) return;

    const node = ref.current;
    if (!node) return;

    const glyphs: HTMLSpanElement[] = [];
    let line = 0;
    let timer = 0;
    let cancelled = false;

    node.textContent = '';

    const type = () => {
      if (cancelled) return;
      const text = lines[line];

      if (glyphs.length < text.length) {
        const glyph = document.createElement('span');
        glyph.className = 'hero__gl';
        glyph.textContent = text[glyphs.length];
        node.append(glyph);
        glyphs.push(glyph);
        timer = window.setTimeout(type, typeMs);
        return;
      }

      setSpoken(text);
      timer = window.setTimeout(erase, holdMs);
    };

    const erase = () => {
      if (cancelled) return;
      const glyph = glyphs.pop();

      if (glyph) {
        glyph.classList.add('is-out');
        timer = window.setTimeout(erase, eraseMs);
        return;
      }

      node.textContent = '';
      timer = window.setTimeout(() => {
        if (cancelled) return;
        line = (line + 1) % lines.length;
        type();
      }, FADE_MS);
    };

    timer = window.setTimeout(type, typeMs * 3);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      node.textContent = lines[0] ?? '';
    };
  }, [lines, typeMs, holdMs, eraseMs, reduced]);

  return (
    <span>
      <span ref={ref} aria-hidden="true">
        {lines[0] ?? ''}
      </span>
      <i className="hero__caret" aria-hidden="true" />
      <span className="sr-only">{spoken}</span>
    </span>
  );
};

export default Typewriter;

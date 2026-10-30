/**
 * Starts a fetch the markup has not asked for yet.
 *
 * Written for the services figures. Two of them travel sideways on a pinned
 * stage, and the browser's lazy loader measures what is near the viewport in
 * *transformed* coordinates: a slide translated one and two stages to the right
 * is off that map until it is already sliding in, so its raster is still
 * arriving when the reader is looking at the frame. Warming the url a viewport
 * early is what removes the wait — and it costs nothing for a reader who never
 * gets there.
 *
 * `type` is what makes the browser answer "can I decode this?" for us: a preload
 * whose type the browser cannot decode is skipped outright, so an old browser
 * pays nothing for a warm it could never use.
 */

export interface WarmImage {
  url: string;
  type: string;
  /**
   * The same `srcSet`/`sizes` the markup carrying this url teaches the browser,
   * so the rung it warms is the rung the `<img>` later asks for instead of a
   * second download of the neighbour.
   */
  srcSet?: string;
  sizes?: string;
}

const warmed = new Set<string>();

export const warmImage = ({ url, type, srcSet, sizes }: WarmImage) => {
  const key = [type, url, srcSet ?? '', sizes ?? ''].join('|');
  if (warmed.has(key)) return;
  warmed.add(key);

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.type = type;
  link.href = url;
  if (srcSet) link.setAttribute('imagesrcset', srcSet);
  if (sizes) link.setAttribute('imagesizes', sizes);
  // A warm is by definition not on the critical path: it must not compete with
  // the fonts and the portrait the loader is waiting on.
  link.setAttribute('fetchpriority', 'low');

  document.head.append(link);
};

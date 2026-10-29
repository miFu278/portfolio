/**
 * Scroll speed, published once per frame and read by anything that should react
 * to how fast the page is moving rather than to where it is. Roughly -1 to 1,
 * positive while scrolling down.
 *
 * A module singleton rather than context: it changes every frame, so it must not
 * cause a render, and it is written by one hook and read by effects that do not
 * share a tree position.
 */
export const scrollVelocity = { value: 0 };

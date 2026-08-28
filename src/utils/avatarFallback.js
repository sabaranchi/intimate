// Inline placeholder avatar — a warm circle with a simple person glyph.
// Used everywhere a person has no photo (there are no bundled PNG icons).
export const FALLBACK_AVATAR =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">` +
      `<rect width="96" height="96" rx="16" fill="#e7c9a6"/>` +
      `<circle cx="48" cy="38" r="16" fill="#b98a5f"/>` +
      `<path d="M20 82c2-16 14-24 28-24s26 8 28 24z" fill="#b98a5f"/>` +
    `</svg>`
  )

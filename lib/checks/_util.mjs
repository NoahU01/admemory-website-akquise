/* Gemeinsame Helfer. Ein Befund ist immer konkret und belegbar —
   er wird später wörtlich auf der Landingpage stehen. */
export const finding = (severity, text, evidence = null) => ({ severity, text, evidence });
export const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(v)));
export const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

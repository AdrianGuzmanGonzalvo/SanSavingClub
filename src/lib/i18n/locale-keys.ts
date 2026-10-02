// Kept apart from locale.ts so src/proxy.ts can import these without pulling
// the dictionaries into its bundle.

export const LOCALE_COOKIE = "locale";

// Set by src/proxy.ts on the public /es pages, whose language comes from the
// URL rather than from the visitor's cookie.
export const LOCALE_HEADER = "x-content-locale";

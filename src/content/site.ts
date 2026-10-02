import type { Localized } from "./types";

// Facts about who runs the site. Supplied by the owner — don't edit by guesswork.
export const OPERATOR_NAME = "Adrian Guzman";
export const CONTACT_EMAIL = "guzmangonzalvo@gmail.com";

export const site: Localized<{
  nav: { howItWorks: string; guides: string; calculator: string; agreement: string };
  footer: { about: string; contact: string; terms: string; privacy: string; disclaimer: string };
  switchLanguage: string;
  updated: string;
  dateLocale: string;
}> = {
  en: {
    nav: { howItWorks: "How it works", guides: "Guides", calculator: "Calculator", agreement: "Agreement" },
    footer: {
      about: "About",
      contact: "Contact",
      terms: "Terms",
      privacy: "Privacy Policy",
      disclaimer:
        "SanSavingClub is a record-keeping tool. It doesn't hold, move or guarantee anyone's money — members pay each other directly.",
    },
    switchLanguage: "Ver en español",
    updated: "Last updated",
    dateLocale: "en-US",
  },
  es: {
    nav: { howItWorks: "Cómo funciona", guides: "Guías", calculator: "Calculadora", agreement: "Acuerdo" },
    footer: {
      about: "Acerca de",
      contact: "Contacto",
      terms: "Términos",
      privacy: "Política de privacidad",
      disclaimer:
        "SanSavingClub es una herramienta de registro. No guarda, mueve ni garantiza el dinero de nadie: los miembros se pagan directamente entre ellos.",
    },
    switchLanguage: "View in English",
    updated: "Última actualización",
    dateLocale: "es-US",
  },
};

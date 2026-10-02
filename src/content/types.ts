import type { Locale } from "@/lib/i18n/locale";

/** One piece of an article body. A bare string is a paragraph. */
export type Block =
  | string
  | { h: string }
  | { ul: string[] }
  | { ol: string[] }
  | { table: { head: string[]; rows: string[][] } }
  | { note: string };

export interface ArticleContent {
  title: string;
  /** Meta description, also shown under the title. */
  description: string;
  blocks: Block[];
}

export type Localized<T> = Record<Locale, T>;

export interface Guide extends Localized<ArticleContent> {
  slug: string;
  /** ISO date of the last edit. */
  updated: string;
}

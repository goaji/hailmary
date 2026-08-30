// Labels never come from `id` directly, even though the values might match,
// always look up `messageKey` in the "categories" messages namespace (`useTranslations("categories")`).

import type { Category } from "@/types";

export type AccentSlot = 1 | 2;

export type CategoryDefinition = {
  id: Category;
  messageKey: string;
  accent: AccentSlot;
};

export const CATEGORIES: Record<Category, CategoryDefinition> = {
  transferuri: { id: "transferuri", messageKey: "transferuri", accent: 2 },
  accidentari: { id: "accidentari", messageKey: "accidentari", accent: 1 },
  analiza: { id: "analiza", messageKey: "analiza", accent: 2 },
  antrenori: { id: "antrenori", messageKey: "antrenori", accent: 1 },
  draft: { id: "draft", messageKey: "draft", accent: 2 },
  program: { id: "program", messageKey: "program", accent: 1 },
  regulament: { id: "regulament", messageKey: "regulament", accent: 2 },
};

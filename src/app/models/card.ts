export interface Card {
  id: string;
  polish: string;
  latin: string;
  /** Polish family name, e.g. "Różowate". Optional. */
  familyPl?: string;
  /** Latin family name, e.g. "Rosaceae". Optional. */
  familyLa?: string;
  /** @deprecated Old single family field (before v1.1). Converted by `migrateCard` on load / import. */
  family?: string;
  /** Folders this card belongs to (a card can be in several). */
  folderIds?: string[];
  /** Images stored as compressed JPEG data URLs. */
  images: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export type StudyMode = 'name' | 'image' | 'family';
export type NameSide = 'pl' | 'la';

export function newId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const hasFamily = (card: Card) => !!(card.familyPl?.trim() || card.familyLa?.trim());

/**
 * Converts the old single `family` field into `familyPl` / `familyLa`:
 * "Różowate (Rosaceae)" → both; "Rosaceae" (Latin families end in -ae) → Latin; anything else → Polish.
 * Returns the card unchanged when there is nothing to migrate.
 */
export function migrateCard(card: Card): Card {
  if (card.family === undefined) return card;
  const { family, ...rest } = card;
  const text = family.trim();
  let familyPl = card.familyPl;
  let familyLa = card.familyLa;
  const both = text.match(/^(.*?)\s*\((.+)\)$/);
  if (both) {
    familyPl ||= both[1].trim();
    familyLa ||= both[2].trim();
  } else if (/ae$/i.test(text)) {
    familyLa ||= text;
  } else if (text) {
    familyPl ||= text;
  }
  return { ...rest, familyPl: familyPl || undefined, familyLa: familyLa || undefined };
}

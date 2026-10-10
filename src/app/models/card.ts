export interface Card {
  id: string;
  polish: string;
  latin: string;
  /** Plant family, e.g. "Różowate (Rosaceae)". Optional - older cards may not have it. */
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
  return (
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

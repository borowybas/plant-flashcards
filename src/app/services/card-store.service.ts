import { Injectable, computed, signal } from '@angular/core';
import { Card, Folder, StudyMode } from '../models/card';

const DB_NAME = 'plant-flashcards';
// v1: cards. v2: folders. Bumping the version upgrades the existing database in place - cards are kept.
const DB_VERSION = 2;
const CARDS = 'cards';
const FOLDERS = 'folders';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      for (const store of [CARDS, FOLDERS]) {
        if (!req.result.objectStoreNames.contains(store)) {
          req.result.createObjectStore(store, { keyPath: 'id' });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

const byPolishName = (a: Card, b: Card) =>
  a.polish.localeCompare(b.polish, 'pl');
const byName = (a: Folder, b: Folder) => a.name.localeCompare(b.name, 'pl');

export const inFolder = (card: Card, folderId: string) =>
  !!card.folderIds?.includes(folderId);

/** Keeps all cards and folders on the device in IndexedDB and exposes them as signals. */
@Injectable({ providedIn: 'root' })
export class CardStore {
  private readonly db = openDb();
  private readonly _cards = signal<Card[]>([]);
  private readonly _folders = signal<Folder[]>([]);

  readonly cards = this._cards.asReadonly();
  readonly folders = this._folders.asReadonly();
  readonly loaded = signal(false);
  readonly withImages = computed(() =>
    this._cards().filter((c) => c.images.length > 0),
  );

  constructor() {
    // Ask the browser/WebView not to evict our data under storage pressure.
    navigator.storage?.persist?.().catch(() => undefined);
    this.load();
  }

  async load(): Promise<void> {
    const db = await this.db;
    const tx = db.transaction([CARDS, FOLDERS], 'readonly');
    const cards = tx.objectStore(CARDS).getAll();
    const folders = tx.objectStore(FOLDERS).getAll();
    await done(tx);
    this._cards.set((cards.result as Card[]).sort(byPolishName));
    this._folders.set((folders.result as Folder[]).sort(byName));
    this.loaded.set(true);
  }

  /**
   * Cards usable in a study mode, optionally limited to some folders (empty = all cards).
   * The image mode needs a photo, the family mode needs a family.
   */
  forMode(mode: StudyMode, folderIds: string[] = []): Card[] {
    let cards = this._cards();
    if (folderIds.length)
      cards = cards.filter((c) => folderIds.some((f) => inFolder(c, f)));
    if (mode === 'image') return cards.filter((c) => c.images.length > 0);
    if (mode === 'family') return cards.filter((c) => !!c.family?.trim());
    return cards;
  }

  get(id: string): Card | undefined {
    return this._cards().find((c) => c.id === id);
  }

  async saveMany(cards: Card[]): Promise<void> {
    await this.write(CARDS, (s) => cards.forEach((c) => s.put(c)));
    const ids = new Set(cards.map((c) => c.id));
    this._cards.update((all) =>
      [...all.filter((c) => !ids.has(c.id)), ...cards].sort(byPolishName),
    );
  }

  save(card: Card): Promise<void> {
    return this.saveMany([card]);
  }

  async remove(id: string): Promise<void> {
    await this.write(CARDS, (s) => s.delete(id));
    this._cards.update((all) => all.filter((c) => c.id !== id));
  }

  async saveFolders(folders: Folder[]): Promise<void> {
    await this.write(FOLDERS, (s) => folders.forEach((f) => s.put(f)));
    const ids = new Set(folders.map((f) => f.id));
    this._folders.update((all) =>
      [...all.filter((f) => !ids.has(f.id)), ...folders].sort(byName),
    );
  }

  saveFolder(folder: Folder): Promise<void> {
    return this.saveFolders([folder]);
  }

  /** Deletes the folder only - its cards stay, they are just removed from it. */
  async removeFolder(id: string): Promise<void> {
    const now = Date.now();
    const affected = this._cards()
      .filter((c) => inFolder(c, id))
      .map((c) => ({
        ...c,
        folderIds: c.folderIds!.filter((f) => f !== id),
        updatedAt: now,
      }));
    if (affected.length) await this.saveMany(affected);
    await this.write(FOLDERS, (s) => s.delete(id));
    this._folders.update((all) => all.filter((f) => f.id !== id));
  }

  private async write(
    store: string,
    fn: (s: IDBObjectStore) => void,
  ): Promise<void> {
    const db = await this.db;
    const tx = db.transaction(store, 'readwrite');
    fn(tx.objectStore(store));
    await done(tx);
  }
}

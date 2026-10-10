import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Card, Folder } from '../models/card';
import { CardStore } from './card-store.service';

const APP_TAG = 'plant-flashcards';
const FORMAT = 1;

export interface Backup {
  cards: Card[];
  folders: Folder[];
}

const isString = (v: unknown): v is string => typeof v === 'string';

function sanitizeCard(raw: any): Card | null {
  if (!raw || !isString(raw.id) || !isString(raw.polish) || !isString(raw.latin)) return null;
  const now = Date.now();
  return {
    id: raw.id,
    polish: raw.polish,
    latin: raw.latin,
    family: isString(raw.family) ? raw.family : undefined,
    folderIds: Array.isArray(raw.folderIds) ? raw.folderIds.filter(isString) : [],
    images: Array.isArray(raw.images) ? raw.images.filter((i: unknown) => isString(i) && i.startsWith('data:image/')) : [],
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : now,
  };
}

function sanitizeFolder(raw: any): Folder | null {
  if (!raw || !isString(raw.id) || !isString(raw.name)) return null;
  return { id: raw.id, name: raw.name, createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now() };
}

/** Exports all cards, folders and photos to one JSON file and imports such files back. */
@Injectable({ providedIn: 'root' })
export class BackupService {
  private readonly store = inject(CardStore);

  async export(): Promise<void> {
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `fiszki-backup-${date}.json`;
    const header = JSON.stringify({ app: APP_TAG, format: FORMAT, exportedAt: new Date().toISOString() }).slice(0, -1);
    const folders = JSON.stringify(this.store.folders());
    const cards = this.store.cards();

    if (!Capacitor.isNativePlatform()) {
      const parts = [header, ',"folders":', folders, ',"cards":[', cards.map((c) => JSON.stringify(c)).join(','), ']}'];
      const url = URL.createObjectURL(new Blob(parts, { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      return;
    }

    // Written card by card: one huge string with all photos could exceed what the native bridge handles.
    const file = { path: fileName, directory: Directory.Cache, encoding: Encoding.UTF8 };
    const { uri } = await Filesystem.writeFile({ ...file, data: `${header},"folders":${folders},"cards":[` });
    for (const [i, card] of cards.entries()) {
      await Filesystem.appendFile({ ...file, data: (i ? ',' : '') + JSON.stringify(card) });
    }
    await Filesystem.appendFile({ ...file, data: ']}' });
    await Share.share({ title: fileName, files: [uri] });
  }

  /** Parses and validates a backup file. Throws when the file is not a backup of this app. */
  async read(file: File): Promise<Backup> {
    const data = JSON.parse(await file.text());
    if (data?.app !== APP_TAG || !Array.isArray(data.cards)) throw new Error('invalid backup');
    return {
      cards: data.cards.map(sanitizeCard).filter((c: Card | null): c is Card => !!c),
      folders: (Array.isArray(data.folders) ? data.folders : [])
        .map(sanitizeFolder)
        .filter((f: Folder | null): f is Folder => !!f),
    };
  }

  /** Merges a backup into the current data: same ids are overwritten, nothing is deleted. */
  async import(backup: Backup): Promise<void> {
    await this.store.saveFolders(backup.folders);
    await this.store.saveMany(backup.cards);
  }
}

import { Injectable, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Folder, newId } from '../models/card';
import { CardStore } from './card-store.service';
import { I18n } from './i18n.service';

/** Alert dialogs for creating, renaming and deleting folders. */
@Injectable({ providedIn: 'root' })
export class FolderDialogs {
  private readonly store = inject(CardStore);
  private readonly alerts = inject(AlertController);
  private readonly t = inject(I18n).t;

  /** Resolves to the new folder, or undefined when cancelled. */
  async create(): Promise<Folder | undefined> {
    const name = await this.askName(this.t('folders.new'), '');
    if (!name) return undefined;
    const folder: Folder = { id: newId(), name, createdAt: Date.now() };
    await this.store.saveFolder(folder);
    return folder;
  }

  async rename(folder: Folder): Promise<void> {
    const name = await this.askName(this.t('folders.rename'), folder.name);
    if (name && name !== folder.name) await this.store.saveFolder({ ...folder, name });
  }

  /** Resolves to true when the folder was deleted. */
  async remove(folder: Folder): Promise<boolean> {
    const alert = await this.alerts.create({
      header: this.t('folders.deleteConfirm', { name: folder.name }),
      message: this.t('folders.deleteNote'),
      buttons: [
        { text: this.t('common.cancel'), role: 'cancel' },
        { text: this.t('common.delete'), role: 'destructive' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role !== 'destructive') return false;
    await this.store.removeFolder(folder.id);
    return true;
  }

  private async askName(header: string, value: string): Promise<string | undefined> {
    const alert = await this.alerts.create({
      header,
      inputs: [{ name: 'name', type: 'text', value, placeholder: this.t('folders.placeholder') }],
      buttons: [
        { text: this.t('common.cancel'), role: 'cancel' },
        { text: this.t('common.save'), role: 'confirm' },
      ],
    });
    await alert.present();
    const { role, data } = await alert.onDidDismiss();
    const name = (data?.values?.name as string | undefined)?.trim();
    return role === 'confirm' && name ? name : undefined;
  }
}

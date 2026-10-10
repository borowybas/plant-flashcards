import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  IonChip,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonSearchbar,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, createOutline, ellipsisVertical, folderOutline, imageOutline, imagesOutline, trashOutline } from 'ionicons/icons';
import { Card } from '../models/card';
import { CardStore, inFolder } from '../services/card-store.service';
import { FolderDialogs } from '../services/folder-dialogs.service';
import { I18n } from '../services/i18n.service';

@Component({
  selector: 'app-cards',
  templateUrl: 'cards.page.html',
  styleUrls: ['cards.page.scss'],
  imports: [
    RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonSearchbar, IonContent,
    IonList, IonItemSliding, IonItem, IonThumbnail, IonLabel, IonBadge, IonItemOptions, IonItemOption,
    IonFab, IonFabButton, IonChip,
  ],
})
export class CardsPage {
  readonly store = inject(CardStore);
  private readonly alerts = inject(AlertController);
  private readonly actionSheets = inject(ActionSheetController);
  private readonly folderDialogs = inject(FolderDialogs);
  readonly t = inject(I18n).t;

  readonly query = signal('');
  /** Selected folder filter; '' = all cards. */
  readonly folderId = signal('');
  readonly folder = computed(() => this.store.folders().find((f) => f.id === this.folderId()));
  readonly folderCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const card of this.store.cards()) {
      for (const id of card.folderIds ?? []) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  });

  readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('pl');
    const folderId = this.folderId();
    let cards = this.store.cards();
    if (folderId) cards = cards.filter((c) => inFolder(c, folderId));
    if (!q) return cards;
    return cards.filter(
      (c) => c.polish.toLocaleLowerCase('pl').includes(q) || c.latin.toLocaleLowerCase().includes(q) ||
        !!c.family?.toLocaleLowerCase('pl').includes(q),
    );
  });

  constructor() {
    addIcons({ add, createOutline, ellipsisVertical, folderOutline, imageOutline, imagesOutline, trashOutline });
  }

  async confirmRemove(card: Card, sliding?: IonItemSliding) {
    await sliding?.close();
    const alert = await this.alerts.create({
      header: this.t('cards.deleteConfirm'),
      message: `${card.polish} (${card.latin})`,
      buttons: [
        { text: this.t('common.cancel'), role: 'cancel' },
        { text: this.t('common.delete'), role: 'destructive', handler: () => this.store.remove(card.id) },
      ],
    });
    await alert.present();
  }

  async newFolder() {
    const folder = await this.folderDialogs.create();
    if (folder) this.folderId.set(folder.id);
  }

  async folderActions() {
    const folder = this.folder();
    if (!folder) return;
    const sheet = await this.actionSheets.create({
      header: folder.name,
      buttons: [
        { text: this.t('cards.rename'), icon: 'create-outline', handler: () => this.folderDialogs.rename(folder) },
        {
          text: this.t('cards.deleteFolder'),
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.folderDialogs.remove(folder).then((removed) => removed && this.folderId.set(''));
          },
        },
        { text: this.t('common.cancel'), role: 'cancel' },
      ],
    });
    await sheet.present();
  }
}

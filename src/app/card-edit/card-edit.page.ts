import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar,
  NavController,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { camera, closeCircle, trashOutline } from 'ionicons/icons';
import { Card, newId } from '../models/card';
import { CardStore } from '../services/card-store.service';
import { I18n } from '../services/i18n.service';
import { filesToDataUrls } from '../services/image.util';
import { FolderChipsComponent } from '../shared/folder-chips.component';

@Component({
  selector: 'app-card-edit',
  templateUrl: 'card-edit.page.html',
  styleUrls: ['card-edit.page.scss'],
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonButton, IonIcon, IonContent,
    IonList, IonItem, IonInput, IonSpinner, FolderChipsComponent,
  ],
})
export class CardEditPage {
  private readonly store = inject(CardStore);
  private readonly nav = inject(NavController);
  private readonly alerts = inject(AlertController);
  private readonly toasts = inject(ToastController);
  readonly t = inject(I18n).t;

  /** Route param; undefined when creating a new card. */
  readonly id = input<string>();
  /** Query param: folder to pre-select for a new card (when adding from inside a folder). */
  readonly folder = input<string>();

  polish = '';
  latin = '';
  familyPl = '';
  familyLa = '';
  readonly images = signal<string[]>([]);
  readonly folderIds = signal<string[]>([]);
  readonly loadingImages = signal(false);
  private existing?: Card;

  constructor() {
    addIcons({ camera, closeCircle, trashOutline });
    effect(() => {
      const id = this.id();
      if (!id || !this.store.loaded() || this.existing) return;
      const card = this.store.get(id);
      if (!card) return;
      this.existing = card;
      this.polish = card.polish;
      this.latin = card.latin;
      this.familyPl = card.familyPl ?? '';
      this.familyLa = card.familyLa ?? '';
      this.images.set([...card.images]);
      this.folderIds.set([...(card.folderIds ?? [])]);
    });
    effect(() => {
      const folder = this.folder();
      if (!this.id() && folder) this.folderIds.set([folder]);
    });
  }

  async addImages(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    this.loadingImages.set(true);
    try {
      const urls = await filesToDataUrls(inputEl.files);
      this.images.update((imgs) => [...imgs, ...urls]);
    } catch (e) {
      this.toast(this.t('edit.imageError', { name: (e as Error).message }));
    } finally {
      inputEl.value = '';
      this.loadingImages.set(false);
    }
  }

  removeImage(index: number) {
    this.images.update((imgs) => imgs.filter((_, i) => i !== index));
  }

  async save() {
    const polish = this.polish.trim();
    const latin = this.latin.trim();
    if (!polish || !latin) {
      this.toast(this.t('edit.namesRequired'));
      return;
    }
    const now = Date.now();
    await this.store.save({
      id: this.existing?.id ?? newId(),
      createdAt: this.existing?.createdAt ?? now,
      updatedAt: now,
      polish,
      latin,
      familyPl: this.familyPl.trim() || undefined,
      familyLa: this.familyLa.trim() || undefined,
      folderIds: this.folderIds(),
      images: this.images(),
    });
    this.nav.back();
  }

  async remove() {
    const card = this.existing;
    if (!card) return;
    const alert = await this.alerts.create({
      header: this.t('cards.deleteConfirm'),
      message: `${card.polish} (${card.latin})`,
      buttons: [
        { text: this.t('common.cancel'), role: 'cancel' },
        {
          text: this.t('common.delete'),
          role: 'destructive',
          handler: async () => {
            await this.store.remove(card.id);
            this.nav.back();
          },
        },
      ],
    });
    await alert.present();
  }

  private async toast(message: string) {
    const t = await this.toasts.create({ message, duration: 2500, position: 'top', color: 'warning' });
    await t.present();
  }
}

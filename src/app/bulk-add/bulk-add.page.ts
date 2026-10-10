import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonSpinner,
  IonTitle,
  IonToolbar,
  NavController,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeCircle, imagesOutline } from 'ionicons/icons';
import { newId } from '../models/card';
import { CardStore } from '../services/card-store.service';
import { I18n } from '../services/i18n.service';
import { filesToDataUrls } from '../services/image.util';
import { FolderChipsComponent } from '../shared/folder-chips.component';

interface Draft {
  key: number;
  image: string;
  polish: string;
  latin: string;
  family: string;
}

const isComplete = (d: Draft) => d.polish.trim() !== '' && d.latin.trim() !== '';

@Component({
  selector: 'app-bulk-add',
  templateUrl: 'bulk-add.page.html',
  styleUrls: ['bulk-add.page.scss'],
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonButton, IonIcon,
    IonCard, IonCardContent, IonInput, IonSpinner, IonFooter, FolderChipsComponent,
  ],
})
export class BulkAddPage {
  private readonly store = inject(CardStore);
  private readonly nav = inject(NavController);
  private readonly toasts = inject(ToastController);
  private readonly i18n = inject(I18n);
  readonly t = this.i18n.t;
  private nextKey = 0;

  /** Query param: folder to pre-select (when opened from inside a folder). */
  readonly folder = input<string>();
  /** Folders every saved card is added to. */
  readonly folderIds = signal<string[]>([]);
  readonly drafts = signal<Draft[]>([]);
  readonly loading = signal(false);
  /** Bumped on every input so `completeCount` recomputes (drafts are mutated in place by ngModel). */
  readonly edits = signal(0);
  readonly completeCount = computed(() => (this.edits(), this.drafts().filter(isComplete).length));

  constructor() {
    addIcons({ closeCircle, imagesOutline });
    effect(() => {
      const folder = this.folder();
      if (folder) this.folderIds.set([folder]);
    });
  }

  async pick(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    this.loading.set(true);
    try {
      const urls = await filesToDataUrls(inputEl.files);
      this.drafts.update((d) => [
        ...d,
        ...urls.map((image) => ({ key: this.nextKey++, image, polish: '', latin: '', family: '' })),
      ]);
    } finally {
      inputEl.value = '';
      this.loading.set(false);
    }
  }

  remove(draft: Draft) {
    this.drafts.update((d) => d.filter((x) => x !== draft));
  }

  async saveAll() {
    const complete = this.drafts().filter(isComplete);
    if (complete.length === 0) return;
    const now = Date.now();
    await this.store.saveMany(
      complete.map((d) => ({
        id: newId(),
        polish: d.polish.trim(),
        latin: d.latin.trim(),
        family: d.family.trim(),
        folderIds: this.folderIds(),
        images: [d.image],
        createdAt: now,
        updatedAt: now,
      })),
    );
    const left = this.drafts().length - complete.length;
    this.drafts.update((d) => d.filter((x) => !isComplete(x)));
    const t = await this.toasts.create({
      message: this.t('bulk.saved', { cards: this.i18n.cards(complete.length) }) + (left ? ' ' + this.t('bulk.left', { n: left }) : ''),
      duration: 2500,
      position: 'top',
      color: 'success',
    });
    await t.present();
    if (!left) this.nav.back();
  }
}

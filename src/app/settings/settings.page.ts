import { Component, inject, signal } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import {
  AlertController,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cafeOutline,
  cloudDownloadOutline,
  cloudUploadOutline,
} from 'ionicons/icons';
import { BackupService } from '../services/backup.service';
import { CardStore } from '../services/card-store.service';
import { I18n, Lang } from '../services/i18n.service';

const COFFEE_URL = 'https://buycoffee.to/basik';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonNote,
    IonSegment,
    IonSegmentButton,
    IonIcon,
    IonSpinner,
  ],
})
export class SettingsPage {
  readonly i18n = inject(I18n);
  readonly t = this.i18n.t;
  readonly store = inject(CardStore);
  private readonly backup = inject(BackupService);
  private readonly alerts = inject(AlertController);
  private readonly toasts = inject(ToastController);

  readonly busy = signal<'export' | 'import' | null>(null);

  constructor() {
    addIcons({ cafeOutline, cloudDownloadOutline, cloudUploadOutline });
  }

  setLang(lang: Lang) {
    this.i18n.lang.set(lang);
  }

  async export() {
    this.busy.set('export');
    try {
      await this.backup.export();
    } catch (e) {
      // Closing the share sheet without picking a target also rejects - that is not an error for the user.
      if (
        !String((e as Error)?.message)
          .toLowerCase()
          .includes('cancel')
      ) {
        await this.toast(this.t('settings.exportFailed'), 'danger');
      }
    } finally {
      this.busy.set(null);
    }
  }

  async import(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.busy.set('import');
    let backup;
    try {
      backup = await this.backup.read(file);
    } catch {
      this.busy.set(null);
      await this.toast(this.t('settings.importInvalid'), 'danger');
      return;
    }

    const alert = await this.alerts.create({
      header: this.t('settings.importConfirm'),
      message: this.t('settings.importSummary', {
        cards: this.i18n.cards(backup.cards.length),
        folders: this.i18n.folders(backup.folders.length),
      }),
      buttons: [
        { text: this.t('common.cancel'), role: 'cancel' },
        { text: this.t('settings.importButton'), role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      await this.backup.import(backup);
      await this.toast(
        this.t('settings.importDone', {
          cards: this.i18n.cards(backup.cards.length),
        }),
        'success',
      );
    }
    this.busy.set(null);
  }

  async openCoffee() {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url: COFFEE_URL });
    } else {
      window.open(COFFEE_URL, '_blank', 'noopener');
    }
  }

  private async toast(message: string, color: string) {
    const t = await this.toasts.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });
    await t.present();
  }
}

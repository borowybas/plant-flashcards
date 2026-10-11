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
  colorPaletteOutline,
  cloudDownloadOutline,
  cloudUploadOutline,
} from 'ionicons/icons';
import { APP_INFO } from '../app-info';
import { BackupService, BackupTooLargeError, MAX_IMPORT_MB } from '../services/backup.service';
import { CardStore } from '../services/card-store.service';
import { I18n, Lang } from '../services/i18n.service';
import { THEME_PRESETS, ThemeService } from '../services/theme.service';

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

  readonly info = APP_INFO;
  readonly theme = inject(ThemeService);
  readonly presets = THEME_PRESETS;
  readonly busy = signal<'export' | 'import' | null>(null);

  constructor() {
    addIcons({ cafeOutline, colorPaletteOutline, cloudDownloadOutline, cloudUploadOutline });
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
    } catch (e) {
      this.busy.set(null);
      const message =
        e instanceof BackupTooLargeError
          ? this.t('settings.importTooLarge', { mb: MAX_IMPORT_MB })
          : this.t('settings.importInvalid');
      await this.toast(message, 'danger');
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
      await Browser.open({ url: APP_INFO.coffeeUrl });
    } else {
      window.open(APP_INFO.coffeeUrl, '_blank', 'noopener');
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

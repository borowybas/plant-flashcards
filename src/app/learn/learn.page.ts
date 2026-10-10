import { Component, computed, inject, signal } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRadio,
  IonRadioGroup,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToggle,
  IonToolbar,
  NavController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { play } from 'ionicons/icons';
import { NameSide, StudyMode } from '../models/card';
import { CardStore } from '../services/card-store.service';
import { I18n } from '../services/i18n.service';
import { FolderChipsComponent } from '../shared/folder-chips.component';

const SETTINGS_KEY = 'learn-settings';

interface LearnSettings {
  mode: StudyMode;
  front: NameSide;
  shuffle: boolean;
  /** Folders to practise; empty = all cards. */
  folderIds: string[];
}

const DEFAULTS: LearnSettings = { mode: 'name', front: 'pl', shuffle: true, folderIds: [] };

function loadSettings(): LearnSettings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
  } catch {
    return DEFAULTS;
  }
}

@Component({
  selector: 'app-learn',
  templateUrl: 'learn.page.html',
  styleUrls: ['learn.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel,
    IonRadioGroup, IonRadio, IonSegment, IonSegmentButton, IonToggle, IonButton, IonIcon,
    FolderChipsComponent,
  ],
})
export class LearnPage {
  readonly store = inject(CardStore);
  private readonly nav = inject(NavController);
  readonly i18n = inject(I18n);
  readonly t = this.i18n.t;

  private readonly initial = loadSettings();
  readonly mode = signal<StudyMode>(this.initial.mode);
  readonly front = signal<NameSide>(this.initial.front);
  readonly shuffle = signal(this.initial.shuffle);
  readonly folderIds = signal<string[]>(this.initial.folderIds);

  /** Selected folders that still exist (a remembered folder may have been deleted since). */
  readonly activeFolderIds = computed(() => {
    const existing = new Set(this.store.folders().map((f) => f.id));
    return this.folderIds().filter((id) => existing.has(id));
  });

  readonly available = computed(() => this.store.forMode(this.mode(), this.activeFolderIds()).length);

  constructor() {
    addIcons({ play });
  }

  start() {
    const settings: LearnSettings = {
      mode: this.mode(),
      front: this.front(),
      shuffle: this.shuffle(),
      folderIds: this.activeFolderIds(),
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    this.nav.navigateForward('/study', {
      queryParams: {
        mode: settings.mode,
        front: settings.front,
        shuffle: settings.shuffle ? '1' : '0',
        folders: settings.folderIds.join(',') || null,
      },
    });
  }
}

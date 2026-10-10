import { Component, inject, input, model } from '@angular/core';
import { IonChip, IonIcon, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, checkmark, folderOutline } from 'ionicons/icons';
import { CardStore } from '../services/card-store.service';
import { FolderDialogs } from '../services/folder-dialogs.service';
import { I18n } from '../services/i18n.service';

/** Multi-select list of folders as toggleable chips, optionally with a "new folder" chip. */
@Component({
  selector: 'app-folder-chips',
  template: `
    <div class="chips">
      @for (folder of store.folders(); track folder.id) {
        <ion-chip
          [outline]="!selected().includes(folder.id)"
          [color]="selected().includes(folder.id) ? 'primary' : 'medium'"
          (click)="toggle(folder.id)"
        >
          <ion-icon [name]="selected().includes(folder.id) ? 'checkmark' : 'folder-outline'"></ion-icon>
          <ion-label>{{ folder.name }}</ion-label>
        </ion-chip>
      }
      @if (allowCreate()) {
        <ion-chip outline color="primary" (click)="create()">
          <ion-icon name="add"></ion-icon>
          <ion-label>{{ t('cards.newFolder') }}</ion-label>
        </ion-chip>
      }
    </div>
  `,
  styles: `
    .chips {
      display: flex;
      flex-wrap: wrap;
    }
  `,
  imports: [IonChip, IonIcon, IonLabel],
})
export class FolderChipsComponent {
  readonly store = inject(CardStore);
  private readonly dialogs = inject(FolderDialogs);
  readonly t = inject(I18n).t;

  readonly selected = model<string[]>([]);
  readonly allowCreate = input(true);

  constructor() {
    addIcons({ add, checkmark, folderOutline });
  }

  toggle(id: string) {
    this.selected.update((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async create() {
    const folder = await this.dialogs.create();
    if (folder) this.selected.update((s) => [...s, folder.id]);
  }
}

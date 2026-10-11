import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular';
import { CardStore, inFolder } from '../services/card-store.service';
import { I18n } from '../services/i18n.service';

/** Checklist of all cards for choosing which ones belong to a folder. Saves on "Save", nothing changes on "Cancel". */
@Component({
  selector: 'app-assign-cards-modal',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button (click)="close()">{{ t('common.cancel') }}</ion-button>
        </ion-buttons>
        <ion-title>{{ folderName }}</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          [placeholder]="t('cards.search')"
          [value]="query()"
          (ionInput)="query.set($any($event).detail.value ?? '')"
        ></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button size="small" (click)="selectVisible(true)">{{ t('assign.selectAll') }}</ion-button>
          <ion-button size="small" (click)="selectVisible(false)">{{ t('assign.selectNone') }}</ion-button>
        </ion-buttons>
        <ion-label slot="end" class="count">{{ t('assign.selected', { n: selected().size }) }}</ion-label>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        @for (card of visible(); track card.id) {
          <ion-item>
            <ion-thumbnail slot="start">
              @if (card.images[0]; as src) {
                <img [src]="src" alt="" />
              }
            </ion-thumbnail>
            <ion-checkbox [checked]="selected().has(card.id)" (ionChange)="toggle(card.id)" justify="space-between">
              <ion-label>
                <h2>{{ card.polish }}</h2>
                <p class="latin">{{ card.latin }}</p>
              </ion-label>
            </ion-checkbox>
          </ion-item>
        }
      </ion-list>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button expand="block" class="ion-padding-horizontal" (click)="save()">
          {{ t('common.save') }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: `
    ion-thumbnail {
      --size: 44px;
      --border-radius: 6px;
      background: var(--ion-color-light);
      border-radius: 6px;
    }
    .latin {
      font-style: italic;
    }
    .count {
      padding-inline-end: 16px;
      font-size: 14px;
      color: var(--ion-color-medium);
    }
  `,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSearchbar, IonContent, IonList, IonItem,
    IonThumbnail, IonCheckbox, IonLabel, IonFooter,
  ],
})
export class AssignCardsModal implements OnInit {
  private readonly store = inject(CardStore);
  private readonly modalCtrl = inject(ModalController);
  readonly t = inject(I18n).t;

  // Set by ModalController via componentProps (plain properties, not signal inputs – Ionic assigns them directly).
  folderId = '';
  folderName = '';

  readonly query = signal('');
  readonly selected = signal(new Set<string>());

  readonly visible = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('pl');
    const cards = this.store.cards();
    if (!q) return cards;
    return cards.filter(
      (c) => c.polish.toLocaleLowerCase('pl').includes(q) || c.latin.toLocaleLowerCase().includes(q),
    );
  });

  ngOnInit() {
    const id = this.folderId;
    this.selected.set(new Set(this.store.cards().filter((c) => inFolder(c, id)).map((c) => c.id)));
  }

  toggle(id: string) {
    this.selected.update((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  /** Selects or deselects all cards currently shown (respects the search filter). */
  selectVisible(select: boolean) {
    this.selected.update((s) => {
      const next = new Set(s);
      for (const c of this.visible()) select ? next.add(c.id) : next.delete(c.id);
      return next;
    });
  }

  async save() {
    await this.store.setFolderMembers(this.folderId, this.selected());
    await this.modalCtrl.dismiss(true, 'saved');
  }

  close() {
    this.modalCtrl.dismiss(false, 'cancel');
  }
}

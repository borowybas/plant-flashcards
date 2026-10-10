import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonProgressBar,
  IonTitle,
  IonToolbar,
  NavController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmark, close, imageOutline, refresh, repeat, trophyOutline } from 'ionicons/icons';
import { Card, NameSide, StudyMode } from '../models/card';
import { CardStore } from '../services/card-store.service';
import { I18n } from '../services/i18n.service';

function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const randomImage = (card: Card) => card.images[Math.floor(Math.random() * card.images.length)];

@Component({
  selector: 'app-study',
  templateUrl: 'study.page.html',
  styleUrls: ['study.page.scss'],
  imports: [NgTemplateOutlet, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonProgressBar, IonContent, IonButton, IonIcon],
})
export class StudyPage {
  private readonly store = inject(CardStore);
  private readonly nav = inject(NavController);
  readonly t = inject(I18n).t;

  // Query params (bound via withComponentInputBinding).
  readonly mode = input<StudyMode>('name');
  readonly front = input<NameSide>('pl');
  readonly shuffle = input<string>('1');
  /** Comma-separated folder ids; empty = all cards. */
  readonly folders = input<string>('');

  /** Cards still to answer; the head is the one on screen. Unknown cards go back to the end. */
  readonly queue = signal<Card[]>([]);
  readonly flipped = signal(false);
  readonly image = signal<string | undefined>(undefined);
  /** Changes on every new card so the card element is recreated and doesn't animate back, revealing the answer. */
  readonly turn = signal(0);

  readonly total = signal(0);
  readonly missed = signal<Card[]>([]);
  private started = false;

  readonly current = computed(() => this.queue()[0]);
  readonly finished = computed(() => this.total() > 0 && this.queue().length === 0);
  readonly progress = computed(() => (this.total() ? 1 - this.queue().length / this.total() : 0));

  /** Names shown on the front of the card (empty in image mode). */
  readonly question = computed(() => {
    const card = this.current();
    if (!card) return [];
    const pl = { text: card.polish, latin: false };
    const la = { text: card.latin, latin: true };
    switch (this.mode()) {
      case 'image':
        return [];
      case 'family':
        return [pl, la];
      default:
        return this.front() === 'pl' ? [pl] : [la];
    }
  });

  readonly answers = computed(() => {
    const card = this.current();
    if (!card) return [];
    const pl = { label: this.t('common.polishName'), text: card.polish, latin: false };
    const la = { label: this.t('common.latinName'), text: card.latin, latin: true };
    switch (this.mode()) {
      case 'image':
        return [pl, la];
      case 'family':
        return [{ label: this.t('common.family'), text: card.family ?? '', latin: false }];
      default:
        return this.front() === 'pl' ? [la] : [pl];
    }
  });

  readonly prompt = computed(() =>
    this.t(this.mode() === 'family' ? 'study.promptFamily' : 'study.promptName'),
  );

  constructor() {
    addIcons({ checkmark, close, imageOutline, refresh, repeat, trophyOutline });
    effect(() => {
      if (this.started || !this.store.loaded()) return;
      this.started = true;
      const cards = this.deckCards();
      this.begin(cards);
    });
  }

  begin(cards: Card[]) {
    const deck = this.shuffle() === '0' ? [...cards] : shuffled(cards);
    this.total.set(deck.length);
    this.missed.set([]);
    this.queue.set(deck);
    this.showHead();
  }

  flip() {
    this.flipped.update((f) => !f);
  }

  answer(known: boolean) {
    const [card, ...rest] = this.queue();
    if (!card) return;
    if (!known && !this.missed().includes(card)) {
      this.missed.update((m) => [...m, card]);
    }
    this.queue.set(known ? rest : [...rest, card]);
    this.showHead();
  }

  repeatMissed() {
    this.begin(this.missed());
  }

  restart() {
    const cards = this.deckCards();
    this.begin(cards);
  }

  exit() {
    this.nav.back();
  }

  private deckCards(): Card[] {
    return this.store.forMode(this.mode(), this.folders().split(',').filter(Boolean));
  }

  private showHead() {
    const card = this.queue()[0];
    this.flipped.set(false);
    this.image.set(card ? randomImage(card) : undefined);
    this.turn.update((t) => t + 1);
  }
}

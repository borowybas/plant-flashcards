import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
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
import { arrowBack, arrowForward, imageOutline, refresh, repeat, trophyOutline } from 'ionicons/icons';
import { Card, NameSide, StudyMode } from '../models/card';
import { CardStore } from '../services/card-store.service';
import { I18n } from '../services/i18n.service';
import { SwipeCardDirective } from './swipe-card.directive';

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
  host: { '(document:keydown)': 'onKey($event)' },
  imports: [SwipeCardDirective, NgTemplateOutlet, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonProgressBar, IonContent, IonButton, IonIcon],
})
export class StudyPage {
  private readonly store = inject(CardStore);
  private readonly nav = inject(NavController);
  readonly t = inject(I18n).t;

  // Query params (bound via withComponentInputBinding). A missing param is bound as `undefined`,
  // which would override a plain default – hence the transforms.
  readonly mode = input('name' as StudyMode, { transform: (v: StudyMode | undefined) => v ?? 'name' });
  readonly front = input('pl' as NameSide, { transform: (v: NameSide | undefined) => v ?? 'pl' });
  readonly shuffle = input('1', { transform: (v: string | undefined) => v ?? '1' });
  /** Comma-separated folder ids; empty = all cards. */
  readonly folders = input('', { transform: (v: string | undefined) => v ?? '' });

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
        return [
          { label: this.t('common.familyPl'), text: card.familyPl ?? '', latin: false },
          { label: this.t('common.familyLa'), text: card.familyLa ?? '', latin: true },
        ].filter((a) => a.text.trim());
      default:
        return this.front() === 'pl' ? [la] : [pl];
    }
  });

  /** Extra hint on the front – only the family mode needs one (the names alone don't say what is asked). */
  readonly prompt = computed(() => (this.mode() === 'family' ? this.t('study.promptFamily') : ''));

  constructor() {
    addIcons({ arrowBack, arrowForward, imageOutline, refresh, repeat, trophyOutline });
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

  private readonly swipeCard = viewChild(SwipeCardDirective);

  flip() {
    this.flipped.update((f) => !f);
  }

  /** Keyboard shortcuts (handy in the browser): ← don't know, → know, space/enter flips. */
  onKey(e: KeyboardEvent) {
    const swipe = this.swipeCard();
    if (!swipe || !this.current()) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      swipe.flyOut(e.key === 'ArrowRight' ? 'right' : 'left');
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.flip();
    }
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

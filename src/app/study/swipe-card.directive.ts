import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject, output } from '@angular/core';
import { Gesture, GestureController } from '@ionic/angular';

/** How far (as a fraction of the card width) the card must be dragged to count as a swipe. */
const SWIPE_THRESHOLD = 0.3;
/** A fast flick counts even if it's shorter than the threshold (px per ms). */
const FLICK_VELOCITY = 0.5;
/** Movement (px) after which the gesture is a drag, so the following click must not flip the card. */
const DRAG_SLOP = 8;
const FLY_OUT_MS = 220;

/**
 * Tinder-style swipe on a flashcard: the element follows the finger horizontally with a slight tilt.
 * Released far enough (or flicked) it flies off and emits `swiped`; otherwise it springs back.
 * While dragging it sets `--know` / `--dont-know` (0–1) on the element so stamps can fade in via CSS.
 */
@Directive({ selector: '[appSwipeCard]', exportAs: 'swipeCard' })
export class SwipeCardDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly gestures = inject(GestureController);
  private readonly zone = inject(NgZone);
  private gesture?: Gesture;
  private dragged = false;

  readonly swiped = output<'left' | 'right'>();

  ngOnInit() {
    // Swallow the click that browsers fire after a drag, so a swipe doesn't also flip the card.
    this.el.addEventListener('click', this.suppressClickAfterDrag, true);

    this.gesture = this.gestures.create({
      el: this.el,
      gestureName: 'swipe-card',
      direction: 'x',
      threshold: 0,
      onStart: () => {
        this.dragged = false;
        this.el.style.transition = 'none';
      },
      onMove: (d) => {
        if (Math.abs(d.deltaX) > DRAG_SLOP || Math.abs(d.deltaY) > DRAG_SLOP) this.dragged = true;
        this.apply(d.deltaX);
      },
      onEnd: (d) => {
        const width = this.el.offsetWidth || 1;
        const farEnough = Math.abs(d.deltaX) > width * SWIPE_THRESHOLD;
        const flicked = Math.abs(d.velocityX) > FLICK_VELOCITY && Math.abs(d.deltaX) > DRAG_SLOP * 3;
        if (farEnough || flicked) {
          this.flyOut(d.deltaX > 0 ? 'right' : 'left');
        } else {
          this.el.style.transition = 'transform 0.2s ease';
          this.apply(0);
        }
      },
    });
    this.gesture.enable();
  }

  /** Programmatic swipe (keyboard arrows) with the same fly-out animation. */
  flyOut(direction: 'left' | 'right') {
    const width = this.el.offsetWidth || window.innerWidth;
    this.el.style.transition = `transform ${FLY_OUT_MS}ms ease-in`;
    this.apply((direction === 'right' ? 1 : -1) * width * 1.5);
    setTimeout(() => this.zone.run(() => this.swiped.emit(direction)), FLY_OUT_MS);
  }

  ngOnDestroy() {
    this.gesture?.destroy();
    this.el.removeEventListener('click', this.suppressClickAfterDrag, true);
  }

  private apply(dx: number) {
    const width = this.el.offsetWidth || 1;
    const strength = Math.min(Math.abs(dx) / (width * SWIPE_THRESHOLD), 1);
    this.el.style.transform = dx ? `translateX(${dx}px) rotate(${dx / 20}deg)` : '';
    this.el.style.setProperty('--know', dx > 0 ? String(strength) : '0');
    this.el.style.setProperty('--dont-know', dx < 0 ? String(strength) : '0');
  }

  private readonly suppressClickAfterDrag = (e: Event) => {
    if (!this.dragged) return;
    this.dragged = false;
    e.stopPropagation();
    e.preventDefault();
  };
}

import { Injectable, signal } from '@angular/core';
import { TripImage } from '../data/trip.interfaces';

@Injectable({ providedIn: 'root' })
export class LightboxService {
  isOpen = signal(false);
  images = signal<TripImage[]>([]);
  currentIndex = signal(0);

  open(images: TripImage[], index: number) {
    this.images.set(images);
    this.currentIndex.set(index);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  next() {
    const imgs = this.images();
    this.currentIndex.set((this.currentIndex() + 1) % imgs.length);
  }

  prev() {
    const imgs = this.images();
    this.currentIndex.set((this.currentIndex() - 1 + imgs.length) % imgs.length);
  }
}

import { Component, Input, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { PhotoJournalService, JournalEntry } from '../../services/photo-journal.service';
import { LightboxService } from '../../services/lightbox.service';

@Component({
  selector: 'app-photo-journal',
  standalone: true,
  template: `
    <div class="journal">
      <div class="journal__header">
        <h3 class="journal__title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Rejsedagbog
        </h3>
        <button class="journal__add-btn" (click)="fileInput.click()" aria-label="Tilføj foto">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <input #fileInput type="file" accept="image/*" multiple (change)="onFilesSelected($event)" style="display:none" />
      </div>

      @if (dayEntries().length > 0) {
        <div class="journal__grid">
          @for (entry of dayEntries(); track entry.id) {
            <div class="journal__entry">
              <img [src]="entry.imageData" [alt]="entry.caption || 'Rejsefoto'" class="journal__image" (click)="openLightbox($index)" />
              <div class="journal__entry-footer">
                @if (editingId() === entry.id) {
                  <input class="journal__caption-input"
                    [value]="entry.caption"
                    (keydown.enter)="saveCaption(entry.id, $event)"
                    (blur)="saveCaption(entry.id, $event)"
                    placeholder="Tilføj billedtekst..." />
                } @else {
                  <span class="journal__caption" (click)="editingId.set(entry.id)">
                    {{ entry.caption || 'Tilføj billedtekst...' }}
                  </span>
                }
                <button class="journal__delete" (click)="remove(entry.id)" aria-label="Slet foto">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <p class="journal__empty">Ingen billeder endnu — tag eller vælg dit første rejsefoto!</p>
      }
    </div>
  `,
  styleUrl: './photo-journal.scss',
})
export class PhotoJournalComponent {
  @Input({ required: true }) dayId!: number;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private journal = inject(PhotoJournalService);
  private lightbox = inject(LightboxService);
  editingId = signal<string | null>(null);

  dayEntries = () => {
    return (this.journal.entriesByDay().get(this.dayId) ?? [])
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  openLightbox(index: number) {
    const images = this.dayEntries().map(e => ({ url: e.imageData, alt: e.caption || 'Rejsefoto' }));
    this.lightbox.open(images, index);
  }

  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const data = await this.readFile(files[i]);
      await this.journal.addEntry(this.dayId, data, '');
    }
    input.value = '';
  }

  async saveCaption(id: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    await this.journal.updateCaption(id, value);
    this.editingId.set(null);
  }

  async remove(id: string) {
    await this.journal.removeEntry(id);
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 1200;
          let w = img.width, h = img.height;
          if (w > maxSize || h > maxSize) {
            const ratio = Math.min(maxSize / w, maxSize / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}

import { Component, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';
import { CustomDateComponent, PickerMode, DateRange } from '../custom-date/custom-date.component';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-input',
  imports: [CustomDateComponent, FormsModule],
  templateUrl: './date-input.component.html'
})
export class DateInputComponent {
  /* ---------- API pública ─────────────── */
  @Input() mode: PickerMode = 'range';
  @Input() placeholder = '';
  @Input() model?: DateRange;
  @Input() initial: Date | null = new Date();
  @Output() modelChange = new EventEmitter<DateRange>();
  @Input() dateMode: 'local' | 'utc' = 'local';

  static opened: DateInputComponent | null = null;

  /* ---------- estado interno ──────────── */
  show = signal(false);

  toggle() {
    // Cierra el anterior
    if (DateInputComponent.opened && DateInputComponent.opened !== this) {
      DateInputComponent.opened.show.set(false);
    }

    const isOpening = !this.show();
    this.show.set(isOpening);

    if (isOpening) {
      DateInputComponent.opened = this;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!(ev.target as HTMLElement).closest('.date-input-wrapper')) {
      this.show.set(false);
    }
  }

  private norm(d: Date): Date {
    if (this.dateMode === 'local') {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    } else {
      // Para UTC date-only, fija la hora a 00:00 UTC
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }
  }

  label(): string {
    if (!this.model?.start) return this.placeholder;
  
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat('es', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        ...(this.dateMode === 'utc' ? { timeZone: 'UTC' } : {})
      })
        .format(this.norm(d))
        .replace(/^(\d{2}) (.)/, (_, d1, m) => `${d1} ${m.toUpperCase()}`);
  
    return this.mode === 'single'
      ? fmt(this.model.start)
      : this.model.end
        ? `${fmt(this.model.start)} – ${fmt(this.model.end)}`
        : fmt(this.model.start);
  }

  /* Evento recibido desde <app-custom-date> */
  onRangeSelected(range: DateRange) {
    if (range.start) range.start = this.norm(range.start);
    if (range.end)   range.end   = this.norm(range.end);
    this.model = range;
    this.modelChange.emit(range);
    this.show.set(false);
  }
}
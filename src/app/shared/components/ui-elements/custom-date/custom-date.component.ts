
import { Component, computed, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type PickerMode = 'single' | 'range';
export type DateRange = { start: Date; end?: Date };

@Component({
  selector: 'app-custom-date',
  imports: [FormsModule],
  templateUrl: './custom-date.component.html'
})
export class CustomDateComponent implements OnInit, OnChanges  {
  /* ▸ Parámetros ----------------------------------------------------------- */
  @Input() mode: PickerMode = 'range';
  @Input() initial!: Date | null;    
  @Input() model?: DateRange;
  @Output() modelChange = new EventEmitter<DateRange>();
  @Output() cancel = new EventEmitter<void>();

  /* ▸ Estado reactivo ------------------------------------------------------ */
  /** Mes que se está mostrando (siempre día 1) */
  private viewDate = signal<Date>(new Date()); 
  /** Fecha de inicio / fin seleccionadas */
  private start = signal<Date | null>(null);
  private end = signal<Date | null>(null);
  /** ¿Estamos eligiendo inicio?  */
  private pickingStart = signal(true);


  private originalStart: Date | null = null;
  private originalEnd: Date | null = null;


  /** Etiqueta “February 2025”  */
  header = computed(() =>
    this.viewDate()
      .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      .replace(/^\p{L}/u, c => c.toUpperCase())    // primera letra mayúscula
  );

  /** Matriz 6 × 7 con las celdas del calendario  */
  cells = computed(() => {
    const base = this.viewDate();
    const year = base.getFullYear();
    const month = base.getMonth();            // 0-11
    const first = new Date(year, month, 1);
    const offset = first.getDay();             // 0=Sun … 6=Sat
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid: { day: number; date: Date | null }[] = [];
    const total = 42;                          // 6 semanas

    for (let i = 0; i < total; i++) {
      const dayNo = i - offset + 1;
      if (dayNo > 0 && dayNo <= daysInMonth) {
        grid.push({
          day: dayNo,
          date: new Date(year, month, dayNo)
        });
      } else {
        grid.push({ day: 0, date: null });     // espacio vacío
      }
    }
    return grid;
  });

  ngOnInit() { this.seedFromInputs(); }
  ngOnChanges(ch: SimpleChanges) {
    if (ch['initial'] || ch['mode'] || ch['model']) {
      this.seedFromInputs();
    }
  }

  private normalize = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  /** Copiar valores recibidos a las signals */
  private seedFromInputs() {
    const ref = this.initial ?? this.model?.start ?? new Date();
    this.viewDate.set(this.normalize(ref));   // mes visible
  
    if (this.mode === 'single') {
      const src = this.model?.start ?? this.initial;
      this.start.set(src ? this.normalize(src) : null); // ⬅️ normalizado
      this.end.set(null);
    } else {
      this.start.set(this.model?.start ? this.normalize(this.model.start) : null);
      this.end.set  (this.model?.end   ? this.normalize(this.model.end)   : null);
    }
  
    this.originalStart = this.start();
    this.originalEnd   = this.end();
    this.pickingStart.set(this.mode !== 'range');
  }

  /* ▸ Navegación mes ------------------------------------------------------- */
  prevMonth() { this.shiftMonth(-1); }
  nextMonth() { this.shiftMonth(1); }
  private shiftMonth(delta: number) {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  /* ▸ Selección de celdas -------------------------------------------------- */
  onSelect(cell: { day: number; date: Date | null }) {
    if (!cell.date) return;

    /** ➊ modo “single” */
    if (this.mode === 'single') {
      this.start.set(cell.date);
      this.end.set(null);
      return;
    }

    /** ➋ modo “range” (igual que antes) */
    if (this.pickingStart()) {
      this.start.set(cell.date);
      this.end.set(null);
      this.pickingStart.set(false);
    } else {
      if (cell.date < this.start()!) {
        this.end.set(this.start()); this.start.set(cell.date);
      } else {
        this.end.set(cell.date);
      }
      this.pickingStart.set(true);
    }
  }

  /* ▸ Estado visual de una celda ------------------------------------------ */
  isSelected(d: Date | null) {
    return !!d && (d.getTime() === this.start()?.getTime()
      || d.getTime() === this.end()?.getTime());
  }
  isInRange(d: Date | null) {
    if (!d || !this.start() || !this.end()) return false;
    return d >= this.start()! && d <= this.end()!;
  }

  /* ▸ Botones ------------------------------------------------------------- */
  apply() {
    if (!this.start()) return;
    const payload =
      this.mode === 'single'
        ? { start: this.start()! }            // solo una fecha
        : this.end()
          ? { start: this.start()!, end: this.end()! } // rango completo
          : undefined;

    if (payload) {
      this.model = payload;
      this.modelChange.emit(payload);
    }
  }

  clear() {
    // 1) Reponer la selección original
    this.start.set(this.originalStart);
    this.end.set(this.originalEnd);
    this.pickingStart.set(true);

    // 2) Emitir evento para que el wrapper cierre el pop-over
    this.cancel.emit();
  }
}
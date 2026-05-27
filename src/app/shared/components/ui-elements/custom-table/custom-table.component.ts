import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewEncapsulation, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ColumnDef {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  widthClass?: string;   // ancho fijo opcional del th/td (w-28, min-w-[220px], etc.)
  maxWClass?: string;    // max width del contenido (max-w-[240px], max-w-xs, etc.)
  wrap?: 'truncate' | 'wrap' | 'nowrap'; // cómo manejar el texto (default: 'truncate')
  cellClass?: string;
  headClass?: string;
  template?: TemplateRef<any>;
  ellipsisAt?: number;
  truncate?: boolean;
  actions?: { id: string; icon: string; click: (r: any) => void }[];
  type?: 'text' | 'date' | 'number' | 'boolean' | 'currency' | 'checkbox' | 'actions';
}

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './custom-table.component.html'
})
export class CustomTableComponent {
  // ----- Inputs “normales”
  @Input() title = '';
  @Input() loading = false;
  @Input() skeletonRows = 10;
  @Input() searchPlaceholder = 'Buscar';
  public columnsSig = signal<ColumnDef[]>([]);
  @Input() set columns(v: ColumnDef[] | null | undefined) { this.columnsSig.set(v ?? []); }
  @Input() itemsPerPageOptions: number[] = [5, 10, 15]; // << FALTABA

  // ----- Inputs convertidos a signals (para que los computed reaccionen)
  private rowsSig = signal<any[]>([]);
  @Input() set rows(v: any[] | null | undefined) {
    this.rowsSig.set(v ?? []);
    if (!this.serverPaginationSig()) {
      this.pageSig.set(1);
    }
}

  private serverPaginationSig = signal(false);
  @Input() set serverPagination(v: boolean | null | undefined) { this.serverPaginationSig.set(!!v); }

  private totalItemsSig = signal(0);
  @Input() set totalItems(v: number | null | undefined) {
    const total = Number(v) || 0;
    this.totalItemsSig.set(total);
  }

  private clientSearchSig = signal(true);
  @Input() set clientSearch(v: boolean | null | undefined) { this.clientSearchSig.set(!!v); }

  private searchableKeysSig = signal<string[]>([]);
  @Input() set searchableKeys(v: string[] | null | undefined) { this.searchableKeysSig.set(v ?? []); }

  public pageSig = signal(1);
  @Input() set page(v: number | null | undefined) { this.pageSig.set(Number(v) || 1); }

  public perPageSig = signal(5);
@Input() set itemsPerPage(v: number | null | undefined) {
  const n = Number(v) || 5;
  this.perPageSig.set(n);
  this.pageSig.set(1);
}

  // ----- Outputs
  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() rowClick = new EventEmitter<any>();

  // ----- Actions
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

//   // ----- Actions
// @Output() view = new EventEmitter<any>();
// @Output() edit = new EventEmitter<any>();
// @Output() delete = new EventEmitter<any>();

@Output() send = new EventEmitter<any>();
@Output() create = new EventEmitter<any>();
@Output() print = new EventEmitter<any>();


@Output() toggleAll = new EventEmitter<boolean>();
@Output() toggleOne = new EventEmitter<{ row: any; checked: boolean }>();

@Output() xml = new EventEmitter<any>();
@Output() excel = new EventEmitter<any>();
@Output() csv = new EventEmitter<any>();
@Output() zip = new EventEmitter<any>();
@Output() txt = new EventEmitter<any>();

  // ----- Estado de búsqueda
  textSearch = signal('');

  // ----- Derivados reactivos
filtered = computed(() => {
  const rows = this.rowsSig();
  const q = this.textSearch().trim().toLowerCase();

  if (!this.clientSearchSig() || !q) return rows;

  const keys = this.searchableKeysSig();

  return rows.filter(row => {
    const values = keys.length
      ? keys.map(k => row?.[k])
      : Object.entries(row ?? {})
          .filter(([key]) => !key.startsWith('_'))
          .map(([, value]) => value);

    return values.some(value =>
      value !== null &&
      value !== undefined &&
      value
        .toString()
        .toLowerCase()
        .includes(q)
    );
  });
});

  displayTotal = computed(() => {
    if (this.serverPaginationSig()) {
      return this.totalItemsSig() > 0 ? this.totalItemsSig() : this.rowsSig().length;
    }

    return this.filtered().length;
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.displayTotal() / this.perPageSig()))
  );

  currentStart = computed(() =>
    this.displayTotal() === 0 ? 0 : ((this.pageSig() - 1) * this.perPageSig()) + 1
  );

  currentEnd = computed(() =>
    Math.min(this.displayTotal(), this.pageSig() * this.perPageSig())
  );

  paginated = computed(() => {
    if (this.serverPaginationSig()) {
      return this.filtered();
    }

    const start = (this.pageSig() - 1) * this.perPageSig();
    return this.filtered().slice(start, start + this.perPageSig());
  });

  wrapClass(c: ColumnDef) {
    switch (c.wrap) {
      case 'wrap': return 'whitespace-normal break-words'; // permite salto de línea
      case 'nowrap': return 'whitespace-nowrap';             // no corta
      default: return 'truncate';                      // overflow-hidden text-ellipsis whitespace-nowrap
    }
  }

  // ----- Métodos UI
onSearchInput(v: string) {
  this.textSearch.set(v);
  this.pageSig.set(1);
  this.searchChange.emit(v);
}

setItemsPerPage(v: any) {
  const n = Number(v);

  if (!isNaN(n) && n > 0) {
    this.pageSig.set(1);
    this.perPageSig.set(n);
    this.itemsPerPageChange.emit(n);
    this.pageChange.emit(1);
  }
}

  setPage(p: number) {
    const next = Math.min(Math.max(1, p), this.totalPages());
    this.pageSig.set(next);
    this.pageChange.emit(next);
  }
  prev() { this.setPage(this.pageSig() - 1); }
  next() { this.setPage(this.pageSig() + 1); }


 // Custom Table Actions
onRowClick(row: any) {
  this.rowClick.emit(row);
}

onView(row: any) {
  this.view.emit(row);
}

onEdit(row: any) {
  this.edit.emit(row);
}

onDelete(row: any) {
  this.delete.emit(row);
}

onSend(row: any) {
  this.send.emit(row);
}

onCreate(row: any) {
  this.create.emit(row);
}

onPrint(row: any) {
  this.print.emit(row);
}

onToggleAll(checked: boolean) {
  this.toggleAll.emit(checked);
}

onToggleOne(row: any, checked: boolean) {
  this.toggleOne.emit({ row, checked });
}

onFileAction(action: any, row: any) {
  const value = [
    action?.action,
    action?.type,
    action?.title,
    action?.icon,
    row?.fileName,
    row?.pdfFile,
    row?.mimeName,
    row?.mimeType,
    row?.contentType
  ].filter(Boolean).join(' ').toLowerCase();

  if (value.includes('.txt') || value.includes('txt') || value.includes('text/plain')) {
    this.print.emit(row);
    return;
  }

  if (value.includes('.xml') || value.includes('xml')) {
    this.xml.emit(row);
    return;
  }

  this.view.emit(row);
}


}

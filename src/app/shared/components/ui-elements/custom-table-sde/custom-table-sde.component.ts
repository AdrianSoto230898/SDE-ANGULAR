import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewEncapsulation,
  signal,
  computed,
  forwardRef,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as XLSX from 'xlsx-js-style';

export interface ColumnDef {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  widthClass?: string; // ancho fijo opcional del th/td (w-28, min-w-[220px], etc.)
  maxWClass?: string; // max width del contenido (max-w-[240px], max-w-xs, etc.)
  wrap?: 'truncate' | 'wrap' | 'nowrap'; // cómo manejar el texto (default: 'truncate')
  cellClass?: string;
  headClass?: string;
  template?: TemplateRef<any>;
  ellipsisAt?: number;
  truncate?: boolean;
  actions?: { id: string; icon?: string; label?: string; tooltip?: string; click: (r: any) => void }[];
  type?: 'text' | 'date' | 'number' | 'boolean' | 'currency' | 'actions';
}

export interface ActionBarItem {
  id: string;
  label: string;
  icon?: string;
  action?: string;
}

@Component({
  selector: 'app-custom-table-sde',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './custom-table-sde.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomTableSdeComponent ),
      multi: true,
    },
  ],
})
export class CustomTableSdeComponent  {
  // ----- Inputs “normales”
  @Input() title = '';
  @Input() emptyText = 'Sin registros para mostrar';
  @Input() emptyHint = '';
  @Input() loading = false;
  @Input() skeletonRows = 10;
  @Input() enableSearch = true;
  @Input() searchPlaceholder = 'Buscar';
  @Input() columns: ColumnDef[] = [];
  @Input() itemsPerPageOptions: number[] = [5, 10, 15];
  @Input() actionBars: ActionBarItem[] = [];
  @Input() actionBars2: ActionBarItem[] = [];
  @Input() enableExport = false;
  @Input() exportName = 'datos_tabla';
  @Input() actionTitle1 = 'Vistas';
  @Input() actionTitle2 = 'Acciones';
  @Input() maxBodyHeight = '300px';
  @Input() minBodyHeight = '300px';

  // ----- Inputs convertidos a signals (para que los computed reaccionen)
  private rowsSig = signal<any[]>([]);
  @Input() set rows(v: any[] | null | undefined) {
    this.rowsSig.set(v ?? []);
  }

  private clientSearchSig = signal(true);
  @Input() set clientSearch(v: boolean | null | undefined) {
    this.clientSearchSig.set(!!v);
  }

  private searchableKeysSig = signal<string[]>([]);
  @Input() set searchableKeys(v: string[] | null | undefined) {
    this.searchableKeysSig.set(v ?? []);
  }

  public pageSig = signal(1);
  @Input() set page(v: number | null | undefined) {
    this.pageSig.set(Number(v) || 1);
  }

  public perPageSig = signal(5);
  @Input() set itemsPerPage(v: number | null | undefined) {
    this.perPageSig.set(Number(v) || 5);
  }

  selectableSig = signal(false);
  @Input() set selectable(v: boolean | null | undefined) {
    this.selectableSig.set(!!v);
  }

  private rowIdKeySig = signal<string>('id');
  @Input() set rowIdKey(v: string | null | undefined) {
    if (v) this.rowIdKeySig.set(v);
  }

  private rowIdFn: ((row: any) => any) | null = null;
  @Input() set rowId(v: ((row: any) => any) | null | undefined) {
    this.rowIdFn = v ?? null;
  }

  private selectionScopeSig = signal<'page' | 'all'>('page');
  @Input() set selectionScope(v: 'page' | 'all' | null | undefined) {
    if (v) this.selectionScopeSig.set(v);
  }

  @Input() set selectedIds(v: any[] | Set<any> | null | undefined) {
    const next = Array.isArray(v)
      ? new Set(v)
      : v instanceof Set
        ? v
        : new Set();
    this.selectedIdsSig.set(next);
  }
  private selectedIdsSig = signal<Set<any>>(new Set());

  public clearSelection() {
    this.selectedIdsSig.set(new Set());
    this.selectionChange.emit([]);
    this.selectedIdsChange.emit([]);
  }

  // ----- Outputs
  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() selectedIdsChange = new EventEmitter<any[]>();

  // ----- Actions
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() action = new EventEmitter<ActionBarItem>();

  get hasSelected(): boolean {
    return this.selectedIdsSig().size > 0;
  }

  get hasActionBars(): boolean {
    return (this.actionBars?.length ?? 0) > 0;
  }

  get hasActionBars2(): boolean {
    return (this.actionBars2?.length ?? 0) > 0;
  }

  get ActionsNav() {
    return this.actionBars?.slice(0) ?? [];
  }

  get Actions() {
    return this.actionBars2?.slice(0) ?? [];
  }

  // ----- Estado de búsqueda, ordenamiento y filtrado por columnas
  textSearch = signal('');
  sortConfig = signal<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  columnFilters = signal<Record<string, string>>({});

  // ----- Derivados reactivos
  filtered = computed(() => {
    let rows = this.rowsSig();

    // 1. Filtrado Global
    const q = this.textSearch().trim().toLowerCase();
    if (this.clientSearchSig() && q) {
      const keys = this.searchableKeysSig();
      rows = rows.filter((r) => {
        const values = keys.length
          ? keys.map((k) => r?.[k])
          : Object.values(r ?? {});
        return values.some((v) => (v ?? '').toString().toLowerCase().includes(q));
      });
    }

    // 2. Filtrado por Columnas
    const filters = this.columnFilters();
    const activeFilterKeys = Object.keys(filters).filter(k => filters[k]?.trim());

    if (activeFilterKeys.length > 0) {
      rows = rows.filter(r => {
        return activeFilterKeys.every(key => {
          const val = r?.[key]?.toString().toLowerCase() ?? '';
          const filterVal = filters[key].toLowerCase();
          return val.includes(filterVal);
        });
      });
    }

    // 3. Ordenamiento
    const sort = this.sortConfig();
    if (sort) {
      rows = [...rows].sort((a, b) => {
        const valA = a?.[sort.key] ?? '';
        const valB = b?.[sort.key] ?? '';

        if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return rows;
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.perPageSig()))
  );

  paginated = computed(() => {
    const start = (this.pageSig() - 1) * this.perPageSig();
    return this.filtered().slice(start, start + this.perPageSig());
  });

  wrapClass(c: ColumnDef) {
    switch (c.wrap) {
      case 'wrap':
        return 'whitespace-normal break-words'; // permite salto de línea
      case 'nowrap':
        return 'whitespace-nowrap'; // no corta
      default:
        return 'truncate'; // overflow-hidden text-ellipsis whitespace-nowrap
    }
  }

  // ----- Check

  /** Retorna ids seleccionados (snapshot) */
  public getSelectedIds(): any[] {
    return [...this.selectedIdsSig()];
  }

  /** Retorna filas seleccionadas (snapshot) */
  public getSelectedRows(): any[] {
    return this.selectedRows();
  }

  /** Selecciona por ids; mergea por defecto */
  public selectIds(ids: any[], merge = true) {
    const current = merge ? new Set(this.selectedIdsSig()) : new Set<any>();
    for (const id of ids ?? []) current.add(id);
    this.selectedIdsSig.set(current);
    this._emitSelection();
  }

  /** Deselecciona por ids */
  public deselectIds(ids: any[]) {
    const next = new Set(this.selectedIdsSig());
    for (const id of ids ?? []) next.delete(id);
    this.selectedIdsSig.set(next);
    this._emitSelection();
  }

  /** Selecciona todo en el scope actual (página o todo) */
  public selectAllOnScope() {
    this.toggleAll(true);
  }

  /** Limpia toda la selección  */
  public deselectAllOnScope() {
    this.toggleAll(false);
  }

  private getRowId = (row: any) =>
    this.rowIdFn ? this.rowIdFn(row) : row?.[this.rowIdKeySig()];

  private scopeSlice = computed(() =>
    this.selectionScopeSig() === 'page' ? this.paginated() : this.filtered()
  );

  selectedRows = computed(() => {
    const ids = this.selectedIdsSig();
    return this.filtered().filter((r) => ids.has(this.getRowId(r)));
  });

  allSelectedOnScope = computed(() => {
    const slice = this.scopeSlice();
    if (!slice.length) return false;
    const ids = this.selectedIdsSig();
    return slice.every((r) => ids.has(this.getRowId(r)));
  });

  someSelectedOnScope = computed(() => {
    const slice = this.scopeSlice();
    const ids = this.selectedIdsSig();
    const n = slice.filter((r) => ids.has(this.getRowId(r))).length;
    return n > 0 && n < slice.length;
  });

  isSelected(row: any): boolean {
    return this.selectedIdsSig().has(this.getRowId(row));
  }

  toggleRow(row: any, checked: boolean) {
    const id = this.getRowId(row);
    if (id === undefined) return;
    const next = new Set(this.selectedIdsSig());
    checked ? next.add(id) : next.delete(id);
    this.selectedIdsSig.set(next);
    this._emitSelection();
  }

  toggleAll(checked: boolean) {
    const next = new Set(this.selectedIdsSig());
    for (const r of this.scopeSlice()) {
      const id = this.getRowId(r);
      if (id === undefined) continue;
      checked ? next.add(id) : next.delete(id);
    }
    this.selectedIdsSig.set(next);
    this._emitSelection();
  }

  private _emitSelection() {
    const ids = [...this.selectedIdsSig()];
    this.selectedIdsChange.emit(ids);
    this.selectionChange.emit(this.selectedRows());
  }

  private _pruneSelectionAgainstData() {
    const data = this.rowsSig();
    const idKey = this.rowIdKeySig();
    const idsInData = new Set<any>(
      data.map((r) => (this.rowIdFn ? this.rowIdFn(r) : r?.[idKey]))
    );
    const before = this.selectedIdsSig();
    const after = new Set<any>();
    before.forEach((id) => {
      if (idsInData.has(id)) after.add(id);
    });
    if (after.size !== before.size) {
      this.selectedIdsSig.set(after);
      this._emitSelection();
    }
  }

  // ----- Excel
  hasData = computed(() => (this.rowsSig()?.length ?? 0) > 0);

  exportToExcel(): void {
    try {
      const cols = this.columns ?? [];
      const headers = cols.map((c) => c.header);
      const keys = cols.map((c) => c.key);
      const sourceRows = this.rowsSig() ?? [];

      if (!sourceRows.length) return;

      const data = sourceRows.map((row) =>
        keys.map((k, idx) => {
          const col = cols[idx];
          const val = row?.[k];
          switch (col?.type) {
            case 'boolean':
              return val === true ? 'Sí' : val === false ? 'No' : '';
            case 'date': {
              const d = val instanceof Date ? val : val ? new Date(val) : null;
              return d ?? ''; // deja Date para que Excel lo reconozca
            }
            case 'number':
            case 'currency': {
              const n = Number(val);
              return isNaN(n) ? '' : n;
            }
            default:
              return (val ?? '').toString();
          }
        })
      );

      const aoa = [headers, ...data];
      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // --- Estilo de encabezado (fila 1) ---
      const headerStyle: XLSX.CellStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1F2937' } }, // gris oscuro (Tailwind slate-800)
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: 'E5E7EB' } },
          right: { style: 'thin', color: { rgb: 'E5E7EB' } },
          bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
          left: { style: 'thin', color: { rgb: 'E5E7EB' } },
        },
      };

      // aplica el estilo a cada celda de la fila 1
      for (let c = 0; c < headers.length; c++) {
        const addr = XLSX.utils.encode_cell({ r: 0, c });
        if (!ws[addr]) ws[addr] = { t: 's', v: headers[c] };
        (ws[addr] as any).s = headerStyle;
      }

      // altura de la fila de encabezado
      (ws as any)['!rows'] = [{ hpx: 28 }];

      // autofiltro para toda la tabla
      const range = XLSX.utils.decode_range(ws['!ref'] as string);
      (ws as any)['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

      // congelar encabezado
      (ws as any)['!freeze'] = {
        xSplit: 0,
        ySplit: 1,
        topLeftCell: 'A2',
        activePane: 'bottomLeft',
        state: 'frozen',
      };

      // formatos numéricos opcionales
      for (let r = 1; r <= data.length; r++) {
        for (let c = 0; c < cols.length; c++) {
          const cellAddr = XLSX.utils.encode_cell({ r, c });
          const col = cols[c];
          const cell = (ws as any)[cellAddr];
          if (!cell) continue;
          if (col?.type === 'currency' && typeof cell.v === 'number')
            cell.z = '"$"#,##0.00;[Red]-"$"#,##0.00';
          if (col?.type === 'number' && typeof cell.v === 'number')
            cell.z = '#,##0.00';
        }
      }

      // auto ancho
      const colWidths = headers.map((h, i) => {
        const maxLen = Math.max(
          (h ?? '').toString().length,
          ...data.map((r) => (r[i] ?? '').toString().length)
        );
        return { wch: Math.min(Math.max(10, maxLen + 2), 60) };
      });
      (ws as any)['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Datos');

      const fileName = `${this.exportName || 'tabla'}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Error al exportar a Excel:', err);
    }
  }

  // ----- Métodos UI
  onSearchInput(v: string) {
    this.textSearch.set(v);
    this.searchChange.emit(v);
    this.pageSig.set(1);
  }

  setItemsPerPage(v: any) {
    const n = Number(v);
    if (!isNaN(n)) {
      this.perPageSig.set(n);
      this.itemsPerPageChange.emit(n);
      this.pageSig.set(1);
    }
  }

  setPage(p: number) {
    const next = Math.min(Math.max(1, p), this.totalPages());
    this.pageSig.set(next);
    this.pageChange.emit(next);
  }
  prev() {
    this.setPage(this.pageSig() - 1);
  }
  next() {
    this.setPage(this.pageSig() + 1);
  }

  // Custom Table Actions
  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  onView(row: any) { }
  onEdit(row: any) { }
  onDelete(row: any) { }

  onActionClick(item: ActionBarItem) {
    this.action.emit(item);
  }

  // Sorting & Filtering UI Methods
  setSort(key: string, direction: 'asc' | 'desc' | null) {
    if (!direction) {
      this.sortConfig.set(null);
    } else {
      this.sortConfig.set({ key, direction });
    }
  }

  isSort(key: string, direction: 'asc' | 'desc'): boolean {
    const s = this.sortConfig();
    return s?.key === key && s.direction === direction;
  }

  hasFilterOrSort(key: string): boolean {
    const s = this.sortConfig();
    const f = this.columnFilters();
    const hasSort = s?.key === key;
    const hasFilter = !!f[key];
    return hasSort || hasFilter;
  }

  toggleSort(key: string) {
    const current = this.sortConfig();
    if (current?.key === key) {
      if (current.direction === 'asc') {
        this.sortConfig.set({ key, direction: 'desc' });
      } else {
        this.sortConfig.set(null); // Remove sort
      }
    } else {
      this.sortConfig.set({ key, direction: 'asc' });
    }
  }

  updateColumnFilter(key: string, value: string) {
    const current = { ...this.columnFilters() };
    if (!value) delete current[key];
    else current[key] = value;
    this.columnFilters.set(current);
    this.pageSig.set(1); // Reset to first page on filter change
  }

  getSortIcon(key: string): string {
    const sort = this.sortConfig();
    if (sort?.key !== key) return 'icon-[solar--sort-linear] text-neutral-400';
    return sort.direction === 'asc'
      ? 'icon-[solar--sort-from-bottom-to-top-linear] text-primary'
      : 'icon-[solar--sort-from-top-to-bottom-linear] text-primary';
  }
}

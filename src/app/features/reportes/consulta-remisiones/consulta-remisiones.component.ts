import {
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  ActionBarItem,
  ColumnDef,
  CustomTableComponent,
} from '../../../shared/components/ui-elements/custom-table-sde/custom-table-sde.component';

import { CustomInputComponent } from '../../../shared/components/ui-elements/custom-input/custom-input.component';

import { InfoDialogComponent } from '../../../shared/components/ui-elements/info-dialog/info-dialog.component';

import { LocalService } from '../../../core/services/shared/storage/local.service';

import {
  ConsultaRemisionItem,
  ConsultaRemisionesRequest,
  ConsultaRemisionesResponse,
} from './model/consulta-remisiones.model';

import { ConsultaRemisionesService } from './services/consulta-remisiones.service';

const STORAGE_KEY = 'consulta-remisiones';

// type FormKeys =
//   | 'remisionID'
//   | 'sociedad'
//   | 'clienteId'
//   | 'clienteConsignatarioNumero';

type RemisionRow = ConsultaRemisionItem & {
  id: string;
};

type StoredFilters = {
  form: {
    remisionID: string;
    sociedad: string;
    clienteId: string;
    clienteConsignatarioNumero: string;
    fechaInicio: string;
    fechaFin: string;
  };
  when: string;
};

@Component({
  selector: 'app-consulta-remisiones',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CustomInputComponent,
    CustomTableComponent,

    InfoDialogComponent,
  ],
  templateUrl: './consulta-remisiones.component.html',
  styleUrls: [],
})
export class ConsultaRemisionesComponent {
  private fb = inject(FormBuilder);
  private api = inject(ConsultaRemisionesService);
  private router = inject(Router);
  private local = inject(LocalService);

  @ViewChild(CustomTableComponent) table!: CustomTableComponent;

  // @ViewChild('excelDialog', { static: false })
  // excelDialog!: ElementRef<HTMLDialogElement>;

  // @ViewChild('exc') exc!: ExcelModalComponent;

  @ViewChild('infoModal') infoModal!: InfoDialogComponent;

  frm!: FormGroup;

  filtrosAbiertos = signal(true);
  rows = signal<RemisionRow[]>([]);
  selectedIds: any[] = [];
  selectedRows: RemisionRow[] = [];

  loading = false;

  currentPage = 1;
  itemsPerPage = 10;

  // modalTitle = signal<string>('Selector desde Excel');
  // modalHeader = signal<string>('Campo');
  // modalKey = signal<string>('codigo');
  // targetControl = signal<FormKeys | null>(null);

  infoData: any = null;

  pageTitle = computed(() => 'Consulta de Remisiones');
  pageSubtitle = computed(() => 'Consulta y descarga de documentos REM');

  exportFileName = computed(() => 'consulta_remisiones');

  columnsDef = computed<ColumnDef[]>(() => [
    {
      key: 'remisionID',
      header: 'Remisión',
      type: 'text',
      align: 'left',
      widthClass: 'w-[140px]',
      wrap: 'nowrap',
    },
    {
      key: 'sociedad',
      header: 'Sociedad',
      type: 'text',
      align: 'left',
      widthClass: 'w-[120px]',
      wrap: 'nowrap',
    },
    {
      key: 'clienteId',
      header: 'Cliente',
      type: 'text',
      align: 'left',
      widthClass: 'w-[130px]',
      wrap: 'nowrap',
    },
    {
      key: 'clienteConsignatarioNumero',
      header: 'Cliente Consignatario',
      type: 'text',
      align: 'left',
      widthClass: 'w-[180px]',
      wrap: 'nowrap',
    },
    {
      key: 'fechaRemision',
      header: 'Fecha Remisión',
      type: 'date',
      align: 'center',
      widthClass: 'w-[150px]',
      wrap: 'nowrap',
    },
    {
      key: 'fechaRecepcionSDE',
      header: 'Fecha Recepción SDE',
      type: 'date',
      align: 'center',
      widthClass: 'w-[180px]',
      wrap: 'nowrap',
    },
    {
      key: 'documentoNombreConExtension',
      header: 'Documento',
      type: 'text',
      align: 'left',
      widthClass: 'w-[260px]',
      wrap: 'truncate',
    },
    {
      key: 'formatoDeDocumento',
      header: 'Formato',
      type: 'text',
      align: 'center',
      widthClass: 'w-[120px]',
      wrap: 'nowrap',
    },
  ]);

  searchableKeys = computed<string[]>(() => [
    'remisionID',
    'sociedad',
    'clienteId',
    'clienteConsignatarioNumero',
    'documentoNombreConExtension',
    'formatoDeDocumento',
  ]);

  actionBars: ActionBarItem[] = [
    {
      id: 'descargar',
      label: 'Descargar',
      icon: '',
    },
  ];

  rowIdForRemision = (r: RemisionRow) => r.id;

  infoConfig: Record<string, any> = {
    remisionID: {
      title: 'Remisión',
      example:
        'Número de remisión. Si capturas este campo, no es obligatorio enviar rango de fechas.',
    },
    sociedad: {
      title: 'Sociedad',
      example: 'Sociedad asociada a la remisión.',
    },
    clienteId: {
      title: 'Cliente',
      example: 'Número de cliente solicitante.',
    },
    clienteConsignatarioNumero: {
      title: 'Cliente Consignatario',
      example: 'Número de cliente consignatario.',
    },
    fechaInicio: {
      title: 'Fecha Inicio',
      example:
        'Fecha inicial de embarque. Si no capturas remisión, el SP busca por rango de fechas.',
    },
    fechaFin: {
      title: 'Fecha Fin',
      example:
        'Fecha final de embarque. El rango máximo permitido por el SP es de 1 mes.',
    },
  };

  async ngOnInit(): Promise<void> {
    this.initComponent();

    const localStored = await this.local.getJsonValue(STORAGE_KEY);

    if (localStored) {
      this.frm.patchValue(localStored.form ?? {}, { emitEvent: false });
      await this.onBuscar(true);
    } else {
      this.setDefaultDates();
      await this.onBuscar(true);
    }
  }

  ngOnDestroy(): void {
    this.loading = false;
    this.rows.set([]);
  }

  initComponent(): void {
    this.frm = this.fb.group({
      remisionID: [''],
      sociedad: [''],
      clienteId: [''],
      clienteConsignatarioNumero: [''],
      fechaInicio: [''],
      fechaFin: [''],
    });

    this.loading = false;
    this.currentPage = 1;
    this.rows.set([]);
    this.selectedIds = [];
    this.selectedRows = [];
  }

  private setDefaultDates(): void {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    this.frm.patchValue(
      {
        fechaInicio: this.toInputDate(lastMonth),
        fechaFin: this.toInputDate(today),
      },
      { emitEvent: false },
    );
  }

  private toInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private compact(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(obj ?? {}).filter(([_, v]) => {
        if (typeof v === 'string') return v.trim() !== '';
        return v !== null && v !== undefined && v !== '';
      }),
    );
  }

  private buildPayload(): ConsultaRemisionesRequest {
    const raw = this.frm.getRawValue();

    return this.compact({
      remisionID: raw.remisionID,
      sociedad: raw.sociedad,
      clienteId: raw.clienteId,
      clienteConsignatarioNumero: raw.clienteConsignatarioNumero,
      fechaInicio: raw.fechaInicio || null,
      fechaFin: raw.fechaFin || null,
    }) as ConsultaRemisionesRequest;
  }

  private buildStoredFilters(): StoredFilters {
    return {
      form: this.frm.getRawValue(),
      when: new Date().toISOString(),
    };
  }

  private validarRangoFechas(): boolean {
    const remisionID = (this.frm.get('remisionID')?.value ?? '').trim();

    if (remisionID) return true;

    const fechaInicio = this.frm.get('fechaInicio')?.value;
    const fechaFin = this.frm.get('fechaFin')?.value;

    if (!fechaInicio || !fechaFin) return true;

    const inicio = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T00:00:00`);

    if (inicio > fin) {
      this.rows.set([]);
      return false;
    }

    const diffMs = fin.getTime() - inicio.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > 31) {
      this.rows.set([]);
      return false;
    }

    return true;
  }

  async onBuscar(isInitialLoad = false): Promise<void> {
    if (!this.validarRangoFechas()) return;

    this.loading = true;
    this.currentPage = 1;

    const payload = this.buildPayload();

try {
  const res: ConsultaRemisionesResponse =
    await this.api.consultarRemisiones(payload);

  this.loading = false;

  if (res.codigo !== 'OK' || !res.data) {
    this.rows.set([]);
    return;
  }

  const mappedRows = (res.data.items ?? []).map((x) => ({
    ...x,
    id: x.remisionID,
  }));

  this.rows.set(mappedRows);

  await this.local.setJsonValue(
    STORAGE_KEY,
    this.buildStoredFilters(),
  );
} catch (error) {
  console.error('❌ Error consultando remisiones 👉', error);
  this.loading = false;
  this.rows.set([]);
}
  }

  async onClearFilters(): Promise<void> {
    this.frm.reset({
      remisionID: '',
      sociedad: '',
      clienteId: '',
      clienteConsignatarioNumero: '',
      fechaInicio: '',
      fechaFin: '',
    });

    this.setDefaultDates();

    this.selectedIds = [];
    this.selectedRows = [];
    this.table?.clearSelection?.();

    this.currentPage = 1;
    this.rows.set([]);

    await this.local.removeItem(STORAGE_KEY);

    await this.onBuscar(true);
  }

  toggleFiltros(): void {
    this.filtrosAbiertos.update((v) => !v);
  }

  navigateToMain(): void {
    this.router.navigate(['/main']);
  }

  onSelectionIds(ids: any[]): void {
    this.selectedIds = ids;
  }

  onSelectionRows(rows: RemisionRow[]): void {
    this.selectedRows = rows;
  }

  openInfoModal(field: string): void {
    this.infoData = this.infoConfig[field];
    this.infoModal.open();
  }

  // openExcelFor(ctrl: FormKeys, title: string, header: string): void {
  //   this.targetControl.set(ctrl);
  //   this.modalTitle.set(title);
  //   this.modalHeader.set(header);
  //   this.modalKey.set(ctrl);

  //   queueMicrotask(() => this.exc?.resetModal());
  //   queueMicrotask(() => this.excelDialog?.nativeElement?.showModal());
  // }

  // onExcelOk(value: string): void {
  //   const ctrl = this.targetControl();

  //   if (!ctrl) return;

  //   const control = this.frm.get(ctrl);
  //   control?.setValue(value);
  //   control?.markAsTouched();
  //   control?.updateValueAndValidity();

  //   queueMicrotask(() => this.excelDialog?.nativeElement?.close());
  // }

  async onActionTriggeredById(actionId: string): Promise<void> {
    if (actionId === 'descargar') {
      await this.descargarSeleccionadas();
    }
  }

  private async descargarSeleccionadas(): Promise<void> {
    if (!this.selectedRows.length) {
      return;
    }

    for (const row of this.selectedRows) {
      try {
        // const blob = await firstValueFrom(
        //   this.api.descargarRemision(row.remisionID),
        // );

        // const fileName =
        //   row.documentoNombreConExtension ||
        //   `REM_${row.remisionID}.pdf`;

        // this.downloadBlob(blob, fileName);
      } catch {
        // Puedes reemplazar esto por toast/notificación
      }
    }
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, effect, inject, resource, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../access/services/auth.service';
import {
  DocumentField,
  DocumentFieldsResponse,
  DocumentGridItem,
  DocumentGridPageResponse,
  DocumentMultifileRequest,
  DocumentQueueBulkRequest,
  DocumentTypeOption,
} from '../models/documents.models';
import { DocumentsApiService } from '../services/documents-api.service';
import { environment } from '../../../../environments/environment';
import { CustomButtonComponent } from '../../../shared/components/ui-elements/custom-button/custom-button.component';
import { CustomSelectSearchComponent, MyOptionType } from '../../../shared/components/ui-elements/custom-select-search/custom-select-search.component';
import { CustomTableComponent, ColumnDef } from '../../../shared/components/ui-elements/custom-table/custom-table.component';
import { CustomInputComponent } from '../../../shared/components/ui-elements/custom-input/custom-input.component';
import { DateInputComponent } from '../../../shared/components/ui-elements/date-input/date-input.component';
import { DateRange } from '../../../shared/components/ui-elements/custom-date/custom-date.component';
import { SendMailModalComponent } from '../../../shared/components/send-mail-modal/send-mail-modal.component';
import { SendMailConfigResponse } from '../../../shared/models/popSend/popSend.model';

const EMPTY_FIELDS_RESPONSE: DocumentFieldsResponse = {
  documentType: '',
  fields: [],
  values: {},
  autoCompleteFilters: {}
};

const EMPTY_GRID_RESPONSE: DocumentGridPageResponse = {
  recordsFiltered: 0,
  data: []
};

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomButtonComponent,
    CustomSelectSearchComponent,
    CustomTableComponent,
    CustomInputComponent,
    DateInputComponent,
        SendMailModalComponent // 👈 ESTE

  ],
  templateUrl: './documents.page.html'
})
export class DocumentsPage {
  private readonly documentsApi = inject(DocumentsApiService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly selectedDocumentType = signal('');
  readonly groupedDocumentTypes = signal<string[]>([]);
  readonly selectedGroupedDocumentType = signal('');
  // readonly groupedHeaders = signal<DocumentField[]>([]);

  readonly draftDateFrom = signal(this.getFirstDayOfMonth());
  readonly draftDateTo = signal(this.getToday());
  readonly submittedDateFrom = signal(this.getFirstDayOfMonth());
  readonly submittedDateTo = signal(this.getToday());
  readonly draftFilters = signal<Record<string, string>>({});
  readonly submittedFilters = signal<Record<string, string>>({});
  readonly pageIndex = signal(0);
  readonly pageSize = signal(50);
  readonly sortColumn = signal('');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly selectedRows = signal<Record<string, boolean>>({});
  readonly actionMessage = signal<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null);
  readonly currentUserName = signal('Usuario');
  readonly currentUserEmail = signal('');
  readonly clientLookup = signal<{ prefix: string; filter: string }>({ prefix: '', filter: '' });
  readonly filtersExpanded = signal(true);
  readonly groupedDocExpanded = signal(true);

  readonly hideFiltersByMenu = signal(false);
  readonly selectedMenuLabel = signal('');

  readonly groupedHeaders = signal<DocumentField[]>([]);
readonly groupedFilterHeaders = signal<DocumentField[]>([]);
readonly page = signal(1);
// readonly pageSize = signal(50);

readonly showSendModal = signal(false);
readonly sendMailForm = signal<SendMailConfigResponse | null>(null);

  private readonly DUMMY_DOCUMENT_TYPES: DocumentTypeOption[] = [
    { code: 'FAC', name: 'Factura' },
    { code: 'REM', name: 'Remisión' },
    { code: 'NC', name: 'Nota de Crédito' },
    { code: 'ND', name: 'Nota de Débito' },
    { code: 'PED', name: 'Pedido' },
  ];

  readonly documentTypesResource = resource<DocumentTypeOption[], void>({
    defaultValue: [],
    loader: async () => this.documentsApi.getDocumentTypes()
  });

  readonly fieldsResource = resource<DocumentFieldsResponse, { documentType: string }>({
    defaultValue: EMPTY_FIELDS_RESPONSE,
    params: () => ({
      documentType: this.selectedDocumentType()
    }),
    loader: async ({ params }) => {
      if (!params.documentType) {
        return EMPTY_FIELDS_RESPONSE;
      }

      return this.documentsApi.getDocumentFields(params.documentType);
    }
  });

  readonly gridResource = resource<DocumentGridPageResponse, {
    documentType: string;
    dateFrom: string;
    dateTo: string;
    filters: Record<string, string>;
    userId: string;
    sqlWhere: string;
    start: number;
    length: number;
    sortColumn: string;
    sortDirection: string;
  }>(
    {
    
    defaultValue: EMPTY_GRID_RESPONSE,
    params: () => ({
      
      documentType: this.selectedDocumentType(),
      dateFrom: this.formatDateForApi(this.submittedDateFrom()),
      dateTo: this.formatDateForApi(this.submittedDateTo()),
      filters: this.submittedFilters(),
      userId: this.currentUserEmail(),
      sqlWhere: '',
      start: (this.page() - 1) * this.pageSize(),
      length: this.pageSize(),
      sortColumn: this.sortColumn(),
      sortDirection: this.sortDirection()
    }),
    loader: async ({ params }) => {
      if (!params.documentType) {
        return EMPTY_GRID_RESPONSE;
      }
      return this.documentsApi.getGridPage(params);
    }
  });

  readonly clientsResource = resource<{ id: string; sap: string; name: string; text: string }[], { prefix: string; filter: string }>({
    defaultValue: [],
    params: () => this.clientLookup(),
    loader: async ({ params }) => {
      if (!params.filter || params.prefix.trim().length < 2) {
        return [];
      }

      return this.documentsApi.getClientSuggestions(params.prefix, params.filter);
    }
  });

  readonly fields = computed(() =>
    [...this.fieldsResource.value().fields].sort((left, right) => left.order - right.order)
  );

readonly visibleFields = computed(() =>
  this.groupedFilterHeaders().length > 0 ? this.groupedFilterHeaders() : this.fields()
);

  readonly gridRows = computed(() => this.gridResource.value().data ?? []);
  readonly totalRecords = computed(() => this.gridResource.value().recordsFiltered ?? 0);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalRecords() / this.pageSize()) || 1));
  readonly startRecord = computed(() => this.totalRecords() === 0 ? 0 : this.pageIndex() * this.pageSize() + 1);
  readonly endRecord = computed(() => Math.min(this.totalRecords(), (this.pageIndex() + 1) * this.pageSize()));

  readonly selectedMultifileItems = computed(() => this.gridRows()
    .filter((item: DocumentGridItem) => this.isRowSelected(item))
    .map((item: DocumentGridItem) => ({
      id: this.parseDocumentId(item.documentId),
      remision: item.documentNumber
    }))
    .filter((item: { id: number; remision: string }) => !!item.remision)
  );

  readonly selectedQueueItems = computed(() =>
    this.selectedMultifileItems().filter((item: { id: number; remision: string }) => item.id > 0)
  );

  readonly selectionCount = computed(() => this.selectedMultifileItems().length);

  readonly documentTypeLabel = computed(() =>
    this.documentTypesResource.value().find((item) => item.code === this.selectedDocumentType())?.name ?? 'Documentos'
  );

  readonly gridErrorMessage = computed(() => this.gridResource.error()?.message ?? '');
  readonly fieldsErrorMessage = computed(() => this.fieldsResource.error()?.message ?? '');

  readonly documentTypeOptions = computed<MyOptionType[]>(() => {
    let source = this.documentTypesResource.value();

    if (!environment.production || source.length === 0 || source[0]?.code === 'string') {
      source = this.DUMMY_DOCUMENT_TYPES;
    }

    return source.map((t: DocumentTypeOption) => ({
      value: t.code,
      label: `${t.code} - ${t.name}`
    }));
  });

  readonly selectedDocumentTypeOption = computed<MyOptionType | null>(() => {
    const code = this.selectedDocumentType();
    return code ? { value: code, label: code } : null;
  });

  readonly groupedDocumentTypeOptions = computed<MyOptionType[]>(() =>
    this.groupedDocumentTypes().map(type => ({
      value: type,
      label: type
    }))
  );

  readonly selectedGroupedDocumentTypeOption = computed<MyOptionType | null>(() => {
    const code = this.selectedGroupedDocumentType();
    return code ? { value: code, label: code } : null;
  });

  dateFrom: DateRange = { start: this.parseIsoToDate(this.draftDateFrom()) };
  dateTo: DateRange = { start: new Date() };

  constructor() {
    this.route.queryParams.subscribe(params => {
      console.log('QUERY PARAMS 👉', params);

      const type = params['type'];

      if (type) {
        void this.setDocumentTypeFromMenu(type);
      }
    });

    effect(() => {
      const types = this.documentTypesResource.value();
      if (!this.selectedDocumentType() && types.length > 0) {
        this.selectDocumentType(types[0].code);
      }
    });

    void this.loadProfile();
  }

  onDateFromChange(range: DateRange): void {
    if (range?.start) {
      this.draftDateFrom.set(this.dateToIso(range.start));
    }
  }

  onDateToChange(range: DateRange): void {
    if (range?.start) {
      this.draftDateTo.set(this.dateToIso(range.start));
    }
  }

readonly tableColumns = computed<ColumnDef[]>(() => {
  const source = this.groupedHeaders().length > 0
    ? this.groupedHeaders()
    : this.fields();

  const dynCols: ColumnDef[] = source.map((f: DocumentField) => ({
    key: f.id,
    header: f.friendlyName,
    wrap: 'wrap',
    truncate: false,
    maxWClass: 'max-w-[420px]',
    align: (f.alignText ?? '').toLowerCase().includes('right')
      ? 'right'
      : (f.alignText ?? '').toLowerCase().includes('center')
        ? 'center'
        : 'left'
  }));

  const cols: ColumnDef[] = [];

  // if (this.selectedDocumentType() === 'NCC') {
    cols.push({
      key: 'selector',
      header: '',
      widthClass: 'w-12',
      type: 'checkbox'
    });
  // }

  cols.push(
    {
      key: 'id',
      header: 'Id',
      widthClass: 'w-20'
    },
    {
      key: 'acciones',
      header: 'Estatus',
      widthClass: 'w-28',
      // actions: [
      //   { id: 'view', icon: 'ph ph-file-pdf', click: (_row: any) => {} },
      //   { id: 'edit', icon: 'ph ph-download-simple', click: (_row: any) => {} }
      // ]
    },
// {
//   key: 'enviar',
//   header: 'Enviar',
//   type: 'text'
// },
//     {
//       key: 'crear',
//       header: 'Crear',
//       type: 'text'
//     },
    // {
    //   key: 'imprimir',
    //   header: 'Imprimir',
    //   type: 'text'
    // },
    ...dynCols
  );

  return cols;
});

readonly tableRows = computed(() =>
  this.gridRows().map((item: any) => {

    const normalized = {
      ...item,

      // 🔥 Alias para compatibilidad MVC
      doPDFOk: item.doPDFOk ?? item.pdfOk,
      doPDFFile: item.doPDFFile ?? item.pdfFile,
      doSentOk: item.doSentOk ?? item.sentOk,
      doPrintedOk: item.doPrintedOk ?? item.printedOk,
      doPackagedOk: item.doPackagedOk ?? item.packagedOk,
      docType: item.docType ?? item.documentType,
      doId: item.doId ?? item.documentId,
      doNumber: item.doNumber ?? item.documentNumber
    };

    return {
      _rowRef: normalized,

      selector: this.isRowSelected(normalized),
      id: normalized.doId,

      acciones: this.getStatusActions(normalized),

enviar: this.hasValue(normalized.doPDFOk) ? 'Enviar' : '',
      crear: this.getCreateText(normalized),
      imprimir: this.canPrint(normalized.docType) ? 'Imprimir' : '',

      ...item.dynamicItems
    };
  })
);

// readonly tableColumns = computed<ColumnDef[]>(() => {
//   const source = this.groupedHeaders().length > 0 ? this.groupedHeaders() : this.fields();

// const dynCols: ColumnDef[] = source.map((f: DocumentField) => ({
//   key: f.id,
//   header: f.friendlyName,
//   wrap: 'wrap',
//   truncate: false,
//   maxWClass: 'max-w-[420px]',
//   align: (f.alignText ?? '').toLowerCase().includes('right')
//     ? 'right'
//     : (f.alignText ?? '').toLowerCase().includes('center')
//       ? 'center'
//       : 'left'
// }));

//   return [
//     {
//       key: 'selector',
//       header: '',
//       widthClass: 'w-12',
//       type: 'checkbox'
//     },
//     {
//       key: 'id',
//       header: 'Id',
//       widthClass: 'w-20'
//     },
//     {
//       key: 'acciones',
//       header: 'Acciones',
//       widthClass: 'w-24',
//       actions: [
//         { id: 'view', icon: 'ph ph-file-pdf', click: (_row: any) => {} },
//         { id: 'edit', icon: 'ph ph-download-simple', click: (_row: any) => {} }
//       ]
//     },
//     {
//       key: 'enviar',
//       header: 'Enviar'
//     },
//     {
//       key: 'crear',
//       header: 'Crear'
//     },
//     {
//       key: 'imprimir',
//       header: 'Imprimir'
//     },
//     ...dynCols
//   ];
// });

// readonly tableRows = computed(() =>
//   this.gridRows().map((item: DocumentGridItem) => ({
//     _rowRef: item,

//     selector: this.isRowSelected(item),
//     id: item.documentId,

//     enviar: 'Generar',
//     crear: 'Generar',
//     imprimir: 'Imprimir',

//     ...item.dynamicItems
//   }))
// );

  onDocumentTypeChange(option: MyOptionType | null): void {
    const code = option?.value ?? '';
    if (code && code !== this.selectedDocumentType()) {
      this.selectDocumentType(code);
    }
  }

async onGroupedDocumentTypeChange(option: MyOptionType | null): Promise<void> {
  const code = option?.value ?? '';

  if (!code) {
    this.selectedGroupedDocumentType.set('');
    this.groupedHeaders.set([]);
    this.groupedFilterHeaders.set([]);
    return;
  }

  this.selectedGroupedDocumentType.set(code);
  this.selectedDocumentType.set(code);

  const headers = await this.documentsApi.getHeaders(code);
  this.groupedHeaders.set(headers ?? []);

  const filterHeaders = await this.documentsApi.getHeaders(code, 'T');
  this.groupedFilterHeaders.set(filterHeaders ?? []);

  this.gridResource.reload();
}
async exportExcel(): Promise<void> {
  const request = this.buildExportRequest();

  const documentTypeAgr =
    this.selectedMenuLabel()?.trim() ||
    this.selectedDocumentType()?.trim() ||
    'DOCUMENTOS';

  const subDocument =
    this.selectedGroupedDocumentType()?.trim();

  const fileName = subDocument
    ? `${documentTypeAgr}_${subDocument}_Excel.xlsx`
    : `${documentTypeAgr}_Excel.xlsx`;

  console.group('📊 EXPORT EXCEL');
  console.log('📤 Request', request);
  console.log('📌 DocumentType', request.documentType);
  console.log('📅 DateFrom', request.dateFrom);
  console.log('📅 DateTo', request.dateTo);
  console.log('🔎 Filters', request.filters);
  console.log('👤 UserId', request.userId);
  console.log('🗂️ FileName', fileName);

  try {
    console.time('⏱️ exportExcel');

    await this.documentsApi.exportExcel(
      request,
      fileName
    );

    console.timeEnd('⏱️ exportExcel');

    console.log('✅ Excel descargado correctamente');

    this.actionMessage.set({
      kind: 'success',
      text: 'Se generó el archivo de Excel con los filtros actuales.'
    });

  } catch (error) {
    console.error('❌ Error exportExcel', error);

    this.handleActionError(
      'No fue posible exportar a Excel.',
      error
    );
  } finally {
    console.groupEnd();
  }
}

  async exportConciliation(): Promise<void> {
    try {
      await this.documentsApi.exportConciliation(this.buildExportRequest());
      this.actionMessage.set({ kind: 'success', text: 'Se genero el reporte de conciliacion.' });
    } catch (error) {
      this.handleActionError('No fue posible exportar la conciliacion.', error);
    }
  }

  async exportZip(): Promise<void> {
    try {
      await this.documentsApi.exportZip(this.buildExportRequest());
      this.actionMessage.set({ kind: 'success', text: 'Se genero el ZIP del resultado filtrado.' });
    } catch (error) {
      this.handleActionError('No fue posible generar el ZIP filtrado.', error);
    }
  }

//  async downloadSelectedDocuments(
//   type: 'Multi' | 'Pdf'
// ): Promise<void> {

//   const items = this.selectedMultifileItems();

//   if (items.length === 0) {

//     this.actionMessage.set({
//       kind: 'info',
//       text: 'Selecciona al menos un documento para la descarga múltiple.'
//     });

//     return;
//   }

//   const request: DocumentMultifileRequest = {
//     type,
//     documentType: this.selectedDocumentType(),
//     userId: this.currentUserEmail(),
//     items
//   };

//   const documentTypeAgr =
//     this.selectedMenuLabel()?.trim() ||
//     this.selectedDocumentType()?.trim() ||
//     'DOCUMENTOS';

//   const subDocument =
//     this.selectedGroupedDocumentType()?.trim();

//   const fileName = subDocument
//     ? `${documentTypeAgr}_${subDocument}_Masivo.zip`
//     : `${documentTypeAgr}_Masivo.zip`;

//   console.group('📦 DESCARGA MASIVA');

//   console.log('📤 Request', request);

//   console.log('🗂️ FileName', fileName);

//   try {

//     await this.documentsApi.downloadMultifile(
//       request,
//       fileName
//     );

//     console.log('✅ Descarga completada');

//     this.actionMessage.set({
//       kind: 'success',
//       text: 'Se descargó el ZIP de los documentos seleccionados.'
//     });

//   }
//   catch (error) {

//     console.error(
//       '❌ Error descarga masiva',
//       error
//     );

//     this.handleActionError(
//       'No fue posible descargar los documentos seleccionados.',
//       error
//     );
//   }
//   finally {

//     console.groupEnd();
//   }
// }
async downloadSelectedDocuments(
  type: 'Multi' | 'Pdf'
): Promise<void> {

  const selectedItems = this.selectedMultifileItems()
  .filter((x: any) => {
    const row = this.gridRows().find(r =>
      String(r.documentId) === String(x.id)
    );

    return row && this.hasDocumentLoaded(row);
  });

  if (selectedItems.length === 0) {

    this.actionMessage.set({
      kind: 'info',
      text: 'Selecciona al menos un documento.'
    });

    return;
  }

  const request: DocumentMultifileRequest = {

    type,

    userId: this.currentUserEmail(),

    documentType: this.selectedDocumentType(),

    items: selectedItems.map(x => ({
      id: Number(x.id),
      remision: String(x.remision)
    }))
  };

  const documentTypeAgr =
    this.selectedMenuLabel()?.trim() ||
    this.selectedDocumentType();

  const subDocument =
    this.selectedGroupedDocumentType()?.trim();

  const fileName = subDocument
    ? `${documentTypeAgr}_${subDocument}_Masivo.zip`
    : `${documentTypeAgr}_Masivo.zip`;

  console.group('📦 REQUEST DESCARGA MASIVA');

  console.log(request);

  console.log('🗂️ fileName', fileName);

  try {

    await this.documentsApi.downloadMultifile(
      request,
      fileName
    );

    this.selectedRows.set({});

    this.actionMessage.set({
      kind: 'success',
      text: 'Descarga completada.'
    });

  }
  catch (error) {

    console.error(error);

    this.handleActionError(
      'No fue posible descargar los documentos.',
      error
    );
  }
  finally {

    console.groupEnd();
  }
}
  async queueSelectedRegeneration(): Promise<void> {
    const items = this.selectedQueueItems();
    if (items.length === 0) {
      this.actionMessage.set({ kind: 'info', text: 'Selecciona documentos con identificador valido para enviarlos a la cola.' });
      return;
    }

    try {
      const response = await this.documentsApi.queueRegeneration(items);
      this.actionMessage.set({
        kind: response.error ? 'error' : 'success',
        text: response.message || (response.error ? 'La recreacion no pudo enviarse.' : 'La recreacion fue enviada a la cola.')
      });
    } catch (error) {
      this.handleActionError('No fue posible enviar la recreacion a la cola.', error);
    }
  }

  
  onTableView(row: any): void {
    debugger;
    const item = row._rowRef as DocumentGridItem;
    if (item) void this.openPdf(item);
  }

  onTableEdit(row: any): void {
    const item = row._rowRef as DocumentGridItem;
    if (item) void this.downloadFile(item);
  }

  async openPdf(item: DocumentGridItem): Promise<void> {
    try {
      await this.documentsApi.openDocumentPdf(this.buildFileRequest(item));
    } catch (error) {
      this.handleActionError('No fue posible abrir el PDF del documento.', error);
    }
  }

  async downloadFile(item: DocumentGridItem): Promise<void> {
    try {
      await this.documentsApi.downloadDocumentFile(this.buildFileRequest(item));
    } catch (error) {
      this.handleActionError('No fue posible descargar el archivo del documento.', error);
    }
  }

  selectDocumentType(documentType: string, keepGroupedState = false): void {
    const today = this.getToday();
    const monthStart = this.getFirstDayOfMonth();

    this.selectedDocumentType.set(documentType);
    this.draftDateFrom.set(monthStart);
    this.draftDateTo.set(today);
    this.submittedDateFrom.set(monthStart);
    this.submittedDateTo.set(today);
    this.draftFilters.set({});
    this.submittedFilters.set({});
    this.pageIndex.set(0);
    this.pageSize.set(25);
    this.sortColumn.set('');
    this.sortDirection.set('asc');
    this.selectedRows.set({});
    this.clientLookup.set({ prefix: '', filter: '' });
    this.actionMessage.set(null);
    this.gridResource.reload();

    if (!keepGroupedState) {
      this.groupedDocumentTypes.set([]);
      this.selectedGroupedDocumentType.set('');
      this.selectedMenuLabel.set('');
      this.hideFiltersByMenu.set(false);
      this.groupedHeaders.set([]);
    }
  }

async setDocumentTypeFromMenu(type: string): Promise<void> {
  const types = await this.documentsApi.getDocumentGroup(type);

  if (!types || types.length === 0) {
    this.selectedMenuLabel.set('');
    this.hideFiltersByMenu.set(false);
    this.groupedDocumentTypes.set([]);
    this.selectedGroupedDocumentType.set('');
    this.groupedHeaders.set([]);
    this.groupedFilterHeaders.set([]);
    return;
  }

  this.selectedMenuLabel.set(type);
  this.hideFiltersByMenu.set(true);
  this.groupedDocumentTypes.set(types);
  this.selectedGroupedDocumentType.set(types[0]);

  this.selectDocumentType(types[0], true);

  const headers = await this.documentsApi.getHeaders(types[0]);
  this.groupedHeaders.set(headers ?? []);

  const filterHeaders = await this.documentsApi.getHeaders(types[0], 'T');
  this.groupedFilterHeaders.set(filterHeaders ?? []);

  this.applyFilters();
}

  applyFilters(): void {
    debugger;
    console.log('filtros');

  const fromDate = new Date(this.draftDateFrom());
  const toDate = new Date(this.draftDateTo());

  const diffMonths =
    (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
    (toDate.getMonth() - fromDate.getMonth());

  if (diffMonths > 3) {

    this.actionMessage.set({
      kind: 'error',
      text: 'El rango entre DESDE y HASTA no puede superar 3 meses.'
    });

    return;
  }
    this.submittedDateFrom.set(this.draftDateFrom());
    this.submittedDateTo.set(this.draftDateTo());
    this.submittedFilters.set(this.cleanFilters(this.draftFilters()));
    this.pageIndex.set(0);
    this.selectedRows.set({});
    this.actionMessage.set(null);
    this.gridResource.reload();
  }

// applyFilters(): void {
//   this.submittedDateFrom.set(this.draftDateFrom());
//   this.submittedDateTo.set(this.draftDateTo());
//   this.submittedFilters.set(this.cleanFilters(this.draftFilters()));

//   // 👇 VALIDACIÓN
//   console.log('FILTROS 👉', this.submittedFilters());

//   this.pageIndex.set(0);
//   this.selectedRows.set({});
//   this.actionMessage.set(null);
//   this.gridResource.reload();
// }

  resetFilters(): void {
    this.draftDateFrom.set(this.getFirstDayOfMonth());
    this.draftDateTo.set(this.getToday());
    this.draftFilters.set({});
    this.clientLookup.set({ prefix: '', filter: '' });
    this.applyFilters();
  }

  updateFilter(field: DocumentField, value: string): void {
    const filterKey = this.getFilterKey(field);
    this.draftFilters.update((current) => {
      const next = { ...current };
      const normalizedValue = value?.trim() ?? '';

      if (!normalizedValue) {
        delete next[filterKey];
      } else {
        next[filterKey] = normalizedValue;
      }

      return next;
    });

    if (field.isAutoCompleteClient) {
      const autoCompleteFilter = this.fieldsResource.value().autoCompleteFilters[field.id] || field.searchField || field.id;
      this.clientLookup.set({
        prefix: value ?? '',
        filter: autoCompleteFilter
      });
    }
  }

  updateDate(type: 'from' | 'to', value: string): void {
    if (type === 'from') {
      this.draftDateFrom.set(value);
      return;
    }

    this.draftDateTo.set(value);
  }

  changePageSize(value: string): void {
    const nextSize = Number.parseInt(value, 10);
    this.pageSize.set(Number.isNaN(nextSize) ? 25 : nextSize);
    this.pageIndex.set(0);
    this.gridResource.reload();
  }

  goToPreviousPage(): void {
    if (this.pageIndex() === 0) {
      return;
    }

    this.pageIndex.update((value) => value - 1);
  }

  goToNextPage(): void {
    if (this.pageIndex() + 1 >= this.totalPages()) {
      return;
    }

    this.pageIndex.update((value) => value + 1);
  }

  toggleSort(field: DocumentField): void {
    if (this.sortColumn() === field.id) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(field.id);
      this.sortDirection.set('asc');
    }

    this.pageIndex.set(0);
    this.gridResource.reload();
  }

  toggleAllRows(checked: boolean): void {
    if (!checked) {
      this.selectedRows.set({});
      return;
    }

    const next: Record<string, boolean> = {};
    for (const item of this.gridRows()) {
      next[this.getRowKey(item)] = true;
    }

    this.selectedRows.set(next);
  }

  toggleRow(item: DocumentGridItem, checked: boolean): void {
    const rowKey = this.getRowKey(item);
    this.selectedRows.update((current) => {
      const next = { ...current };
      if (checked) {
        next[rowKey] = true;
      } else {
        delete next[rowKey];
      }

      return next;
    });
  }

  isRowSelected(item: DocumentGridItem): boolean {
    return !!this.selectedRows()[this.getRowKey(item)];
  }

  areAllVisibleRowsSelected(): boolean {
    const rows = this.gridRows();
    return rows.length > 0 && rows.every((item: DocumentGridItem) => this.isRowSelected(item));
  }

  getFilterValue(field: DocumentField): string {
    return this.draftFilters()[this.getFilterKey(field)] ?? '';
  }

  getColumnValue(item: DocumentGridItem, field: DocumentField): string {
    return item.dynamicItems[field.id] ?? '';
  }

  getAlignmentClass(field: DocumentField): string {
    const alignment = (field.alignText || '').toLowerCase();
    if (alignment.includes('right')) {
      return 'text-right';
    }

    if (alignment.includes('center')) {
      return 'text-center';
    }

    return 'text-left';
  }

  getStatusClasses(item: DocumentGridItem): string {
    if (item.errorMessage) {
      return 'bg-error/10 text-error border border-error/20';
    }

    if ((item.confirmed || '').toUpperCase() === 'S' || (item.pdfOk || '').toUpperCase() === 'S') {
      return 'bg-success/10 text-success border border-success/20';
    }

    return 'bg-warning/10 text-warning border border-warning/20';
  }

  getStatusLabel(item: DocumentGridItem): string {
    if (item.errorMessage) {
      return item.errorMessage;
    }

    if (item.confirmed) {
      return item.confirmed;
    }

    if (item.pdfOk) {
      return `PDF ${item.pdfOk}`;
    }

    return 'Pendiente';
  }

  private async loadProfile(): Promise<void> {
    const profile = await this.authService.getProfile();
    this.currentUserName.set(profile?.sdeSession?.name ?? profile?.displayName ?? 'Usuario');
    this.currentUserEmail.set(profile?.sdeSession?.email ?? profile?.mail ?? '');
  }

  private buildExportRequest() {
    return {
      documentType: this.selectedDocumentType(),
      dateFrom: this.formatDateForApi(this.submittedDateFrom()),
      dateTo: this.formatDateForApi(this.submittedDateTo()),
      filters: this.submittedFilters(),
      sqlWhere: '',
      userId: this.currentUserEmail()
    };
  }

private buildFileRequest(item: DocumentGridItem) {
  return {
    documentType:
      (item as any).docType ??
      item.documentType ??
      this.selectedDocumentType(),

    documentNumber: item.documentNumber ?? '',
    documentId: item.documentId ?? '',
    invoiceClass: item.invoiceClass ?? '',
    userId: this.currentUserEmail()
  };
}

private getFilterKey(field: DocumentField): string {
  return field.id;
}
  private getRowKey(item: DocumentGridItem): string {
    return `${item.documentId || item.documentNumber || item.documentPackageId}-${item.documentType}`;
  }

  private parseDocumentId(value: string): number {
    const parsedValue = Number.parseInt(value, 10);
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  }

  private cleanFilters(filters: Record<string, string>): Record<string, string> {
    return Object.entries(filters).reduce<Record<string, string>>((accumulator, [key, value]) => {
      const normalizedKey = key?.trim() ?? '';
      const normalizedValue = value?.trim() ?? '';
      if (normalizedKey && normalizedValue) {
        accumulator[normalizedKey] = normalizedValue;
      }

      return accumulator;
    }, {});
  }

  private getToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private getFirstDayOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
  }

  private handleActionError(defaultMessage: string, error: unknown): void {
    console.error(defaultMessage, error);
    this.actionMessage.set({ kind: 'error', text: defaultMessage });
  }

  private parseIsoToDate(iso: string): Date {
    if (!iso) return new Date();
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private dateToIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

private getCreateText(item: DocumentGridItem): string {
  const docType = ((item as any).docType ?? this.selectedDocumentType()).toString();
  const hasPdf = this.hasValue((item as any).doPDFOk);

  if (['TCV', 'PCV', 'ROV'].includes(docType)) {
    return '';
  }

  if (hasPdf) {
    return ['FC', 'CI', 'NV', 'FS', 'NF', 'NCI', 'RPR', 'CRP'].includes(docType)
      ? 'Creado'
      : 'Recrear';
  }

  return 'Generar';
}

private canPrint(docType: string): boolean {
  return !['TCV', 'PCV'].includes(docType);
}

onSendDocument(row: any): void {
  console.log('CLICK ENVIAR 👉', row);

  const item = row._rowRef;

  if (!this.hasValue(item.doPDFOk)) {
    this.actionMessage.set({
      kind: 'info',
      text: 'El documento aún no tiene PDF generado.'
    });
    return;
  }

  this.openSendDialog(item);
}

// async onSendDocument(row: any): Promise<void> {
//   const item = row._rowRef as DocumentGridItem;

//   if (!this.hasValue((item as any).doPDFOk)) {
//     this.actionMessage.set({
//       kind: 'info',
//       text: 'El documento aún no tiene PDF generado.'
//     });
//     return;
//   }

//   try {
//     // await this.documentsApi.openSendMailModal({
//     //   docType: (item as any).docType ?? this.selectedDocumentType(),
//     //   doId: item.documentId,
//     //   doNumber: item.documentNumber
//     // });

//     this.actionMessage.set({
//       kind: 'success',
//       text: 'Se abrió la opción para enviar el documento.'
//     });
//   } catch (error) {
//     this.handleActionError('No fue posible abrir el envío del documento.', error);
//   }
// }

// async onCreatePdf(row: any): Promise<void> {
//   const item = row._rowRef as DocumentGridItem;

//   try {
//     // await this.documentsApi.makePdf({
//     //   documentType: (item as any).docType ?? this.selectedDocumentType(),
//     //   documentId: this.parseDocumentId(item.documentId),
//     //   documentNumber: item.documentNumber
//     // });

//     this.actionMessage.set({
//       kind: 'success',
//       text: 'El documento se envió a generación/recreación.'
//     });

//     this.gridResource.reload();
//   } catch (error) {
//     this.handleActionError('No fue posible generar/recrear el PDF.', error);
//   }
// }

async onCreatePdf(row: any): Promise<void> {
  debugger;

  console.group('🚀 ON CREATE PDF');

  console.log('📥 Row recibido', row);

  const request = {
    documentType: this.selectedDocumentType(),
    documentId: String(row.id),
    documentNumber: String(row.nro_pedido),
    userId: this.currentUserEmail?.() ?? ''
  };

  console.log('📤 Request generateLegacyPdf', request);

  try {
    console.time('⏱️ generateLegacyPdf');

    const response = await this.documentsApi.generateLegacyPdf(request);

    console.timeEnd('⏱️ generateLegacyPdf');

    console.log('✅ Response generateLegacyPdf', response);

    this.actionMessage.set({
      kind: response.error ? 'error' : 'success',
      text: response.message || 'PDF generado/recreado correctamente.'
    });

    this.gridResource.reload();

  } catch (error) {
    console.error('❌ Error onCreatePdf', error);

    this.handleActionError(
      'No fue posible generar/recrear el PDF.',
      error
    );
  } finally {
    console.groupEnd();
  }
}

async onPrintDocument(row: any): Promise<void> {
  const item = row._rowRef as DocumentGridItem;

  try {
    // await this.documentsApi.printDocument({
    //   documentType: (item as any).docType ?? this.selectedDocumentType(),
    //   documentId: this.parseDocumentId(item.documentId),
    //   documentNumber: item.documentNumber
    // });

    this.actionMessage.set({
      kind: 'success',
      text: 'El documento se envió a impresión.'
    });
  } catch (error) {
    this.handleActionError('No fue posible imprimir el documento.', error);
  }
}
// getStatusActions(item: any) {
//   const actions: any[] = [];
//   const docType = item.docType ?? this.selectedDocumentType();

//   // PDF / XLS principal
//   if (item.doPDFOk) {
//     actions.push({
//       type: 'pdf',
//       icon: docType === 'BL' || docType === 'TBL' || docType === 'ROV'
//         ? 'ph ph-file-xls'
//         : 'ph ph-file-pdf',
//       title: item.doPDFOk,
//       action: 'view'
//     });
//   }

//   // XML
// if (item.doPDFOk && this.canShowXml(docType)) {
//   actions.push({
//     type: 'xml',
//     icon: 'ph ph-file-code',
//     title: `XML ${this.getXmlDocumentType(docType)}`,
//     action: 'xml'
//   });
// }

//   // Enviado
//   if (item.doSentOk) {
//     actions.push({
//       type: 'sent',
//       icon: 'ph ph-paper-plane-tilt',
//       title: `Enviado: ${item.doSentOk}`,
//       action: null
//     });
//   }

//   // Impreso
//   if (item.doPrintedOk) {
//     actions.push({
//       type: 'printed',
//       icon: 'ph ph-printer',
//       title: `Impreso: ${item.doPrintedOk}`,
//       action: null
//     });
//   }

//   // Paquete
//   if (item.doPackagedOk) {
//     actions.push({
//       type: 'package',
//       icon: 'ph ph-package',
//       title: `Empaquetado: ${item.doPackagedOk}`,
//       action: null
//     });
//   }

//   return actions;
// }

getStatusActions(item: any) {
  const actions: any[] = [];

  const docType = item.docType ?? item.documentType ?? this.selectedDocumentType();

  const pdfOk = item.doPDFOk ?? item.pdfOk;
  const pdfFile = item.doPDFFile ?? item.pdfFile;
  const sentOk = item.doSentOk ?? item.sentOk;
  const printedOk = item.doPrintedOk ?? item.printedOk;
  const packagedOk = item.doPackagedOk ?? item.packagedOk;

  const fileType = this.getFileType(pdfFile);
if (pdfOk) {
  actions.push({
    type: fileType,
    icon:
      fileType === 'excel' ? 'ph ph-file-xls' :
      fileType === 'xml' ? 'ph ph-file-code' :
      fileType === 'zip' ? 'ph ph-file-zip' :
      fileType === 'txt' ? 'ph ph-file-text' :
      'ph ph-file-pdf',

    title: pdfFile ?? pdfOk,

    action:
      fileType === 'xml' ? 'xml' :
      fileType === 'excel' ? 'excel' :
      fileType === 'txt' ? 'txt' :
      'view'
  });
}

  if (this.canShowXml(item)) {
    actions.push({
      type: 'xml',
      icon: 'ph ph-file-code',
      title: `XML ${this.getXmlDocumentType(docType)}`,
      action: 'xml'
    });
  }

  if (sentOk) {
    actions.push({
      type: 'sent',
      icon: 'ph ph-paper-plane-tilt',
      title: `Enviado: ${sentOk}`,
      action: null
    });
  }

  if (printedOk) {
    actions.push({
      type: 'printed',
      icon: 'ph ph-printer',
      title: `Impreso: ${printedOk}`,
      action: null
    });
  }

  if (packagedOk) {
    actions.push({
      type: 'package',
      icon: 'ph ph-package',
      title: `Empaquetado: ${packagedOk}`,
      action: null
    });
  }

  return actions;
}

private readonly XML_DOCUMENT_TYPE_MAP: Record<string, string> = {
  NCP: 'XCN',
  CP: 'XCP',
  NS: 'XNS',
  SU: 'XSU',

  FC: 'XFC',
  CI: 'XCI',
  NV: 'XNV',
  FS: 'XFS',
  NF: 'XNF',
  NCI: 'XNCI',
  FT: 'XFT',
  FTE: 'XFTE',
  TN: 'XTN',
  TCI: 'XTCI',
  TNC: 'XTNC',
  CRP: 'XCRP',
  CCP: 'XCCP'
};

// private getXmlDocumentType(documentType: string): string {
//   if (documentType.startsWith('X')) return documentType;
//   return this.XML_DOCUMENT_TYPE_MAP[documentType] ?? '';
// }

getFileType(fileName: string | null | undefined): string {
  const value = (fileName ?? '').toLowerCase().trim();

  if (value.endsWith('.txt')) return 'txt';
  if (value.endsWith('.xml')) return 'xml';
  if (value.endsWith('.zip')) return 'zip';
  if (value.endsWith('.xls')) return 'excel';
  if (value.endsWith('.xlsx')) return 'excel';
  if (value.endsWith('.pdf')) return 'pdf';

  return 'pdf';
}

// private canShowXml(documentType: string): boolean {
//   return !!this.getXmlDocumentType(documentType);
// }

// async onOpenXml(row: any): Promise<void> {
//   const item = row._rowRef as DocumentGridItem;

//   try {
//     const request = this.buildXmlFileRequest(item);

//     await this.documentsApi.openDocumentFile(request, {
//       fileKind: 'xml',
//       fileName: `${request.documentType}${request.documentNumber}.xml`
//     });

//   } catch (error) {
//     this.handleActionError(
//       'No fue posible abrir el XML del documento.',
//       error
//     );
//   }
// }
async onOpenXml(row: any): Promise<void> {
  const item = row._rowRef as DocumentGridItem;

  try {
    const request = this.buildXmlFileRequest(item);

    await this.documentsApi.openDocumentFile(request, {
      fileKind: 'xml',
      forceDocumentType: request.documentType,
      fileName: `${request.documentType}${request.documentNumber}.xml`
    });

  } catch (error) {
    this.handleActionError(
      'No fue posible abrir el XML del documento.',
      error
    );
  }
}
async onOpenExcel(row: any): Promise<void> {
  const item = row._rowRef as DocumentGridItem;

  try {
    await this.documentsApi.openDocumentFile(
      this.buildFileRequest(item),
      {
        fileKind: 'excel',
        fileName:
          (item as any).doPDFFile ??
          (item as any).pdfFile ??
          `${item.documentNumber}.xlsx`
      }
    );

  } catch (error) {
    this.handleActionError(
      'No fue posible abrir el archivo Excel.',
      error
    );
  }
}
async onOpenTxt(row: any): Promise<void> {
  const item = row._rowRef as DocumentGridItem;

  try {

    await this.documentsApi.openDocumentFile(
      this.buildFileRequest(item),
      {
        fileKind: 'txt',
        fileName:
          (item as any).doPDFFile ??
          (item as any).pdfFile ??
          `${item.documentNumber}.txt`
      }
    );

  } catch (error) {

    this.handleActionError(
      'No fue posible abrir el archivo TXT.',
      error
    );

  }
}
async onOpenCsv(row: any): Promise<void> {
  const item = row._rowRef as DocumentGridItem;

  try {

    await this.documentsApi.openDocumentFile(
      this.buildFileRequest(item),
      {
        fileKind: 'csv',
        fileName:
          (item as any).doPDFFile ??
          (item as any).pdfFile ??
          `${item.documentNumber}.csv`
      }
    );

  } catch (error) {

    this.handleActionError(
      'No fue posible abrir el archivo CSV.',
      error
    );

  }
}
async onOpenZip(row: any): Promise<void> {
  const item = row._rowRef as DocumentGridItem;

  try {

    await this.documentsApi.openDocumentFile(
      this.buildFileRequest(item),
      {
        fileKind: 'zip',
        fileName:
          (item as any).doPDFFile ??
          (item as any).pdfFile ??
          `${item.documentNumber}.zip`
      }
    );

  } catch (error) {

    this.handleActionError(
      'No fue posible abrir el archivo ZIP.',
      error
    );

  }
}
private buildXmlFileRequest(item: DocumentGridItem) {
  const originalType = (
    (item as any).docType ??
    item.documentType ??
    this.selectedDocumentType() ??
    ''
  ).toString();

  const xmlType = this.getXmlDocumentType(originalType);

  if (!xmlType) {
    throw new Error(`El tipo ${originalType} no soporta XML.`);
  }

  return {
    documentType: xmlType,
    documentNumber: item.documentNumber ?? '',
    documentId: item.documentId ?? '',
    invoiceClass: item.invoiceClass ?? '',
    userId: this.currentUserEmail()
  };
}
async openSendDialog(item: DocumentGridItem): Promise<void> {

  console.group('📧 OPEN SEND DIALOG');

  console.log('📄 Item', item);

  try {

    const response = await this.documentsApi.getSendMailConfig({
      docType: (item as any).docType ?? item.documentType,
      doId: String(item.documentId),
      doNumber: item.documentNumber
    });

    console.log('✅ SendMailConfigResponse', response);

    this.sendMailForm.set(response);

    this.showSendModal.set(true);

  }
  catch (error) {

    console.error('❌ Error openSendDialog', error);

    this.handleActionError(
      'No fue posible cargar el popup de envío.',
      error
    );
  }
  finally {

    console.groupEnd();
  }
}

closeSendDialog(): void {
  this.showSendModal.set(false);
}

async acceptSendDialog(): Promise<void> {

  console.group('📧 ACCEPT SEND DIALOG');

  const model = this.sendMailForm();

  console.log('📄 Model', model);

  if (!model) {

    console.warn('⚠️ No existe modelo para enviar.');

    console.groupEnd();

    return;
  }

  try {

    console.time('⏱️ acceptSendDialog');

    console.log('📤 Enviando documento...');
    console.log('📄 DocType', model.docType);
    console.log('🆔 DoId', model.doId);
    console.log('🔢 DoNumber', model.doNumber);
    console.log('📨 TipoEnvio', model.tipodeEnvio);
    console.log('👤 Para', model.para);

    const response =
      await this.documentsApi.sendMail(model);

    console.log('✅ Response sendMail', response);

    this.actionMessage.set({
      kind: response.error ? 'error' : 'success',
      text: response.detail || response.message
    });

    if (!response.error) {

      console.log('🔄 Cerrando modal...');
      console.log('🔄 Recargando grid...');

      this.showSendModal.set(false);

      this.gridResource.reload();
    }

    console.timeEnd('⏱️ acceptSendDialog');
  }
  catch (error) {

    console.error('❌ Error acceptSendDialog', error);

    this.handleActionError(
      'No fue posible enviar el documento.',
      error
    );
  }
  finally {

    console.groupEnd();
  }
}
readonly selectedDocumentsForMassive = computed(() =>
  this.gridRows()
    .filter((item: any) => this.isRowSelected(item))
    .map((item: any) => {
      const docType = item.docType ?? item.documentType ?? this.selectedDocumentType();
      const doId = item.doId ?? item.documentId;
      const doNumber = item.doNumber ?? item.documentNumber;

      return {
        docType,
        doId,
        doNumber
      };
    })
    .filter(x => !!x.doId && !!x.doNumber)
);
readonly selectedDocumentsWithStatus = computed(() =>
  this.gridRows()
    .filter((item: any) => this.isRowSelected(item))
    .filter((item: any) => this.hasDocumentLoaded(item)) // 👈 SOLO con estatus
    .map((item: any) => {
      const docType = item.docType ?? item.documentType ?? this.selectedDocumentType();
      const doId = item.doId ?? item.documentId;
      const doNumber = item.doNumber ?? item.documentNumber;

      return {
        docType,
        doId,
        doNumber
      };
    })
    .filter(x => !!x.doId && !!x.doNumber)
);

// async downloadMassiveSelected(): Promise<void> {
//   const documents = this.selectedDocumentsForMassive();

//   if (documents.length === 0) {
//     this.actionMessage.set({
//       kind: 'info',
//       text: 'Selecciona al menos un documento para descarga masiva.'
//     });
//     return;
//   }

//   try {
//     await this.documentsApi.downloadMassiveZip({
//       documentType: this.selectedDocumentType(),
//       documents,
//       userId: this.currentUserEmail()
//     });

//     this.actionMessage.set({
//       kind: 'success',
//       text: 'Se generó la descarga masiva.'
//     });
//   } catch (error) {
//     this.handleActionError('No fue posible generar la descarga masiva.', error);
//   }
// }

// async sendMassiveSelected(): Promise<void> {
//   const documents = this.selectedDocumentsForMassive();

//   if (documents.length === 0) {
//     this.actionMessage.set({
//       kind: 'info',
//       text: 'Selecciona al menos un documento para envío masivo.'
//     });
//     return;
//   }

//   console.log('ENVÍO MASIVO 👉', documents);

//   // Luego aquí llamas API:
//   // await this.documentsApi.sendMassive({ documents, userId: this.currentUserEmail() });

//   this.actionMessage.set({
//     kind: 'info',
//     text: 'Envío masivo preparado.'
//   });
// }

async sendMassiveSelected(): Promise<void> {
const documents = this.selectedDocumentsWithStatus();
  if (documents.length === 0) {
    this.actionMessage.set({
      kind: 'info',
      text: 'Selecciona al menos un documento para envío masivo.'
    });
    return;
  }

  const request: DocumentQueueBulkRequest = {
    items: documents.map(x => ({
      dqNumber: String(x.doNumber),
      dqDocId: Number(x.doId),
      dqDocTypeId: String(x.docType),
      dqAction: 'SEND'
    }))
  };

  console.group('📨 ENVÍO MASIVO');
  console.log('📤 Request', request);
  console.table(request.items);

  try {
    const response = await this.documentsApi.addDocumentsQueueBulk(request);

    this.actionMessage.set({
      kind: response.error ? 'error' : 'success',
      text: response.message || (
        response.error
          ? 'No fue posible enviar los documentos.'
          : 'Documentos enviados a cola de envío masivo.'
      )
    });

    if (!response.error) {
      this.selectedRows.set({});
      this.gridResource.reload();
    }

  } catch (error) {
    console.error('❌ Error envío masivo', error);

    this.handleActionError(
      'No fue posible ejecutar el envío masivo.',
      error
    );
  } finally {
    console.groupEnd();
  }
}

// async downloadMassiveSelected(): Promise<void> {
//   debugger;
//   const documents = this.selectedDocumentsForMassive();
// // const documentTypeC = this.selectedDocumentType();   // ejemplo: SOC
//   if (documents.length === 0) {
//     this.actionMessage.set({
//       kind: 'info',
//       text: 'Selecciona al menos un documento.'
//     });
//     return;
//   }
// const documentTypeAgr = this.selectedMenuLabel() || this.selectedDocumentType();
// const subDocument = this.selectedGroupedDocumentType();
// const fileName = `${documentTypeAgr}_${subDocument}_Masivo.zip`;

//   const request = {
//     documentTypeAgrup: documentTypeAgr,
//     documentType: subDocument,
//     userId: this.currentUserEmail(),
//     documents,
//     fileName
//   };




//   // 🔥 PRINT BONITO
//   console.log('📦 REQUEST DESCARGA MASIVA 👉');
//   console.log(JSON.stringify(request, null, 2));

//   try {
//     await this.documentsApi.downloadMassiveZip(request);

//     this.actionMessage.set({
//       kind: 'success',
//       text: 'Se generó la descarga masiva.'
//     });
//   } catch (error) {
//     this.handleActionError('Error en descarga masiva', error);
//   }
// }

// async generateLegacyPdfSelected(): Promise<void> {

//   console.group('🚀 GENERATE LEGACY PDF MASSIVE');

//   const items = this.selectedQueueItems();

//   console.log('📦 selectedQueueItems()', items);

//   if (items.length === 0) {

//     console.warn('⚠️ No hay documentos seleccionados.');

//     this.actionMessage.set({
//       kind: 'info',
//       text: 'Selecciona al menos un documento.'
//     });

//     console.groupEnd();

//     return;
//   }

//  const request = {

//     documentType: this.selectedDocumentType(),

//     documentIds: items.map(x => String(x.id)),

//     documentNumbers: items.map(x => String(x.remision)),

//     userId: this.currentUserEmail()
//   };

//   console.log('📤 Request generateLegacyPdf', request);

//   try {

//     console.time('⏱️ generateLegacyPdf');

//     const response =
//       await this.documentsApi.generateLegacyPdf(request);

//     console.timeEnd('⏱️ generateLegacyPdf');

//     console.log('✅ Response generateLegacyPdf', response);

//     this.actionMessage.set({
//       kind: response.error ? 'error' : 'success',
//       text:
//         response.message ||
//         'PDF generado/recreado correctamente.'
//     });

//     console.log('🔄 Reloading gridResource...');

//     this.gridResource.reload();

//     console.log('✅ gridResource reloaded');

//   }
//   catch (error) {

//     console.error(
//       '❌ Error generateLegacyPdfSelected',
//       error
//     );

//     this.handleActionError(
//       'No fue posible generar/recrear los PDF.',
//       error
//     );
//   }
//   finally {

//     console.groupEnd();
//   }
// }

async generateLegacyPdfSelected(): Promise<void> {

  console.group('🚀 GENERAR/RECREAR MASIVO');

  const documents = this.selectedDocumentsForMassive();

  if (documents.length === 0) {

    this.actionMessage.set({
      kind: 'info',
      text: 'Selecciona al menos un documento.'
    });

    console.groupEnd();

    return;
  }

  const request: DocumentQueueBulkRequest = {
    items: documents.map(x => ({
      dqNumber: String(x.doNumber),
      dqDocId: Number(x.doId),
      dqDocTypeId: String(x.docType),
      dqAction: 'PDF'
    }))
  };

  console.log('📤 Request', request);

  try {

    console.time('⏱️ generate/recreate');

    const response =
      await this.documentsApi.addDocumentsQueueBulk(request);

    console.timeEnd('⏱️ generate/recreate');

    console.log('✅ Response', response);

    this.actionMessage.set({
      kind: response.error ? 'error' : 'success',
      text:
        response.message ||
        (
          response.error
            ? 'No fue posible generar/recrear.'
            : 'Documentos enviados a cola de generación/recreación.'
        )
    });

    if (!response.error) {
      this.selectedRows.set({});
      this.gridResource.reload();
    }

  }
  catch (error) {

    console.error(
      '❌ Error generateLegacyPdfSelected',
      error
    );

    this.handleActionError(
      'No fue posible generar/recrear los PDF.',
      error
    );
  }
  finally {

    console.groupEnd();
  }
}

private readonly xmlDocTypesFE = [
  'FC', 'CI', 'NV', 'FS', 'NF', 'NCI',
  'FT', 'FTE', 'TN', 'TCI', 'TNC',
  'CRP', 'CCP'
];

getXmlDocumentType(docType: string): string {
  const type = (docType ?? '').trim().toUpperCase();

  if (this.xmlDocTypesFE.includes(type)) return 'FE';
  if (type === 'RF') return 'RX';
  if (type === 'CP') return 'XC';
  if (type === 'TCP') return 'XCN';
  if (type === 'NCP') return 'XCN';

  return '';
}

canShowXml(row: any): boolean {
  const docType = row.docType ?? row.documentType;
  const pdfOk = row.doPDFOk ?? row.pdfOk;

  return this.hasValue(pdfOk) && this.getXmlDocumentType(docType) !== '';
}

private hasDocumentLoaded(item: any): boolean {

  const pdfOk = item.doPDFOk ?? item.pdfOk;

  const pdfFile = item.doPDFFile ?? item.pdfFile;

  return this.hasValue(pdfOk) || this.hasValue(pdfFile);
}

private formatDateForApi(date: string): string {

  if (!date) return '';

  return date.replaceAll('-', '');

}

}
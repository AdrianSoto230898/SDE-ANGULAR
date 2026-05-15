export interface DocumentTypeOption {
  code: string;
  name: string;
}

export interface DocumentField {
  id: string;
  documentTypeId: string;
  friendlyName: string;
  width: number;
  align: number;
  alignText: string;
  order: number;
  searchField: string;
  isAutoCompleteClient: boolean;
}

export interface DocumentFieldsResponse {
  documentType: string;
  fields: DocumentField[];
  values: Record<string, string>;
  autoCompleteFilters: Record<string, string>;
}

export interface DocumentGridItem {
  documentType: string;
  errorMessage: string;
  documentId: string;
  pdfOk: string;
  invoiceClass: string;
  documentNumber: string;
  documentPackageId: string;
  confirmed: string;
  pdfFile: string;
  sentOk: string;
  printedOk: string;
  packagedOk: string;
  salesOrganization: string;
  icon: string;
  orderNumber: string;
  dynamicItems: Record<string, string>;
}

export interface DocumentGridPageRequest {
  documentType: string;
  dateFrom: string;
  dateTo: string;
  sqlWhere?: string;
  userId?: string;
  filters: Record<string, string>;
  start: number;
  length: number;
  sortColumn: string;
  sortDirection: string;
}

export interface DocumentGridPageResponse {
  recordsFiltered: number;
  data: DocumentGridItem[];
}

export interface DocumentExportRequest {
  documentType: string;
  dateFrom: string;
  dateTo: string;
  sqlWhere?: string;
  userId?: string;
  filters: Record<string, string>;
}

export interface DocumentFileRequest {
  documentType: string;
  documentNumber: string;
  userId?: string;
  documentId?: string;
  invoiceClass?: string;
}

export interface DocumentBulkItemRequest {
  id: number;
  remision: string;
}

export interface DocumentMultifileRequest {
  type: 'Multi' | 'Pdf';
  userId?: string;
  documentType: string;
  items: DocumentBulkItemRequest[];
}

export interface DocumentQueueResponse {
  error: boolean;
  message: string;
}

export interface DocumentClientInfoResponse {
  id: string;
  sap: string;
  name: string;
  text: string;
}

export interface SendMailConfigResponse {
  tipodeEnvio: string;
  tipodeEnvioList: { value: string; text: string }[];

  para: string;
  subject: string;
  body: string;
  datoAdjunto: string;

  docType: string;
  doId: string;
  doNumber: string;
}
export interface LegacyPdfRequest {
  documentType: string;
  documentNumber: string;
  documentId: string;
  userId: string;
} 

export interface DocumentQueueRequest {
  dqNumber: string;
  dqDocId: number;
  dqDocTypeId: string;
  dqAction: string;
}

export interface DocumentQueueBulkRequest {
  items: DocumentQueueRequest[];
}
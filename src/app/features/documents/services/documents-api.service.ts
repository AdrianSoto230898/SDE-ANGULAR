import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DocumentQueueBulkRequest, LegacyPdfRequest } from '../models/documents.models';
import { SendMailConfigResponse, SendMailResponse } from '../../../shared/models/popSend/popSend.model';
import { environment } from '../../../../environments/environment';
import JSZip from 'jszip';
import FileSaver, { saveAs } from 'file-saver';
import {
  DocumentClientInfoResponse,
  DocumentExportRequest,
  DocumentField,
  DocumentFieldsResponse,
  DocumentFileRequest,
  DocumentGridPageRequest,
  DocumentGridPageResponse,
  DocumentMultifileRequest,
  DocumentQueueResponse,
  DocumentTypeOption,
} from '../models/documents.models';

@Injectable({
  providedIn: 'root'
})
export class DocumentsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = (environment.URL_API_SDE ?? '').trim().replace(/\/+$/, '');

  getDocumentTypes(): Promise<DocumentTypeOption[]> {
    /* ==================== 🔸 MODO MOCK 🔸 ==================== */
    if (!environment.production) {
      return Promise.resolve([
        { code: 'FAC', name: 'Factura' },
        { code: 'REM', name: 'Remisión' },
        { code: 'NC', name: 'Nota de Crédito' },
        { code: 'ND', name: 'Nota de Débito' },
        { code: 'PED', name: 'Pedido' }
      ]);
    }

    /* ==================== 🔸 API REAL 🔸 ==================== */
    return firstValueFrom(this.http.get<DocumentTypeOption[]>(this.buildUrl('api/documentos/tipos')));
  }

  getDocumentFields(documentType: string): Promise<DocumentFieldsResponse> {
    /* ==================== 🔸 MODO MOCK 🔸 ==================== */
    if (!environment.production) {
      return Promise.resolve({
        documentType,
        fields: [
          { id: 'nro_factura', friendlyName: 'Nro. Factura', type: 'text', searchField: 'nro_factura' },
          { id: 'cliente', friendlyName: 'Cliente', type: 'text', searchField: 'cliente' },
          { id: 'desc_cliente', friendlyName: 'Descripcion Cliente', type: 'text', searchField: 'desc_cliente' },
          { id: 'sociedad', friendlyName: 'Sociedad', type: 'text', searchField: 'sociedad' },
          { id: 'clase', friendlyName: 'Clase', type: 'text', searchField: 'clase' },
          { id: 'pedido', friendlyName: 'Pedido', type: 'text', searchField: 'pedido' },
          { id: 'mercado', friendlyName: 'Mercado', type: 'text', searchField: 'mercado' },
          { id: 'cancelado', friendlyName: 'Cancelado', type: 'boolean', searchField: 'cancelado' },
          { id: 'remision', friendlyName: 'Remisión', type: 'text', searchField: 'remision' }
        ],
        values: {},
        autoCompleteFilters: {}
      } as unknown as DocumentFieldsResponse);
    }

    /* ==================== 🔸 API REAL 🔸 ==================== */
    return firstValueFrom(
      this.http.post<DocumentFieldsResponse>(this.buildUrl('api/documentos/campos'), {
        documentType,
        values: {}
      })
    );
  }

  getGridPage(request: DocumentGridPageRequest): Promise<DocumentGridPageResponse> {
    debugger;
    /* ==================== 🔸 MODO MOCK 🔸 ==================== */
  if (!environment.production) {
    return Promise.resolve(this.getMockGridPage(request));
  }

    /* ==================== 🔸 API REAL 🔸 ==================== */
    return firstValueFrom(
      this.http.post<DocumentGridPageResponse>(this.buildUrl('api/documentos/grid'), {
        ...request,
        sqlWhere: request.sqlWhere ?? '',
        userId: request.userId ?? ''
      })
    );
  }

  private getMockGridPage(
  request: DocumentGridPageRequest
): DocumentGridPageResponse {

  const MOCK_DATA = [
     {
      documentType: 'NCP',
      errorMessage: '',
      documentId: '337574',
      pdfOk: '',
      invoiceClass: '',
      documentNumber: '0000015493',
      documentPackageId: '0000015493',
      confirmed: 'Si',
      pdfFile: '',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'TM01',
      icon: 'ifNA',
      orderNumber: '0000015493',
      dynamicItems: {
        Bloqueos: '',
        Confirmado: 'Si',
        desc_cliente: 'PUERTO BUITRAGO',
        fecha_doc: '2021-03-01 00:00:00.000',
        NCPHMercadoCod: 'E',
        NCPHSociedad: 'TM01',
        nro_pedido: '0000015493',
        num_cte_sol: 'E010517913',
        razon_cambio: '',
        SocResumida: ''
      }
    },
    {
      documentType: 'NCP',
      errorMessage: '',
      documentId: '523635',
      pdfOk: '',
      invoiceClass: '',
      documentNumber: '0000015321',
      documentPackageId: '0000015321',
      confirmed: 'Si',
      pdfFile: '',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'TM01',
      icon: 'ifNA',
      orderNumber: '0000015321',
      dynamicItems: {
        Bloqueos: '',
        Confirmado: 'Si',
        desc_cliente: 'MIDWEST MFG - VALLEY',
        fecha_doc: '2021-03-05 00:00:00.000',
        NCPHMercadoCod: 'E',
        NCPHSociedad: 'TM01',
        nro_pedido: '0000015321',
        num_cte_sol: 'E000781019',
        razon_cambio: '',
        SocResumida: ''
      }
    },
    {
      documentType: 'NCP',
      errorMessage: '',
      documentId: '336640',
      pdfOk: '',
      invoiceClass: '',
      documentNumber: '0300556620',
      documentPackageId: '0300556620',
      confirmed: 'Si',
      pdfFile: '',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'TM01',
      icon: 'ifNA',
      orderNumber: '0300556620',
      dynamicItems: {
        Bloqueos: '',
        Confirmado: 'Si',
        desc_cliente: 'TUBACERO',
        fecha_doc: '2021-03-05 00:00:00.000',
        NCPHMercadoCod: 'N',
        NCPHSociedad: 'TM01',
        nro_pedido: '0300556620',
        num_cte_sol: 'H000146400',
        razon_cambio: 'Reserva posición 1;Reserva posición 2;Reserva posición 3;',
        SocResumida: ''
      }
    },
    {
      documentType: 'NCP',
      errorMessage: '',
      documentId: '553027',
      pdfOk: '',
      invoiceClass: '',
      documentNumber: '0300566072',
      documentPackageId: '0300566072',
      confirmed: 'Si',
      pdfFile: '',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'TM01',
      icon: 'ifNA',
      orderNumber: '0300566072',
      dynamicItems: {
        Bloqueos: '',
        Confirmado: 'Si',
        desc_cliente: 'ASBESTOS Y ACEROS RECUBIERTOS',
        fecha_doc: '2021-03-17 00:00:00.000',
        NCPHMercadoCod: 'N',
        NCPHSociedad: 'TM01',
        nro_pedido: '0300566072',
        num_cte_sol: 'H010005203',
        razon_cambio: 'Importe;Precio de crédito;Precio de crédito;Precio neto;Fecha de precio;',
        SocResumida: ''
      }
    },
    {
      documentType: 'NCP',
      errorMessage: '',
      documentId: '325425',
      pdfOk: '',
      invoiceClass: '',
      documentNumber: '0300567948',
      documentPackageId: '0300567948',
      confirmed: 'Si',
      pdfFile: '',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'TM01',
      icon: 'ifNA',
      orderNumber: '0300567948',
      dynamicItems: {
        Bloqueos: '',
        Confirmado: 'Si',
        desc_cliente: 'NATIONAL MATERIAL OF MEXICO S DE RL',
        fecha_doc: '2021-03-19 00:00:00.000',
        NCPHMercadoCod: 'N',
        NCPHSociedad: 'TM01',
        nro_pedido: '0300567948',
        num_cte_sol: 'H010505607',
        razon_cambio: 'Importe condición;Precio de crédito;Precio de crédito;Precio neto;Fecha de precio;',
        SocResumida: ''
      }
    },
    {
      documentType: 'NCP',
      errorMessage: '',
      documentId: '513924',
      pdfOk: '',
      invoiceClass: '',
      documentNumber: '0300568643',
      documentPackageId: '0300568643',
      confirmed: 'Si',
      pdfFile: '',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'TM01',
      icon: 'ifNA',
      orderNumber: '0300568643',
      dynamicItems: {
        Bloqueos: '',
        Confirmado: 'Si',
        desc_cliente: 'METAL BUILDING SYSTEMS',
        fecha_doc: '2021-03-21 00:00:00.000',
        NCPHMercadoCod: 'N',
        NCPHSociedad: 'TM01',
        nro_pedido: '0300568643',
        num_cte_sol: 'H010518282',
        razon_cambio: 'Bl. Confirmación Comercial;',
        SocResumida: ''
      }
    },
    {
      documentType: 'NCP',
      errorMessage: '',
      documentId: '332634',
      pdfOk: '',
      invoiceClass: '',
      documentNumber: '0000015683',
      documentPackageId: '0000015683',
      confirmed: 'Si',
      pdfFile: '',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'TM01',
      icon: 'ifNA',
      orderNumber: '0000015683',
      dynamicItems: {
        Bloqueos: '',
        Confirmado: 'Si',
        desc_cliente: 'ADS LOGISTICS',
        fecha_doc: '2021-03-31 00:00:00.000',
        NCPHMercadoCod: 'E',
        NCPHSociedad: 'TM01',
        nro_pedido: '0000015683',
        num_cte_sol: 'E026003629',
        razon_cambio: 'WF Cierre de pedido;',
        SocResumida: ''
      }
    },
    {
      documentType: 'NCP',
      errorMessage: '',
      documentId: '322873',
      pdfOk: '2022-02-25 18:24:00.000',
      invoiceClass: '',
      documentNumber: '0300578854',
      documentPackageId: '0300578854',
      confirmed: 'Si',
      pdfFile: 'NCP0300578854.pdf',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'TM01',
      icon: 'ifNA',
      orderNumber: '0300578854',
      dynamicItems: {
        Bloqueos: '',
        Confirmado: 'Si',
        desc_cliente: 'ALMACEN VIEZCA ALTO DE NORIA',
        fecha_doc: '2021-03-31 00:00:00.000',
        NCPHMercadoCod: 'N',
        NCPHSociedad: 'TM01',
        nro_pedido: '0300578854',
        num_cte_sol: 'H010504365',
        razon_cambio: '',
        SocResumida: ''
      }
    },
    {
      documentType: 'NCP',
      errorMessage: '',
      documentId: '322874',
      pdfOk: '2022-02-25 18:24:00.000',
      invoiceClass: '',
      documentNumber: '0300578881',
      documentPackageId: '0300578881',
      confirmed: 'Si',
      pdfFile: 'NCP0300578881.pdf',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'TM01',
      icon: 'ifNA',
      orderNumber: '0300578881',
      dynamicItems: {
        Bloqueos: '',
        Confirmado: 'Si',
        desc_cliente: 'TALLER TEPANCO',
        fecha_doc: '2021-03-31 00:00:00.000',
        NCPHMercadoCod: 'N',
        NCPHSociedad: 'TM01',
        nro_pedido: '0300578881',
        num_cte_sol: 'H010504365',
        razon_cambio: '',
        SocResumida: ''
      }
    },
    {
      documentType: 'NCP',
      errorMessage: '',
      documentId: '322875',
      pdfOk: '2022-02-25 18:24:00.000',
      invoiceClass: '',
      documentNumber: '0300578954',
      documentPackageId: '0300578954',
      confirmed: 'Si',
      pdfFile: 'NCP0300578954.pdf',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'TM01',
      icon: 'ifNA',
      orderNumber: '0300578954',
      dynamicItems: {
        Bloqueos: '',
        Confirmado: 'Si',
        desc_cliente: 'GRANJA BACHOCO YECAPIXTLA',
        fecha_doc: '2021-03-31 00:00:00.000',
        NCPHMercadoCod: 'N',
        NCPHSociedad: 'TM01',
        nro_pedido: '0300578954',
        num_cte_sol: 'H010504365',
        razon_cambio: 'Importe condición;Precio de crédito;Precio de crédito;Unidad de medida;Precio neto;Grupo condiciones 4;',
        SocResumida: ''
      }
    },
        {
      documentType: 'SU',
      errorMessage: '',
      documentId: '1151326',
      pdfOk: '',
      invoiceClass: '',
      documentNumber: '1100022142',
      documentPackageId: '',
      confirmed: 'SOC con leyenda Draft',
      pdfFile: '',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'USA0',
      icon: '',
      orderNumber: 'PRUEBA2',
      dynamicItems: {
        fecha_doc: '2026-01-06 00:00:00.000',
        num_cte_sol: '400003895',
        SOC: '1100022142',
        SUHCanalDistrib: 'SH',
        SUHConsig: 'F000009247',
        SUHConsigName: 'METALMAX LLC',
        SUHOrgVentas: 'USA0',
        SUHPedidoCte: 'PRUEBA2',
        SUHSolicNombre: 'METALMAX LLC'
      }
    },
    {
      documentType: 'SU',
      errorMessage: '',
      documentId: '1151393',
      pdfOk: '',
      invoiceClass: '',
      documentNumber: '1100022143',
      documentPackageId: '',
      confirmed: 'SOC con leyenda Draft',
      pdfFile: '',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'USA0',
      icon: '',
      orderNumber: 'PRUEBA CIERRE CS',
      dynamicItems: {
        fecha_doc: '2026-01-09 00:00:00.000',
        num_cte_sol: '400003895',
        SOC: '1100022143',
        SUHCanalDistrib: 'SH',
        SUHConsig: 'F000009247',
        SUHConsigName: 'METALMAX LLC',
        SUHOrgVentas: 'USA0',
        SUHPedidoCte: 'PRUEBA CIERRE CS',
        SUHSolicNombre: 'METALMAX LLC'
      }
    },
    {
      documentType: 'SU',
      errorMessage: '',
      documentId: '1151426',
      pdfOk: '',
      invoiceClass: '',
      documentNumber: '1100022144',
      documentPackageId: '',
      confirmed: 'SOC con leyenda Draft',
      pdfFile: '',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'USA0',
      icon: '',
      orderNumber: '330475',
      dynamicItems: {
        fecha_doc: '2026-01-12 00:00:00.000',
        num_cte_sol: '400004572',
        SOC: '1100022144',
        SUHCanalDistrib: 'MX',
        SUHConsig: 'F600004604',
        SUHConsigName: 'IVACO ROLLING MILLS',
        SUHOrgVentas: 'USA0',
        SUHPedidoCte: '330475',
        SUHSolicNombre: 'Ivaco Rolling Mills 2004 LP'
      }
    },
    {
      documentType: 'SU',
      errorMessage: '',
      documentId: '1151442',
      pdfOk: '',
      invoiceClass: '',
      documentNumber: '1100022146',
      documentPackageId: '',
      confirmed: 'SOC con leyenda Draft',
      pdfFile: '',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'USA0',
      icon: '',
      orderNumber: 'Prueba aprobador ruta larga',
      dynamicItems: {
        fecha_doc: '2026-01-13 00:00:00.000',
        num_cte_sol: '400003478',
        SOC: '1100022146',
        SUHCanalDistrib: 'MX',
        SUHConsig: 'F600001727',
        SUHConsigName: 'MHX - FONTANA',
        SUHOrgVentas: 'USA0',
        SUHPedidoCte: 'Prueba aprobador ruta larga',
        SUHSolicNombre: 'California Steel Services, Inc'
      }
    },
    {
      documentType: 'SU',
      errorMessage: '',
      documentId: '1151614',
      pdfOk: '',
      invoiceClass: '',
      documentNumber: '1100022160',
      documentPackageId: '',
      confirmed: 'SOC con leyenda Draft',
      pdfFile: '',
      sentOk: '',
      printedOk: '',
      packagedOk: '',
      salesOrganization: 'USA0',
      icon: '',
      orderNumber: 'PO-TEST MMG',
      dynamicItems: {
        fecha_doc: '2026-01-20 00:00:00.000',
        num_cte_sol: '400004093',
        SOC: '1100022160',
        SUHCanalDistrib: 'SH',
        SUHConsig: 'F000003996',
        SUHConsigName: 'FLACK GLOBAL METALS',
        SUHOrgVentas: 'USA0',
        SUHPedidoCte: 'PO-TEST MMG',
        SUHSolicNombre: 'FLACK GLOBAL METALS'
      }
    }
  ];

  let data = [...MOCK_DATA];

  // 👇 AQUÍ (antes de cualquier filtro)
  console.log('REQUEST MOCK:', request);
  console.log('FILTERS:', request.filters);

  // 🔹 filtro por tipo documento
  if (request.documentType) {
    data = data.filter(x => x.documentType === request.documentType);
  }

  // 👇 OPCIONAL: ver datos antes de filtrar dinámicos
  console.log('DATA BEFORE FILTER:', data);

  // 🔹 filtros dinámicos
  if (request.filters) {
    Object.entries(request.filters).forEach(([key, value]) => {

      console.log('APLICANDO FILTRO:', key, value); // 👈 clave aquí

      if (value === null || value === undefined || value === '') return;

      data = data.filter(item => {
        const dynamicItems = item.dynamicItems as Record<string, any>;

        const val =
          dynamicItems[key] ??
          (item as Record<string, any>)[key];

        console.log('VALOR EN ITEM:', key, val); // 👈 DEBUG por registro

        if (val === null || val === undefined || val === '') {
          return false;
        }

        return val
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase());
      });
    });
  }

  // 👇 resultado final
  console.log('DATA FINAL:', data);

  // return {
  //   recordsFiltered: data.length,
  //   data
  // } as unknown as DocumentGridPageResponse;


  return {
    recordsFiltered: data.length,
    data
  } as unknown as DocumentGridPageResponse;
}

  getClientSuggestions(prefix: string, filter: string): Promise<DocumentClientInfoResponse[]> {
    const params = new HttpParams()
      .set('prefix', prefix)
      .set('filtro', filter);

    return firstValueFrom(
      this.http.get<DocumentClientInfoResponse[]>(this.buildUrl('api/documentos/clientes'), { params })
    );
  }

  async downloadDocumentFile(request: DocumentFileRequest): Promise<void> {
    const response = await firstValueFrom(
      this.http.get(this.buildUrl('api/documentos/archivo'), {
        params: this.toHttpParams({
          documentType: request.documentType,
          documentNumber: request.documentNumber,
          userId: request.userId ?? '',
          documentId: request.documentId ?? '',
          invoiceClass: request.invoiceClass ?? ''
        }),
        observe: 'response',
        responseType: 'blob'
      })
    );

    this.downloadBlob(
      response,
      this.resolveFileName(response, `${request.documentNumber || 'documento'}.bin`)
    );
  }

  async openDocumentPdf(request: DocumentFileRequest): Promise<void> {
if (!environment.production) {
  const blob = this.getMockPdf(request);
  this.openBlob(blob, `${request.documentType}${request.documentNumber}.pdf`);
  return;
}

  const response = await firstValueFrom(
    this.http.get(this.buildUrl('api/documentos/pdf'), {
      params: this.toHttpParams({
        documentType: request.documentType,
        documentNumber: request.documentNumber,
        userId: request.userId ?? '',
        documentId: request.documentId ?? '',
        invoiceClass: request.invoiceClass ?? ''
      }),
      observe: 'response',
      responseType: 'blob'
    })
  );

  const blob = response.body ?? new Blob([], { type: 'application/pdf' });
  this.openBlob(blob, `${request.documentType}${request.documentNumber}.pdf`);
}

async openDocumentXml(request: DocumentFileRequest): Promise<void> {
  const xmlDocumentType = this.getXmlDocumentType(request.documentType);

  if (!environment.production) {
    const blob = this.getMockXml(request);
    this.openBlob(blob, `${xmlDocumentType}${request.documentNumber}.xml`);
    return;
  }

  const response = await firstValueFrom(
    this.http.get(this.buildUrl('api/documentos/xml'), {
      params: this.toHttpParams({
        documentType: xmlDocumentType,
        documentNumber: request.documentNumber,
        userId: request.userId ?? '',
        documentId: request.documentId ?? '',
        invoiceClass: request.invoiceClass ?? ''
      }),
      observe: 'response',
      responseType: 'blob'
    })
  );

  const blob = response.body ?? new Blob([], { type: 'text/xml' });
  this.openBlob(blob, `${xmlDocumentType}${request.documentNumber}.xml`);
}

private getMockXml(request: DocumentFileRequest): Blob {

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Comprobante 
  fecha="31/MAR/2021"
  fechaActualizacion="${new Date().toISOString()}"
  documento="${request.documentNumber}"
  tipo="${request.documentType}"
  vendidoa="H010504365"
  descvendidoa="BACHOCO SA DE CV"
  consignatario="N000125974"
  descconsignatario="ALMACEN VIEZCA ALTO DE NORIA"
  ordenCompra="4506539780"
  mercado="Nacional"
  moneda="MXP"
  subtotal="262722.86"
  iva="42035.66"
  total="304758.52"
  documentId="${request.documentId ?? ''}"
  userId="${request.userId ?? ''}"
  invoiceClass="${request.invoiceClass ?? ''}">

  <Conceptos>
    <Concepto 
      partida="10"
      descripcion="T ZINTRO POLIN C MN500000"
      fechaConfirma="8/6/2021"
      UM="PZA"
      cantidad="36.00"
      punitario="590.0400"
      importe="21241.44" />
  </Conceptos>

  <Meta>
    <GeneradoPor>Mock SDE</GeneradoPor>
    <FechaGeneracion>${new Date().toISOString()}</FechaGeneracion>
  </Meta>

</Comprobante>`;

  return new Blob([xml], { type: 'text/xml;charset=utf-8' });
}

// private getMockPdf(request: DocumentFileRequest): Blob {
//   const pdfContent = `%PDF-1.4
// 1 0 obj
// << /Type /Catalog /Pages 2 0 R >>
// endobj
// 2 0 obj
// << /Type /Pages /Kids [3 0 R] /Count 1 >>
// endobj
// 3 0 obj
// << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
// endobj
// 4 0 obj
// << /Length 180 >>
// stream
// BT
// /F1 24 Tf
// 80 720 Td
// (Mock PDF SDE) Tj
// 0 -40 Td
// /F1 14 Tf
// (Document Type: ${request.documentType}) Tj
// 0 -25 Td
// (Document Number: ${request.documentNumber}) Tj
// 0 -25 Td
// (Document Id: ${request.documentId ?? ''}) Tj
// ET
// endstream
// endobj
// 5 0 obj
// << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
// endobj
// xref
// 0 6
// 0000000000 65535 f 
// 0000000009 00000 n 
// 0000000058 00000 n 
// 0000000115 00000 n 
// 0000000241 00000 n 
// 0000000471 00000 n 
// trailer
// << /Size 6 /Root 1 0 R >>
// startxref
// 541
// %%EOF`;

//   return new Blob([pdfContent], { type: 'application/pdf' });
// }

//   async openDocumentPdf(request: DocumentFileRequest): Promise<void> {

//   // 🔸 MOCK
//   if (!environment.production) {
//     const blob = this.getMockPdf();
//     const objectUrl = URL.createObjectURL(blob);

//     window.open(objectUrl, '_blank', 'noopener,noreferrer');
//     window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
//     return;
//   }

//   // 🔸 API REAL
//   const response = await firstValueFrom(
//     this.http.get(this.buildUrl('api/documentos/pdf'), {
//       params: this.toHttpParams({
//         documentType: request.documentType,
//         documentNumber: request.documentNumber,
//         userId: request.userId ?? '',
//         documentId: request.documentId ?? '',
//         invoiceClass: request.invoiceClass ?? ''
//       }),
//       observe: 'response',
//       responseType: 'blob'
//     })
//   );

//   const blob = response.body ?? new Blob([], { type: 'application/pdf' });
//   const objectUrl = URL.createObjectURL(blob);

//   window.open(objectUrl, '_blank', 'noopener,noreferrer');
//   window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
// }
  // async openDocumentPdf(request: DocumentFileRequest): Promise<void> {
  //   const response = await firstValueFrom(
  //     this.http.get(this.buildUrl('api/documentos/pdf'), {
  //       params: this.toHttpParams({
  //         documentType: request.documentType,
  //         documentNumber: request.documentNumber,
  //         userId: request.userId ?? '',
  //         documentId: request.documentId ?? '',
  //         invoiceClass: request.invoiceClass ?? ''
  //       }),
  //       observe: 'response',
  //       responseType: 'blob'
  //     })
  //   );

  //   const blob = response.body ?? new Blob([], { type: 'application/pdf' });
  //   const objectUrl = URL.createObjectURL(blob);
  //   window.open(objectUrl, '_blank', 'noopener,noreferrer');
  //   window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  // }

private getMockPdf(request: DocumentFileRequest): Blob {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page 
   /Parent 2 0 R 
   /MediaBox [0 0 612 792] 
   /Contents 4 0 R 
   /Resources << /Font << /F1 5 0 R >> >> 
>>
endobj

4 0 obj
<< /Length 300 >>
stream
BT
/F1 24 Tf
80 750 Td
(SDE Mock PDF) Tj

0 -40 Td
/F1 14 Tf
(Document Type: ${request.documentType}) Tj

0 -25 Td
(Document Number: ${request.documentNumber}) Tj

0 -25 Td
(Document Id: ${request.documentId ?? ''}) Tj

0 -25 Td
(User: ${request.userId ?? ''}) Tj

0 -25 Td
(Invoice Class: ${request.invoiceClass ?? ''}) Tj

0 -40 Td
--- Datos simulados ---

0 -25 Td
Cliente: ALMACEN VIEZCA

0 -25 Td
Total: $304,758.52

ET
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000270 00000 n 
0000000580 00000 n 

trailer
<< /Size 6 /Root 1 0 R >>

startxref
650
%%EOF`;

  return new Blob([content], { type: 'application/pdf' });
}
async exportExcel(
  request: DocumentExportRequest,
  fileName = 'Documentos.xlsx'
): Promise<void> {
  console.group('📡 API EXPORT EXCEL');
  console.log('🌐 Endpoint', this.buildUrl('api/documentos/export/excel'));
  console.log('📤 Request', request);
  console.log('🗂️ FileName', fileName);

  try {
    console.time('⏱️ api exportExcel');

    await this.downloadPost(
      'api/documentos/export/excel',
      request,
      fileName
    );

    console.timeEnd('⏱️ api exportExcel');
    console.log('✅ API exportExcel finalizado');

  } catch (error) {
    console.error('❌ Error API exportExcel', error);
    throw error;
  } finally {
    console.groupEnd();
  }
}

  async exportConciliation(request: DocumentExportRequest): Promise<void> {
    await this.downloadPost('api/documentos/export/conciliacion', request, 'ReporteConciliacion.zip');
  }

  async exportZip(request: DocumentExportRequest): Promise<void> {
    await this.downloadPost('api/documentos/zip', request, 'Documentos.zip');
  }

  // async downloadMultifile(request: DocumentMultifileRequest): Promise<void> {
  //   const fallbackName = request.type === 'Multi' ? 'Documentos.zip' : 'Documentos.pdf';
  //   await this.downloadPost('api/documentos/multifile', request, fallbackName);
  // }

async downloadMultifile(
  request: DocumentMultifileRequest,
  fallbackName: string
): Promise<void> {

  debugger;

  console.group('📦 DOWNLOAD MULTIFILE');

  console.log('📤 Endpoint',
    this.buildUrl('api/documentos/multifile'));

  console.log('📄 Request', request);

  console.log('🗂️ Fallback FileName', fallbackName);

  console.log('📊 Total items',
    request.items?.length ?? 0);

  console.table(
    (request.items ?? []).map(x => ({
      id: x.id,
      remision: x.remision
    }))
  );

  try {

    console.time('⏱️ downloadMultifile');

    await this.downloadPost(
      'api/documentos/multifile',
      request,
      fallbackName
    );

    console.timeEnd('⏱️ downloadMultifile');

    console.log('✅ Descarga completada');

  }
  catch (error) {

    console.error(
      '❌ Error downloadMultifile',
      error
    );

    throw error;
  }
  finally {

    console.groupEnd();
  }
}

  queueRegeneration(items: { id: number; remision: string }[]): Promise<DocumentQueueResponse> {
    return firstValueFrom(
      this.http.post<DocumentQueueResponse>(this.buildUrl('api/documentos/recreacion/cola'), items)
    );
  }

  private async downloadPost(path: string, body: unknown, fallbackFileName: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post(this.buildUrl(path), body, {
        observe: 'response',
        responseType: 'blob'
      })
    );

    this.downloadBlob(response, this.resolveFileName(response, fallbackFileName));
  }

  private downloadBlob(response: HttpResponse<Blob>, fallbackFileName: string): void {
    const blob = response.body ?? new Blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fallbackFileName;
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  }

  private resolveFileName(response: HttpResponse<Blob>, fallbackFileName: string): string {
    const contentDisposition = response.headers.get('content-disposition') ?? '';
    const match = /filename\*?=(?:UTF-8''|\")?([^;\"]+)/i.exec(contentDisposition);
    if (!match?.[1]) {
      return fallbackFileName;
    }

    return decodeURIComponent(match[1].replace(/\"/g, '').trim());
  }

  private toHttpParams(values: Record<string, string>): HttpParams {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(values)) {
      if (!value) {
        continue;
      }

      params = params.set(key, value);
    }

    return params;
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
  }

getDocumentGroup(code: string): Promise<string[]> {

  /* ==================== 🔸 MODO MOCK 🔸 ==================== */
  if (!environment.production) {
    return Promise.resolve(this.getMockDocumentGroup(code));
  }

  /* ==================== 🔸 API REAL 🔸 ==================== */
  const params = new HttpParams().set('code', code);

  return firstValueFrom(
    this.http.get<{ code: string; documentTypes: string[] }>(
      this.buildUrl('api/documentos/agrupador'),
      { params }
    )
  ).then(res => res.documentTypes);
}

private getMockDocumentGroup(code: string): string[] {

  const groups: Record<string, string[]> = {

    // 🔹 SOC
    SOC: ['CP', 'NCP', 'NCPR', 'SU', 'TCP', 'CA'],

    // 🔹 ASN
    ASN: ['NS', 'NSC', 'NSF', 'NSS', 'NST', 'SN']
  };

  return groups[code] || [];
}

getHeaders(documentType: string, dfSearchField?: string): Promise<DocumentField[]> {

  /* 🔸 MOCK */
  if (!environment.production) {
    let headers = this.getMockHeaders(documentType);

    if (dfSearchField) {
      headers = headers.filter(h => h.searchField === dfSearchField);
    }

    return Promise.resolve(headers);
  }

  /* 🔸 API REAL */
  let params = new HttpParams();

  if (dfSearchField) {
    params = params.set('dfSearchField', dfSearchField);
  }

  return firstValueFrom(
    this.http.get<DocumentField[]>(
      this.buildUrl(`api/documentos/headers/${documentType}`),
      { params }
    )
  );
}

private getMockHeaders(documentType: string): DocumentField[] {
  const mockHeaders: Record<string, DocumentField[]> = {
    NCP: [
      {
        id: 'nro_pedido',
        documentTypeId: 'NCP',
        friendlyName: 'Pedido',
        width: 75,
        align: 2,
        alignText: 'Center',
        order: 1,
        searchField: 'T',
        isAutoCompleteClient: false
      },
      {
        id: 'fecha_doc',
        documentTypeId: 'NCP',
        friendlyName: 'Fecha Documento',
        width: 70,
        align: 2,
        alignText: 'Center',
        order: 2,
        searchField: 'F',
        isAutoCompleteClient: false
      },
      {
        id: 'num_cte_sol',
        documentTypeId: 'NCP',
        friendlyName: 'No. Cliente',
        width: 75,
        align: 2,
        alignText: 'Center',
        order: 3,
        searchField: 'T',
        isAutoCompleteClient: false
      },
      {
        id: 'desc_cliente',
        documentTypeId: 'NCP',
        friendlyName: 'Desc. Cliente',
        width: 250,
        align: 2,
        alignText: 'Center',
        order: 4,
        searchField: 'T',
        isAutoCompleteClient: false
      },
      {
        id: 'NCPHMercadoCod',
        documentTypeId: 'NCP',
        friendlyName: 'Mercado',
        width: 5,
        align: 2,
        alignText: 'Center',
        order: 5,
        searchField: 'T',
        isAutoCompleteClient: false
      },
      {
        id: 'Confirmado',
        documentTypeId: 'NCP',
        friendlyName: 'Confirmado',
        width: 10,
        align: 2,
        alignText: 'Center',
        order: 6,
        searchField: 'T',
        isAutoCompleteClient: false
      },
      {
        id: 'razon_cambio',
        documentTypeId: 'NCP',
        friendlyName: 'Razon',
        width: 75,
        align: 2,
        alignText: 'Center',
        order: 7,
        searchField: 'F',
        isAutoCompleteClient: false
      },
      {
        id: 'Bloqueos',
        documentTypeId: 'NCP',
        friendlyName: 'Bloqueos',
        width: 75,
        align: 2,
        alignText: 'Center',
        order: 8,
        searchField: 'F',
        isAutoCompleteClient: false
      },
      {
        id: 'NCPHSociedad',
        documentTypeId: 'NCP',
        friendlyName: 'Sociedad',
        width: 100,
        align: 1,
        alignText: 'Left',
        order: 9,
        searchField: 'F',
        isAutoCompleteClient: false
      },
      {
        id: 'SocResumida',
        documentTypeId: 'NCP',
        friendlyName: 'Pedido sin precio',
        width: 75,
        align: 2,
        alignText: 'Center',
        order: 10,
        searchField: 'F',
        isAutoCompleteClient: false
      }
    ],

    CP: [
     {
  id: 'nro_pedido',
  documentTypeId: 'CP',
  friendlyName: 'Pedido',
  width: 75,
  align: 2,
  alignText: 'Center',
  order: 1,
  searchField: 'T',
  isAutoCompleteClient: false
},
{
  id: 'fecha_doc',
  documentTypeId: 'CP',
  friendlyName: 'Fecha Documento',
  width: 70,
  align: 2,
  alignText: 'Center',
  order: 2,
  searchField: 'F',
  isAutoCompleteClient: false
},
{
  id: 'num_cte_sol',
  documentTypeId: 'CP',
  friendlyName: 'No. Cliente',
  width: 75,
  align: 2,
  alignText: 'Center',
  order: 3,
  searchField: 'T',
  isAutoCompleteClient: false
},
{
  id: 'desc_cliente',
  documentTypeId: 'CP',
  friendlyName: 'Desc. Cliente',
  width: 250,
  align: 2,
  alignText: 'Center',
  order: 4,
  searchField: 'T',
  isAutoCompleteClient: false
},
{
  id: 'Confirmado',
  documentTypeId: 'CP',
  friendlyName: 'Confirmado',
  width: 10,
  align: 2,
  alignText: 'Center',
  order: 5,
  searchField: 'T',
  isAutoCompleteClient: false
},
{
  id: 'razon_cambio',
  documentTypeId: 'CP',
  friendlyName: 'Razon',
  width: 75,
  align: 2,
  alignText: 'Center',
  order: 6,
  searchField: 'F',
  isAutoCompleteClient: false
},
{
  id: 'Bloqueos',
  documentTypeId: 'CP',
  friendlyName: 'Bloqueos',
  width: 75,
  align: 2,
  alignText: 'Center',
  order: 7,
  searchField: 'F',
  isAutoCompleteClient: false
},
{
  id: 'Sociedad',
  documentTypeId: 'CP',
  friendlyName: 'Sociedad',
  width: 75,
  align: 2,
  alignText: 'Center',
  order: 8,
  searchField: 'F',
  isAutoCompleteClient: false
}
    ],

    NS: [
      // NS
{
  id: 'num_cte_sol',
  documentTypeId: 'NS',
  friendlyName: 'No. Cliente',
  width: 70,
  align: 2,
  alignText: 'Center',
  order: 1,
  searchField: 'T',
  isAutoCompleteClient: false
},
{
  id: 'nro_doc_despacho',
  documentTypeId: 'NS',
  friendlyName: 'No. Remisión',
  width: 70,
  align: 2,
  alignText: 'Center',
  order: 2,
  searchField: 'T',
  isAutoCompleteClient: false
},
{
  id: 'num_proveedor',
  documentTypeId: 'NS',
  friendlyName: 'No. Proveedor',
  width: 70,
  align: 2,
  alignText: 'Center',
  order: 3,
  searchField: 'F',
  isAutoCompleteClient: false
},
{
  id: 'desc_cliente_sol',
  documentTypeId: 'NS',
  friendlyName: 'Desc. Cliente',
  width: 200,
  align: 2,
  alignText: 'Center',
  order: 4,
  searchField: 'T',
  isAutoCompleteClient: false
},
{
  id: 'nro_pedido',
  documentTypeId: 'NS',
  friendlyName: 'No. Pedido',
  width: 70,
  align: 2,
  alignText: 'Center',
  order: 5,
  searchField: 'T',
  isAutoCompleteClient: false
},
{
  id: 'desc_cliente_consig',
  documentTypeId: 'NS',
  friendlyName: 'Desc. Consignatario',
  width: 200,
  align: 2,
  alignText: 'Center',
  order: 6,
  searchField: 'F',
  isAutoCompleteClient: false
},
{
  id: 'num_cte_consig',
  documentTypeId: 'NS',
  friendlyName: 'No. Consignatario',
  width: 70,
  align: 2,
  alignText: 'Center',
  order: 7,
  searchField: 'T',
  isAutoCompleteClient: false
},
{
  id: 'desc_proveedor',
  documentTypeId: 'NS',
  friendlyName: 'Transportista',
  width: 200,
  align: 2,
  alignText: 'Center',
  order: 8,
  searchField: 'F',
  isAutoCompleteClient: false
},
{
  id: 'fecha_doc',
  documentTypeId: 'NS',
  friendlyName: 'Fecha Embarque',
  width: 100,
  align: 2,
  alignText: 'Center',
  order: 9,
  searchField: 'F',
  isAutoCompleteClient: false
},
{
  id: 'cod_org_venta_key',
  documentTypeId: 'NS',
  friendlyName: 'Planta',
  width: 70,
  align: 2,
  alignText: 'Center',
  order: 10,
  searchField: 'T',
  isAutoCompleteClient: false
},
{
  id: 'NSHDocId',
  documentTypeId: 'NS',
  friendlyName: 'SN ID',
  width: 50,
  align: 2,
  alignText: 'Center',
  order: 11,
  searchField: 'T',
  isAutoCompleteClient: false
},
{
  id: 'NSHSociedad',
  documentTypeId: 'NS',
  friendlyName: 'Sociedad',
  width: 100,
  align: 1,
  alignText: 'Left',
  order: 12,
  searchField: 'F',
  isAutoCompleteClient: false
}
    ]
  };

  return mockHeaders[documentType] || [];
}

// private getMockPdf(): Blob {
//   const base64Pdf = `
// JVBERi0xLjQKJcfs... (puedes poner un base64 real o dejar esto)
// `;

//   const byteCharacters = atob(base64Pdf.replace(/\s/g, ''));
//   const byteNumbers = new Array(byteCharacters.length)
//     .fill(0)
//     .map((_, i) => byteCharacters.charCodeAt(i));

//   const byteArray = new Uint8Array(byteNumbers);

//   return new Blob([byteArray], { type: 'application/pdf' });
// }

private openBlob(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = objectUrl;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.download = fileName;

  // Para abrir en nueva pestaña
  window.open(objectUrl, '_blank', 'noopener,noreferrer');

  // Si quieres forzar descarga, usa esto en lugar de window.open:
  // a.click();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}

private getXmlDocumentType(documentType: string): string {
  const map: Record<string, string> = {
    NCP: 'XCN',
    CP: 'XCP',
    NS: 'XNS',
    SU: 'XSU'
  };

  return map[documentType] ?? documentType;
}

// getSendMailConfig(request: {
//   docType: string;
//   doId: string;
//   doNumber: string;
// }): Promise<SendMailConfigResponse> {

//   /* ==================== 🔸 MODO MOCK 🔸 ==================== */
//   if (!environment.production) {
//     return Promise.resolve({
//       docType: request.docType,
//       doId: request.doId,
//       doNumber: request.doNumber,

//       tipodeEnvio: 'Mail',
//       tipodeEnvioList: [
//         { value: 'Mail', text: 'Mail' },
//         { value: 'FTP', text: 'FTP' },
//         { value: 'COPY', text: 'Copy' },
//         { value: 'SFTP', text: 'SFTP' },
//         { value: 'WS', text: 'Web Service' }
//       ],

//       para: 'cliente@correo.com',
//       subject: `TERNIUM - Documento ${request.docType}`,
//       body: `Estimado Cliente:\n\nSe adjunta documento.\n\nSaludos.`,
//       datoAdjunto: `${request.doNumber}.pdf, X${request.doNumber}.xml`
//     });
//   }

//   /* ==================== 🔸 API REAL 🔸 ==================== */
//   return firstValueFrom(
//     this.http.get<SendMailConfigResponse>(
//       this.buildUrl('api/send-mail/config'),
//       {
//         params: {
//           docType: request.docType,
//           doId: request.doId,
//           doNumber: request.doNumber
//         }
//       }
//     )
//   );
// }

async getSendMailConfig(request: {
  docType: string;
  doId: string;
  doNumber: string;
}): Promise<SendMailConfigResponse> {

  console.group('📧 GET SEND MAIL CONFIG');

  console.log('📤 Endpoint',
    this.buildUrl('api/documentos/send-mail/modal-data'));

  console.log('📄 Request', request);

  try {
    console.time('⏱️ getSendMailConfig');

    if (!environment.production) {
      const mockResponse: SendMailConfigResponse = {
  docType: request.docType,
  doId: request.doId,
  doNumber: request.doNumber,

  tipodeEnvio: 'Mail',
  tipodeEnvioList: [
    { value: 'Mail', text: 'Mail' },
    { value: 'FTP', text: 'FTP' },
    { value: 'Copy', text: 'Copy' },
    { value: 'SFTP', text: 'SFTP' },
    { value: 'WS', text: 'WS' }
  ],

  para: 'cliente@correo.com',
  subject: `TERNIUM - Documento ${request.docType}`,
  body: `Estimado Cliente:\n\nSe adjunta documento.\n\nSaludos.`,
  datoAdjunto: `${request.doNumber}.pdf, X${request.doNumber}.xml`,
  from: 'notificaciones@ternium.com',

  pnlCombo: true,
  pnlHome: true,
  pnlFTP: false,
  pnlCOPY: false,
  pnlSFTP: false,
  pnlWS: false,
  pnlVar: false,

  hostFTP: '',
  userFTP: '',
  pathFTP: '',
  filesFTP: '',

  rutaDestino: '',
  filesCopy: '',

  key: '',
  pathFrom: '',
  pathTo: '',
  serverTo: '',

  files: [
    {
      fileName: `${request.doNumber}.pdf`,
      mimeType: 'application/pdf',
      mimeName: 'PDF'
    },
    {
      fileName: `X${request.doNumber}.xml`,
      mimeType: 'text/xml',
      mimeName: 'XML'
    }
  ]
};

      console.log('🧪 MockResponse', mockResponse);
      console.timeEnd('⏱️ getSendMailConfig');
      return mockResponse;
    }

    const response = await firstValueFrom(
      this.http.get<SendMailConfigResponse>(
        this.buildUrl('api/documentos/send-mail/modal-data'),
        {
          params: {
            docType: request.docType,
            doId: request.doId,
            doNumber: request.doNumber
          }
        }
      )
    );

    console.log('✅ Response getSendMailConfig', response);
    console.timeEnd('⏱️ getSendMailConfig');

    return response;
  }
  catch (error) {
    console.error('❌ Error getSendMailConfig', error);
    throw error;
  }
  finally {
    console.groupEnd();
  }
}

async downloadMassiveZip(request: any): Promise<void> {
const fileName = request.fileName || 'DescargaMasiva.zip';
  /* ==================== 🔸 MODO MOCK 🔸 ==================== */
// if (!environment.production) {

//   console.log('📦 NOMBRE ZIP 👉', fileName);

//   const blob = new Blob(
//     [`Mock ZIP:\n\n${JSON.stringify(request, null, 2)}`],
//     { type: 'application/zip' }
//   );

//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = fileName;
//   a.click();
//   window.URL.revokeObjectURL(url);

//   return Promise.resolve();
// }

 if (!environment.production) {
    const zip = new JSZip();

    for (const doc of request.documents) {
      const folder = zip.folder(doc.doId);

      const fileRequest: DocumentFileRequest = {
        documentType: doc.docType,
        documentNumber: doc.doNumber,
        documentId: doc.doId,
        userId: request.userId
      };

      const pdfBlob = this.getMockPdf(fileRequest);
      const xmlBlob = this.getMockXml({
        ...fileRequest,
        documentType: this.getMockXmlType(doc.docType)
      });

      folder?.file(`${doc.docType}${doc.doNumber}.pdf`, pdfBlob);
      folder?.file(`${this.getMockXmlType(doc.docType)}${doc.doNumber}.xml`, xmlBlob);
    }

    const content = await zip.generateAsync({ type: 'blob' });

    FileSaver.saveAs(content, request.fileName || 'DescargaMasiva.zip');
    return;
  }


  /* ==================== 🔸 API REAL 🔸 ==================== */
  return firstValueFrom(
    this.http.post(
      this.buildUrl('api/documentos/descarga-masiva'),
      request,
      { responseType: 'blob' }
    )
  ).then((blob) => {

    console.log('🚀 API REAL DESCARGA MASIVA 👉');
    console.log(JSON.stringify(request, null, 2));

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  });
}

private getMockXmlType(docType: string): string {
  const map: Record<string, string> = {
    NCP: 'XCN',
    CP: 'XC',
    RF: 'RX'
  };

  return map[docType] ?? 'FE';
}

async generateLegacyPdf(
  request: LegacyPdfRequest
): Promise<DocumentQueueResponse> {

  debugger;

  console.group('🚀 GENERATE LEGACY PDF');

  console.log(
    '📤 Endpoint',
    this.buildUrl('api/documentos/legacy/pdf')
  );

  console.log('📄 Request', request);

  console.log('📌 DocumentType', request.documentType);

  console.log('🆔 DocumentId', request.documentId);

  console.log('🔢 DocumentNumber', request.documentNumber);

  console.log('👤 UserId', request.userId);

  try {

    // if (!environment.production) {

    //   console.warn('⚠️ MOCK MODE ENABLED');

    //   const mockResponse = {
    //     error: false,
    //     message: 'PDF legacy mock generado para el documento.'
    //   };

    //   console.log('✅ MockResponse', mockResponse);

    //   return Promise.resolve(mockResponse);
    // }

    // console.time('⏱️ generateLegacyPdf');

    const response = await firstValueFrom(
      this.http.post<DocumentQueueResponse>(
        this.buildUrl('api/documentos/legacy/pdf'),
        request
      )
    );

    console.timeEnd('⏱️ generateLegacyPdf');

    console.log('✅ Response generateLegacyPdf', response);

    return response;

  }
  catch (error) {

    console.error(
      '❌ Error generateLegacyPdf',
      error
    );

    throw error;
  }
  finally {

    console.groupEnd();
  }
}

async addDocumentsQueueBulk(
  request: DocumentQueueBulkRequest
): Promise<DocumentQueueResponse> {

  debugger;

  console.group('📨 ADD DOCUMENTS QUEUE BULK');

  console.log('📤 Endpoint',
    this.buildUrl('api/documentos/queue/add-bulk'));

  console.log('📄 Request', request);

  console.log('📊 Total items',
    request.items?.length ?? 0);

  console.table(
    (request.items ?? []).map(x => ({
      dqNumber: x.dqNumber,
      dqDocId: x.dqDocId,
      dqDocTypeId: x.dqDocTypeId,
      dqAction: x.dqAction
    }))
  );

  try {

    console.time('⏱️ addDocumentsQueueBulk');

    const response = await firstValueFrom(
  this.http.post<DocumentQueueResponse>(
    this.buildUrl('api/documentos/queue/add-bulk'),
    request
  )
);

    

    console.timeEnd('⏱️ addDocumentsQueueBulk');

    console.log('✅ Response', response);

    return response;

  }
  catch (error) {

    console.error(
      '❌ Error addDocumentsQueueBulk',
      error
    );

    throw error;
  }
  finally {

    console.groupEnd();
  }
}

async sendMail(
  request: SendMailConfigResponse
): Promise<SendMailResponse> {

  console.group('📧 SEND MAIL');

  console.log('📤 Endpoint',
    this.buildUrl('api/documentos/send-mail/send'));

  console.log('📄 Request', request);

  try {
    console.time('⏱️ sendMail');

    const response = await firstValueFrom(
      this.http.post<SendMailResponse>(
        this.buildUrl('api/documentos/send-mail/send'),
        request
      )
    );

    console.timeEnd('⏱️ sendMail');
    console.log('✅ Response sendMail', response);

    return response;
  }
  catch (error) {
    console.error('❌ Error sendMail', error);
    throw error;
  }
  finally {
    console.groupEnd();
  }
}

}

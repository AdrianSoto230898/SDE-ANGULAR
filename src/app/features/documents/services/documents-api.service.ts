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
        { code: 'PED', name: 'Pedido' },
        // ACO — Cartas Origen
        { code: 'CO', name: 'Carta País Origen' },
        { code: 'COC', name: 'Carta País Origen Colada' }
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

  const payload = {
    ...request,
    sqlWhere: request.sqlWhere ?? '',
    userId: request.userId ?? ''
  };

  console.log('==============================');
  console.log('📦 GRID REQUEST');
  console.log('==============================');
  console.log('➡️ REQUEST ORIGINAL 👉', request);
  console.log('➡️ PAYLOAD FINAL 👉', payload);
  console.log('➡️ DOCUMENT TYPE 👉', payload.documentType);
  console.log('➡️ FILTERS 👉', payload.filters);
  console.log('➡️ SQL WHERE 👉', payload.sqlWhere);
  console.log('➡️ USER ID 👉', payload.userId);

  /* ==================== 🔸 MODO MOCK 🔸 ==================== */
  if (!environment.production) {
    const response = this.getMockGridPage(payload);

    console.log('==============================');
    console.log('🧪 GRID MOCK RESPONSE');
    console.log('==============================');
    console.log('✅ RESPONSE MOCK 👉', response);
    console.log('✅ DATA MOCK 👉', response.data);
    console.log('✅ TOTAL MOCK 👉', response.recordsFiltered);

    return Promise.resolve(response);
  }

  /* ==================== 🔸 API REAL 🔸 ==================== */
  console.log('🌐 GRID API URL 👉', this.buildUrl('api/documentos/grid'));

  return firstValueFrom(
    this.http.post<DocumentGridPageResponse>(
      this.buildUrl('api/documentos/grid'),
      payload
    )
  )
    .then(response => {
      console.log('==============================');
      console.log('✅ GRID API RESPONSE');
      console.log('==============================');
      console.log('✅ RESPONSE 👉', response);
      console.log('✅ DATA 👉', response.data);
      console.log('✅ TOTAL 👉', response.recordsFiltered);

      return response;
    })
    .catch(error => {
      console.log('==============================');
      console.log('❌ GRID API ERROR');
      console.log('==============================');
      console.error('❌ ERROR 👉', error);

      throw error;
    });
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
    },
  {
    documentType: "B2B",
    errorMessage: "NOK Error en el envio a JG",
    documentId: "430926",
    pdfOk: "false",
    invoiceClass: "E",
    documentNumber: "0000037899",
    documentPackageId: "0097000271-00020",
    confirmed: "false",
    pdfFile: "",
    sentOk: "false",
    printedOk: "false",
    packagedOk: "false",
    salesOrganization: "SDE",
    icon: "error",
    orderNumber: "0097000271-00020",
    dynamicItems: {
      B2BHCliente: "400003459",
      B2BHDescripcion: "OC: 0097000271-00020- 1 Msg: NOK Error en el envio a JG",
      B2BHFechaRecepcion: "2023-11-08 14:28:34.390",
      B2BHIdMsgSap: "",
      B2BHNroMsg: "850",
      B2BHOrdenCompra: "0097000271-00020",
      B2BHSeveridad: "E",
      B2BHSysId: "SDE",
      DescCliente: "Whirlpool Corporation",
      fecha_doc: "20231108",
      nro_pedido: "0000037899"
    }
  },
  {
    documentType: "B2B",
    errorMessage: "NOK Error en el envio a JG",
    documentId: "432470",
    pdfOk: "false",
    invoiceClass: "E",
    documentNumber: "0000038324",
    documentPackageId: "0097000271-00020",
    confirmed: "false",
    pdfFile: "",
    sentOk: "false",
    printedOk: "false",
    packagedOk: "false",
    salesOrganization: "SDE",
    icon: "error",
    orderNumber: "0097000271-00020",
    dynamicItems: {
      B2BHCliente: "400003459",
      B2BHDescripcion: "OC: 0097000271-00020- 1 Msg: NOK Error en el envio a JG",
      B2BHFechaRecepcion: "2023-11-08 14:34:35.603",
      B2BHIdMsgSap: "",
      B2BHNroMsg: "850",
      B2BHOrdenCompra: "0097000271-00020",
      B2BHSeveridad: "E",
      B2BHSysId: "SDE",
      DescCliente: "Whirlpool Corporation",
      fecha_doc: "20231108",
      nro_pedido: "0000038324"
    }
  },
  {
    documentType: "B2B",
    errorMessage: "NOK Error en el envio a JG",
    documentId: "431479",
    pdfOk: "false",
    invoiceClass: "E",
    documentNumber: "0000037963",
    documentPackageId: "0097000762-00010",
    confirmed: "false",
    pdfFile: "",
    sentOk: "false",
    printedOk: "false",
    packagedOk: "false",
    salesOrganization: "SDE",
    icon: "error",
    orderNumber: "0097000762-00010",
    dynamicItems: {
      B2BHCliente: "400003459",
      B2BHDescripcion: "OC: 0097000762-00010- 1 Msg: NOK Error en el envio a JG",
      B2BHFechaRecepcion: "2023-11-08 14:30:29.740",
      B2BHIdMsgSap: "",
      B2BHNroMsg: "850",
      B2BHOrdenCompra: "0097000762-00010",
      B2BHSeveridad: "E",
      B2BHSysId: "SDE",
      DescCliente: "Whirlpool Corporation",
      fecha_doc: "20231108",
      nro_pedido: "0000037963"
    }
  },
  {
    documentType: "B2B",
    errorMessage: "NOK Error en el envio a JG",
    documentId: "432265",
    pdfOk: "false",
    invoiceClass: "E",
    documentNumber: "0000038119",
    documentPackageId: "0097000762-00010",
    confirmed: "false",
    pdfFile: "",
    sentOk: "false",
    printedOk: "false",
    packagedOk: "false",
    salesOrganization: "SDE",
    icon: "error",
    orderNumber: "0097000762-00010",
    dynamicItems: {
      B2BHCliente: "400003459",
      B2BHDescripcion: "OC: 0097000762-00010- 1 Msg: NOK Error en el envio a JG",
      B2BHFechaRecepcion: "2023-11-08 14:32:31.213",
      B2BHIdMsgSap: "",
      B2BHNroMsg: "850",
      B2BHOrdenCompra: "0097000762-00010",
      B2BHSeveridad: "E",
      B2BHSysId: "SDE",
      DescCliente: "Whirlpool Corporation",
      fecha_doc: "20231108",
      nro_pedido: "0000038119"
    }
  },
  {
    documentType: "B2B",
    errorMessage: "NOK Cliente inexistente",
    documentId: "432733",
    pdfOk: "false",
    invoiceClass: "E",
    documentNumber: "0000038465",
    documentPackageId: "0097000762-00010",
    confirmed: "false",
    pdfFile: "",
    sentOk: "false",
    printedOk: "false",
    packagedOk: "false",
    salesOrganization: "SDE",
    icon: "warning",
    orderNumber: "0097000762-00010",
    dynamicItems: {
      B2BHCliente: "400003459",
      B2BHDescripcion: "OC: 0097000762-00010-1 Msg: NOK Cliente inexistente",
      B2BHFechaRecepcion: "2023-11-08 16:20:50.897",
      B2BHIdMsgSap: "",
      B2BHNroMsg: "850",
      B2BHOrdenCompra: "0097000762-00010",
      B2BHSeveridad: "E",
      B2BHSysId: "SDE",
      DescCliente: "Whirlpool Corporation",
      fecha_doc: "20231108",
      nro_pedido: "0000038465"
    }
  },
  {
    documentType: "B2B",
    errorMessage: "NOK Cliente inexistente",
    documentId: "432821",
    pdfOk: "false",
    invoiceClass: "E",
    documentNumber: "0000038509",
    documentPackageId: "0097000762-00010",
    confirmed: "false",
    pdfFile: "",
    sentOk: "false",
    printedOk: "false",
    packagedOk: "false",
    salesOrganization: "SDE",
    icon: "warning",
    orderNumber: "0097000762-00010",
    dynamicItems: {
      B2BHCliente: "400003459",
      B2BHDescripcion: "OC: 0097000762-00010-1 Msg: NOK Cliente inexistente",
      B2BHFechaRecepcion: "2023-11-08 16:24:01.570",
      B2BHIdMsgSap: "",
      B2BHNroMsg: "850",
      B2BHOrdenCompra: "0097000762-00010",
      B2BHSeveridad: "E",
      B2BHSysId: "SDE",
      DescCliente: "Whirlpool Corporation",
      fecha_doc: "20231108",
      nro_pedido: "0000038509"
    }
  },
  {
      documentType: "B2I",
      errorMessage: "",
      documentId: "216359",
      pdfOk: "false",
      invoiceClass: "B2I",
      documentNumber: "1",
      documentPackageId: "1",
      confirmed: "false",
      pdfFile: "",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "N000001527",
      icon: "info",
      orderNumber: "1",
      dynamicItems: {
        DescCliente: "MABE LEISER",
        fecha_doc: "2016-09-22 15:44:36.473",
        invCliente: "N000001527",
        invEnvio: "PREUBAS11",
        invIdB2BOC: "19605",
        nro_pedido: "1",
        doId: "216359",
        doNumber: "1"
      }
    },
    {
      documentType: "B2I",
      errorMessage: "",
      documentId: "217866",
      pdfOk: "true",
      invoiceClass: "B2I",
      documentNumber: "23",
      documentPackageId: "23",
      confirmed: "false",
      pdfFile: "B2I23.pdf",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "N000001527",
      icon: "success",
      orderNumber: "23",
      dynamicItems: {
        DescCliente: "MABE LEISER",
        fecha_doc: "2016-09-28 16:58:41.113",
        invCliente: "N000001527",
        invEnvio: "PREUBAS113",
        invIdB2BOC: "19642",
        nro_pedido: "23",
        doId: "217866",
        doNumber: "23"
      }
    },
    {
      documentType: "B2I",
      errorMessage: "",
      documentId: "217867",
      pdfOk: "true",
      invoiceClass: "B2I",
      documentNumber: "24",
      documentPackageId: "24",
      confirmed: "false",
      pdfFile: "B2I24.pdf",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "N000001527",
      icon: "success",
      orderNumber: "24",
      dynamicItems: {
        DescCliente: "MABE LEISER",
        fecha_doc: "2016-09-28 17:11:10.147",
        invCliente: "N000001527",
        invEnvio: "PREUBAS1134",
        invIdB2BOC: "19643",
        nro_pedido: "24",
        doId: "217867",
        doNumber: "24"
      }
    },
    {
      documentType: "B2I",
      errorMessage: "",
      documentId: "229807",
      pdfOk: "true",
      invoiceClass: "B2I",
      documentNumber: "736",
      documentPackageId: "736",
      confirmed: "false",
      pdfFile: "B2I736.pdf",
      sentOk: "true",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "N000001527",
      icon: "success",
      orderNumber: "736",
      dynamicItems: {
        DescCliente: "MABE LEISER",
        fecha_doc: "2017-04-26 18:11:35.917",
        invCliente: "N000001527",
        invEnvio: "PREUBAS1134",
        invIdB2BOC: "22302",
        nro_pedido: "736",
        doId: "229807",
        doNumber: "736"
      }
    },
    {
      documentType: "B2I",
      errorMessage: "",
      documentId: "229808",
      pdfOk: "true",
      invoiceClass: "B2I",
      documentNumber: "737",
      documentPackageId: "737",
      confirmed: "false",
      pdfFile: "B2I737.pdf",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "N000001527",
      icon: "success",
      orderNumber: "737",
      dynamicItems: {
        DescCliente: "MABE LEISER",
        fecha_doc: "2017-04-26 18:14:05.830",
        invCliente: "N000001527",
        invEnvio: "PREUBASB",
        invIdB2BOC: "22303",
        nro_pedido: "737",
        doId: "229808",
        doNumber: "737"
      }
    },
    {
      documentType: "B2I",
      errorMessage: "",
      documentId: "229809",
      pdfOk: "true",
      invoiceClass: "B2I",
      documentNumber: "738",
      documentPackageId: "738",
      confirmed: "false",
      pdfFile: "B2I738.pdf",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "N000001527",
      icon: "success",
      orderNumber: "738",
      dynamicItems: {
        DescCliente: "MABE LEISER",
        fecha_doc: "2017-04-26 18:47:09.940",
        invCliente: "N000001527",
        invEnvio: "PREUBASB1",
        invIdB2BOC: "22304",
        nro_pedido: "738",
        doId: "229809",
        doNumber: "738"
      }
    },
    {
      documentType: "B2N",
      errorMessage: "",
      documentId: "251599",
      pdfOk: "false",
      invoiceClass: "B2N",
      documentNumber: "0000002268",
      documentPackageId: "0000002268",
      confirmed: "false",
      pdfFile: "",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "H000019504",
      icon: "ifNA",
      orderNumber: "0000002268",
      dynamicItems: {
        nro_pedido: "0000002268",
        B2NHOrdenCompra: "IDPT99",
        B2NHCliente: "H000019504",
        DescCliente: "ACEROS DONDISCH",
        fecha_doc: "20171110",
        B2NHNroMsg: ""
      }
    },
    {
      documentType: "B2N",
      errorMessage: "",
      documentId: "1144780",
      pdfOk: "false",
      invoiceClass: "B2N",
      documentNumber: "0000007222",
      documentPackageId: "0000007222",
      confirmed: "false",
      pdfFile: "",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "H000019504",
      icon: "ifNA",
      orderNumber: "0000007222",
      dynamicItems: {
        nro_pedido: "0000007222",
        B2NHOrdenCompra: "Prueba Sanbox B2B SA",
        B2NHCliente: "H000019504",
        DescCliente: "ACEROS DONDISCH",
        fecha_doc: "20250924",
        B2NHNroMsg: ""
      }
    },
    {
      documentType: "B2N",
      errorMessage: "",
      documentId: "83596",
      pdfOk: "true",
      invoiceClass: "B2N",
      documentNumber: "0000001295",
      documentPackageId: "0000001295",
      confirmed: "false",
      pdfFile: "B2N0000001295.pdf",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "H000030812",
      icon: "ifNA",
      orderNumber: "0000001295",
      dynamicItems: {
        nro_pedido: "0000001295",
        B2NHOrdenCompra: "Att11",
        B2NHCliente: "H000030812",
        DescCliente: "SERVIACERO PLANOS",
        fecha_doc: "20151014",
        B2NHNroMsg: ""
      }
    },
    {
      documentType: "B2N",
      errorMessage: "",
      documentId: "83599",
      pdfOk: "true",
      invoiceClass: "B2N",
      documentNumber: "0000001296",
      documentPackageId: "0000001296",
      confirmed: "false",
      pdfFile: "B2N0000001296.pdf",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "H000030812",
      icon: "ifNA",
      orderNumber: "0000001296",
      dynamicItems: {
        nro_pedido: "0000001296",
        B2NHOrdenCompra: "Att12",
        B2NHCliente: "H000030812",
        DescCliente: "SERVIACERO PLANOS",
        fecha_doc: "20151014",
        B2NHNroMsg: ""
      }
    },
    {
      documentType: "B2N",
      errorMessage: "",
      documentId: "83602",
      pdfOk: "true",
      invoiceClass: "B2N",
      documentNumber: "0000001297",
      documentPackageId: "0000001297",
      confirmed: "false",
      pdfFile: "B2N0000001297.pdf",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "H000030812",
      icon: "ifNA",
      orderNumber: "0000001297",
      dynamicItems: {
        nro_pedido: "0000001297",
        B2NHOrdenCompra: "Att13",
        B2NHCliente: "H000030812",
        DescCliente: "SERVIACERO PLANOS",
        fecha_doc: "20151014",
        B2NHNroMsg: ""
      }
    },
    {
      documentType: "B2N",
      errorMessage: "",
      documentId: "83605",
      pdfOk: "true",
      invoiceClass: "B2N",
      documentNumber: "0000001298",
      documentPackageId: "0000001298",
      confirmed: "false",
      pdfFile: "B2N0000001298.pdf",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "H000030812",
      icon: "ifNA",
      orderNumber: "0000001298",
      dynamicItems: {
        nro_pedido: "0000001298",
        B2NHOrdenCompra: "Att14",
        B2NHCliente: "H000030812",
        DescCliente: "SERVIACERO PLANOS",
        fecha_doc: "20151014",
        B2NHNroMsg: ""
      }
    },
    {
      documentType: "B2S",
      errorMessage: "",
      documentId: "326501",
      pdfOk: "false",
      invoiceClass: "B2S",
      documentNumber: "0000000182",
      documentPackageId: "OCTEST20220329",
      confirmed: "false",
      pdfFile: "",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "SDE",
      icon: "ifNA",
      orderNumber: "0000000182",
      dynamicItems: {
        nro_pedido: "0000000182",
        B2SHNroMsg: "850",
        B2SHOrdenCompra: "OCTEST20220329",
        B2SHCliente: "H000068802",
        fecha_doc: "20220329",
        B2SHSysId: "SDE",
        DescCliente: "STEEL TECHNOLOGIES DE MEXICO"
      }
    },
    {
      documentType: "B2S",
      errorMessage: "",
      documentId: "326931",
      pdfOk: "false",
      invoiceClass: "B2S",
      documentNumber: "0000000183",
      documentPackageId: "OCTEST20220412",
      confirmed: "false",
      pdfFile: "",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "SDE",
      icon: "ifNA",
      orderNumber: "0000000183",
      dynamicItems: {
        nro_pedido: "0000000183",
        B2SHNroMsg: "850",
        B2SHOrdenCompra: "OCTEST20220412",
        B2SHCliente: "H000068802",
        fecha_doc: "20220412",
        B2SHSysId: "SDE",
        DescCliente: "STEEL TECHNOLOGIES DE MEXICO"
      }
    },
    {
      documentType: "B2S",
      errorMessage: "",
      documentId: "340310",
      pdfOk: "false",
      invoiceClass: "B2S",
      documentNumber: "0000000184",
      documentPackageId: "OCTEST20220412",
      confirmed: "false",
      pdfFile: "",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "SDE",
      icon: "ifNA",
      orderNumber: "0000000184",
      dynamicItems: {
        nro_pedido: "0000000184",
        B2SHNroMsg: "850",
        B2SHOrdenCompra: "OCTEST20220412",
        B2SHCliente: "H000068802",
        fecha_doc: "20230616",
        B2SHSysId: "SDE",
        DescCliente: "STEEL TECHNOLOGIES DE MEXICO"
      }
    },
    {
      documentType: "B2S",
      errorMessage: "",
      documentId: "340320",
      pdfOk: "false",
      invoiceClass: "B2S",
      documentNumber: "0000000185",
      documentPackageId: "OCTEST20220412",
      confirmed: "false",
      pdfFile: "",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "SDE",
      icon: "ifNA",
      orderNumber: "0000000185",
      dynamicItems: {
        nro_pedido: "0000000185",
        B2SHNroMsg: "850",
        B2SHOrdenCompra: "OCTEST20220412",
        B2SHCliente: "H000068802",
        fecha_doc: "20230616",
        B2SHSysId: "SDE",
        DescCliente: "STEEL TECHNOLOGIES DE MEXICO"
      }
    },
    {
      documentType: "B2S",
      errorMessage: "",
      documentId: "295999",
      pdfOk: "true",
      invoiceClass: "B2S",
      documentNumber: "0000000149",
      documentPackageId: "prueba7a",
      confirmed: "false",
      pdfFile: "B2S0000000149.pdf",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "SDE",
      icon: "ifNA",
      orderNumber: "0000000149",
      dynamicItems: {
        nro_pedido: "0000000149",
        B2SHNroMsg: "850",
        B2SHOrdenCompra: "prueba7a",
        B2SHCliente: "H000153800",
        fecha_doc: "20200811",
        B2SHSysId: "SDE",
        DescCliente: "INGENIERIA Y MAQUINARIA DE GUADALUP E"
      }
    },
    {
      documentType: "B2S",
      errorMessage: "",
      documentId: "296000",
      pdfOk: "true",
      invoiceClass: "B2S",
      documentNumber: "0000000150",
      documentPackageId: "prueba7a",
      confirmed: "false",
      pdfFile: "B2S0000000150.pdf",
      sentOk: "false",
      printedOk: "false",
      packagedOk: "false",
      salesOrganization: "SDE",
      icon: "ifNA",
      orderNumber: "0000000150",
      dynamicItems: {
        nro_pedido: "0000000150",
        B2SHNroMsg: "850",
        B2SHOrdenCompra: "prueba7a",
        B2SHCliente: "H000153800",
        fecha_doc: "20200811",
        B2SHSysId: "SDE",
        DescCliente: "INGENIERIA Y MAQUINARIA DE GUADALUP E"
      }
    }, 
  {
    "documentType": "NS",
    "errorMessage": "",
    "documentId": "1155812",
    "pdfOk": "2026-04-28 16:33:00.000",
    "invoiceClass": "",
    "documentNumber": "316070340006",
    "documentPackageId": "316070340006",
    "confirmed": "",
    "pdfFile": "NS316070340006.xls",
    "sentOk": "",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "﻿157700817",
    "icon": "ifNA,,,,,,,,,,,,,,,,",
    "orderNumber": "0000228361",
    "dynamicItems": {
      "num_cte_sol": "3000001358",
      "nro_doc_despacho": "316070340006",
      "num_proveedor": "",
      "desc_cliente_sol": "USINAS SIDERURGICAS DE MINAS GERAIS S/A. USIMINAS",
      "nro_pedido": "0000228361",
      "desc_cliente_consig": "USINAS SIDERURGICAS DE MINAS GERAIS S/A. USIMINAS",
      "num_cte_consig": "3000001358",
      "desc_proveedor": "",
      "fecha_doc": "2026-04-10 00:00:00.000",
      "cod_org_venta_key": "﻿157700817",
      "NSHDocId": "316070340006",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154622",
    "pdfOk": "2026-02-18 14:23:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023180",
    "documentPackageId": "200005023180",
    "confirmed": "",
    "pdfFile": "NS200005023180.txt",
    "sentOk": "2026-02-18 14:23:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301725356",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023180",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301725356",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023180",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154428",
    "pdfOk": "2026-02-18 18:22:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023194",
    "documentPackageId": "200005023194",
    "confirmed": "",
    "pdfFile": "NS200005023194.txt",
    "sentOk": "2026-02-18 18:23:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301724903",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023194",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301724903",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023194",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154927",
    "pdfOk": "2026-02-18 19:16:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023199",
    "documentPackageId": "200005023199",
    "confirmed": "",
    "pdfFile": "NS200005023199.txt",
    "sentOk": "2026-02-18 19:18:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173491950",
    "icon": "ifNA,",
    "orderNumber": "0301724845",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023199",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301724845",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "TRANSPORTADORA TRES GENERACIONES",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "173491950",
      "NSHDocId": "200005023199",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1155601",
    "pdfOk": "2026-04-15 00:51:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026269",
    "documentPackageId": "200005026269",
    "confirmed": "",
    "pdfFile": "NS200005026269.txt",
    "sentOk": "2026-04-15 00:52:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301758352",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005026269",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301758352",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005026269",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1155673",
    "pdfOk": "2026-04-15 12:23:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026298",
    "documentPackageId": "200005026298",
    "confirmed": "",
    "pdfFile": "NS200005026298.txt",
    "sentOk": "2026-04-15 12:24:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301758352",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005026298",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301758352",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005026298",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1155066",
    "pdfOk": "2026-02-21 07:21:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023365",
    "documentPackageId": "200005023365",
    "confirmed": "",
    "pdfFile": "NS200005023365.txt",
    "sentOk": "2026-02-21 07:22:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173491950",
    "icon": "ifNA,",
    "orderNumber": "0301725283",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023365",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301725283",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "MIGUEL WONG CRUZ",
      "fecha_doc": "2026-02-21 00:00:00.000",
      "cod_org_venta_key": "173491950",
      "NSHDocId": "200005023365",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "",
    "documentId": "1154383",
    "pdfOk": "2026-02-23 12:12:00.000",
    "invoiceClass": "",
    "documentNumber": "000004969007",
    "documentPackageId": "000004969007",
    "confirmed": "",
    "pdfFile": "ASNFi0004969007.xls",
    "sentOk": "2026-02-23 12:56:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157700851",
    "icon": "ifNA,,,,,,,,,,,,,,,",
    "orderNumber": "0000228223",
    "dynamicItems": {
      "num_cte_sol": "6800000170",
      "nro_doc_despacho": "000004969007",
      "num_proveedor": "",
      "desc_cliente_sol": "PLM STEEL TUBES, LLC",
      "nro_pedido": "0000228223",
      "desc_cliente_consig": "PLM STEEL TUBES",
      "num_cte_consig": "4800004474",
      "desc_proveedor": "AUTO TRANSPORTES DE CARGA RUIZ HNOS",
      "fecha_doc": "2026-02-07 00:00:00.000",
      "cod_org_venta_key": "157700851",
      "NSHDocId": "000004969007",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1155625",
    "pdfOk": "2026-04-15 05:37:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026278",
    "documentPackageId": "200005026278",
    "confirmed": "",
    "pdfFile": "NS200005026278.txt",
    "sentOk": "2026-04-15 05:39:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301758352",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005026278",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301758352",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005026278",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154970",
    "pdfOk": "2026-02-20 18:22:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023317",
    "documentPackageId": "200005023317",
    "confirmed": "",
    "pdfFile": "NS200005023317.txt",
    "sentOk": "2026-02-20 18:23:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA,",
    "orderNumber": "0301724897",
    "dynamicItems": {
      "num_cte_sol": "N000100702",
      "nro_doc_despacho": "200005023317",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM FLEX N GATE",
      "nro_pedido": "0301724897",
      "desc_cliente_consig": "MISA NATIONAL PROCESSING SA DE CV",
      "num_cte_consig": "N000121691",
      "desc_proveedor": "AUTO TRANSPORTES MODERNOS SA DE CV",
      "fecha_doc": "2026-02-20 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023317",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154476",
    "pdfOk": "2026-02-18 21:48:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023202",
    "documentPackageId": "200005023202",
    "confirmed": "",
    "pdfFile": "NS200005023202.xls",
    "sentOk": "2026-02-18 21:50:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173492382",
    "icon": "ifNA",
    "orderNumber": "0301724901",
    "dynamicItems": {
      "num_cte_sol": "N000100707",
      "nro_doc_despacho": "200005023202",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM INMETMATIC",
      "nro_pedido": "0301724901",
      "desc_cliente_consig": "INMETMATIC, S.A. DE C.V.",
      "num_cte_consig": "N000110219",
      "desc_proveedor": "TRANSPORTES MONTERROSA SA de CV",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "173492382",
      "NSHDocId": "200005023202",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154786",
    "pdfOk": "2026-02-19 02:46:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023218",
    "documentPackageId": "200005023218",
    "confirmed": "",
    "pdfFile": "NS200005023218.txt",
    "sentOk": "2026-02-19 02:46:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157700851",
    "icon": "ifNA,",
    "orderNumber": "0301709064",
    "dynamicItems": {
      "num_cte_sol": "N000100711",
      "nro_doc_despacho": "200005023218",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM MARTINREA SILAO",
      "nro_pedido": "0301709064",
      "desc_cliente_consig": "MARTINREA DEVELOPMENTS DE MEXICO SA DE CV",
      "num_cte_consig": "N000120001",
      "desc_proveedor": "SETRAMEX TRANSPORTES SA DE CV",
      "fecha_doc": "2026-02-19 00:00:00.000",
      "cod_org_venta_key": "157700851",
      "NSHDocId": "200005023218",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154493",
    "pdfOk": "2026-02-21 19:17:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023389",
    "documentPackageId": "200005023389",
    "confirmed": "",
    "pdfFile": "NS200005023389.xls",
    "sentOk": "2026-02-21 19:17:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173492382",
    "icon": "ifNA,",
    "orderNumber": "0301726379",
    "dynamicItems": {
      "num_cte_sol": "N000100716",
      "nro_doc_despacho": "200005023389",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM SAN LUIS METAL FORMING",
      "nro_pedido": "0301726379",
      "desc_cliente_consig": "LAGERMEX SILAO SA DE CV",
      "num_cte_consig": "N000110606",
      "desc_proveedor": "LOGISTICA DE TRANSPORTE PJH",
      "fecha_doc": "2026-02-21 00:00:00.000",
      "cod_org_venta_key": "173492382",
      "NSHDocId": "200005023389",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154730",
    "pdfOk": "2026-02-20 22:38:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023334",
    "documentPackageId": "200005023334",
    "confirmed": "",
    "pdfFile": "NS200005023334.txt",
    "sentOk": "2026-02-20 22:38:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA",
    "orderNumber": "0301725313",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023334",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301725313",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-20 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023334",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1155660",
    "pdfOk": "2026-04-15 11:03:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026292",
    "documentPackageId": "200005026292",
    "confirmed": "",
    "pdfFile": "NS200005026292.txt",
    "sentOk": "2026-04-15 11:04:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173492382",
    "icon": "ifNA",
    "orderNumber": "0301760738",
    "dynamicItems": {
      "num_cte_sol": "N000100716",
      "nro_doc_despacho": "200005026292",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM SAN LUIS METAL FORMING",
      "nro_pedido": "0301760738",
      "desc_cliente_consig": "SAN LUIS METAL FORMING,  S.A. DE C.V.",
      "num_cte_consig": "N000110604",
      "desc_proveedor": "LOGISTICA DE TRANSPORTE PJH",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "173492382",
      "NSHDocId": "200005026292",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1155717",
    "pdfOk": "2026-04-15 20:21:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026313",
    "documentPackageId": "200005026313",
    "confirmed": "",
    "pdfFile": "NS200005026313.txt",
    "sentOk": "2026-04-15 20:22:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173492396",
    "icon": "ifNA,",
    "orderNumber": "0301745496",
    "dynamicItems": {
      "num_cte_sol": "N000100701",
      "nro_doc_despacho": "200005026313",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM ESTAMPADOS MAGNA",
      "nro_pedido": "0301745496",
      "desc_cliente_consig": "ESTAMPADOS MAGNA S.A. DE C.V.",
      "num_cte_consig": "N000110069",
      "desc_proveedor": "SERVICIOS URBANOS Y CONSTRUCCIONES",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "173492396",
      "NSHDocId": "200005026313",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154697",
    "pdfOk": "2026-02-20 21:57:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023327",
    "documentPackageId": "200005023327",
    "confirmed": "",
    "pdfFile": "NS200005023327.txt",
    "sentOk": "2026-02-20 21:59:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA",
    "orderNumber": "0301735587",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023327",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301735587",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "SETRAMEX TRANSPORTES SA DE CV",
      "fecha_doc": "2026-02-20 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023327",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1155716",
    "pdfOk": "2026-04-15 19:27:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026312",
    "documentPackageId": "200005026312",
    "confirmed": "",
    "pdfFile": "NS200005026312.txt",
    "sentOk": "2026-04-15 19:28:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA",
    "orderNumber": "0301758380",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005026312",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301758380",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005026312",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154586",
    "pdfOk": "2026-02-22 15:10:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023396",
    "documentPackageId": "200005023396",
    "confirmed": "",
    "pdfFile": "NS200005023396.txt",
    "sentOk": "2026-02-22 15:11:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157700851",
    "icon": "ifNA,",
    "orderNumber": "0301725669",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023396",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301725669",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "TRANSPORTADORA TRES GENERACIONES",
      "fecha_doc": "2026-02-22 00:00:00.000",
      "cod_org_venta_key": "157700851",
      "NSHDocId": "200005023396",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154717",
    "pdfOk": "2026-02-20 22:21:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023329",
    "documentPackageId": "200005023329",
    "confirmed": "",
    "pdfFile": "NS200005023329.txt",
    "sentOk": "2026-02-20 22:22:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA",
    "orderNumber": "0301725678",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023329",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301725678",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-20 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023329",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1155030",
    "pdfOk": "2026-02-19 23:51:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023262",
    "documentPackageId": "200005023262",
    "confirmed": "",
    "pdfFile": "NS200005023262.txt",
    "sentOk": "",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA,",
    "orderNumber": "0301725248",
    "dynamicItems": {
      "num_cte_sol": "6800000026",
      "nro_doc_despacho": "200005023262",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301725248",
      "desc_cliente_consig": "ADIENT MX AUTOMOTRIZ S DE RL DE CV",
      "num_cte_consig": "4800000876",
      "desc_proveedor": "Martha Patricia Galvan Guevara",
      "fecha_doc": "2026-02-19 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023262",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1155066",
    "pdfOk": "2026-02-21 07:21:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023365",
    "documentPackageId": "200005023365",
    "confirmed": "",
    "pdfFile": "NS200005023365.txt",
    "sentOk": "2026-02-21 07:22:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173491950",
    "icon": "ifNA",
    "orderNumber": "0301725666",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023365",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301725666",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "MIGUEL WONG CRUZ",
      "fecha_doc": "2026-02-21 00:00:00.000",
      "cod_org_venta_key": "173491950",
      "NSHDocId": "200005023365",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154937",
    "pdfOk": "2026-02-19 18:49:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023252",
    "documentPackageId": "200005023252",
    "confirmed": "",
    "pdfFile": "NS200005023252.txt",
    "sentOk": "2026-02-19 18:50:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA",
    "orderNumber": "0301725358",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023252",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301725358",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-19 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023252",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154830",
    "pdfOk": "2026-02-18 13:13:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023173",
    "documentPackageId": "200005023173",
    "confirmed": "",
    "pdfFile": "NS200005023173.txt",
    "sentOk": "2026-02-18 13:15:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301736811",
    "dynamicItems": {
      "num_cte_sol": "N000100701",
      "nro_doc_despacho": "200005023173",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM ESTAMPADOS MAGNA",
      "nro_pedido": "0301736811",
      "desc_cliente_consig": "ESTAMPADOS MAGNA SA DE CV",
      "num_cte_consig": "N000110069",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023173",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154590",
    "pdfOk": "2026-02-19 00:55:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023212",
    "documentPackageId": "200005023212",
    "confirmed": "",
    "pdfFile": "NS200005023212.txt",
    "sentOk": "2026-02-19 00:55:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA",
    "orderNumber": "0301735683",
    "dynamicItems": {
      "num_cte_sol": "N000100716",
      "nro_doc_despacho": "200005023212",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM SAN LUIS METAL FORMING",
      "nro_pedido": "0301735683",
      "desc_cliente_consig": "SAN LUIS METAL FORMING,  S.A. DE C.V.",
      "num_cte_consig": "N000110604",
      "desc_proveedor": "AUTO TRANSPORTES MODERNOS SA DE CV",
      "fecha_doc": "2026-02-19 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023212",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1155052",
    "pdfOk": "2026-02-18 03:41:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023147",
    "documentPackageId": "200005023147",
    "confirmed": "",
    "pdfFile": "NS200005023147.txt",
    "sentOk": "2026-02-18 03:42:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173492382",
    "icon": "ifNA",
    "orderNumber": "0301726511",
    "dynamicItems": {
      "num_cte_sol": "N000100716",
      "nro_doc_despacho": "200005023147",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM SAN LUIS METAL FORMING",
      "nro_pedido": "0301726511",
      "desc_cliente_consig": "SAN LUIS METAL FORMING,  S.A. DE C.V.",
      "num_cte_consig": "N000110604",
      "desc_proveedor": "AUTO EXPRESS DIA SA DE CV",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "173492382",
      "NSHDocId": "200005023147",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154814",
    "pdfOk": "2026-02-18 15:28:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023182",
    "documentPackageId": "200005023182",
    "confirmed": "",
    "pdfFile": "NS200005023182.txt",
    "sentOk": "2026-02-18 15:29:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173492382",
    "icon": "ifNA,",
    "orderNumber": "0301724902",
    "dynamicItems": {
      "num_cte_sol": "N000100702",
      "nro_doc_despacho": "200005023182",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM FLEX N GATE",
      "nro_pedido": "0301724902",
      "desc_cliente_consig": "MISA NATIONAL PROCESSING SA DE CV",
      "num_cte_consig": "N000121691",
      "desc_proveedor": "TRANSPORTES MONTERROSA SA de CV",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "173492382",
      "NSHDocId": "200005023182",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154468",
    "pdfOk": "2026-02-18 11:03:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023169",
    "documentPackageId": "200005023169",
    "confirmed": "",
    "pdfFile": "NS200005023169.txt",
    "sentOk": "2026-02-18 11:04:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301724769",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023169",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301724769",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023169",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1155601",
    "pdfOk": "2026-04-15 00:51:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026269",
    "documentPackageId": "200005026269",
    "confirmed": "",
    "pdfFile": "NS200005026269.txt",
    "sentOk": "2026-04-15 00:52:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA",
    "orderNumber": "0301758352",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005026269",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301758352",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005026269",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154797",
    "pdfOk": "2026-02-18 03:32:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023146",
    "documentPackageId": "200005023146",
    "confirmed": "",
    "pdfFile": "NS200005023146.txt",
    "sentOk": "2026-02-18 03:34:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301724747",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023146",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301724747",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023146",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1155635",
    "pdfOk": "2026-04-15 09:27:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026284",
    "documentPackageId": "200005026284",
    "confirmed": "",
    "pdfFile": "NS200005026284.txt",
    "sentOk": "2026-04-15 09:28:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301758300",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005026284",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301758300",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005026284",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1155708",
    "pdfOk": "2026-04-15 17:39:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026310",
    "documentPackageId": "200005026310",
    "confirmed": "",
    "pdfFile": "NS200005026310.txt",
    "sentOk": "2026-04-15 17:40:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301741799",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005026310",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301741799",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005026310",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1155708",
    "pdfOk": "2026-04-15 17:39:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026310",
    "documentPackageId": "200005026310",
    "confirmed": "",
    "pdfFile": "NS200005026310.txt",
    "sentOk": "2026-04-15 17:40:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA",
    "orderNumber": "0301758269",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005026310",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301758269",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005026310",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154547",
    "pdfOk": "2026-02-19 17:49:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023248",
    "documentPackageId": "200005023248",
    "confirmed": "",
    "pdfFile": "NS200005023248.txt",
    "sentOk": "2026-02-19 17:50:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA",
    "orderNumber": "0301725530",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023248",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301725530",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-19 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023248",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154623",
    "pdfOk": "2026-02-18 15:02:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023181",
    "documentPackageId": "200005023181",
    "confirmed": "",
    "pdfFile": "NS200005023181.txt",
    "sentOk": "2026-02-18 15:02:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA",
    "orderNumber": "0301725655",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023181",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301725655",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023181",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1155030",
    "pdfOk": "2026-02-19 23:51:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023262",
    "documentPackageId": "200005023262",
    "confirmed": "",
    "pdfFile": "NS200005023262.txt",
    "sentOk": "",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA,",
    "orderNumber": "0301725223",
    "dynamicItems": {
      "num_cte_sol": "6800000026",
      "nro_doc_despacho": "200005023262",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301725223",
      "desc_cliente_consig": "ADIENT MX AUTOMOTRIZ S DE RL DE CV",
      "num_cte_consig": "4800000876",
      "desc_proveedor": "Martha Patricia Galvan Guevara",
      "fecha_doc": "2026-02-19 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023262",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154812",
    "pdfOk": "2026-02-18 23:07:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023207",
    "documentPackageId": "200005023207",
    "confirmed": "",
    "pdfFile": "NS200005023207.txt",
    "sentOk": "2026-02-18 23:08:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173492382",
    "icon": "ifNA",
    "orderNumber": "0301726611",
    "dynamicItems": {
      "num_cte_sol": "N000100716",
      "nro_doc_despacho": "200005023207",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM SAN LUIS METAL FORMING",
      "nro_pedido": "0301726611",
      "desc_cliente_consig": "SAN LUIS METAL FORMING,  S.A. DE C.V.",
      "num_cte_consig": "N000110604",
      "desc_proveedor": "AUTO EXPRESS DIA SA DE CV",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "173492382",
      "NSHDocId": "200005023207",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad Imposible generar SN, no existe el pedido para este cliente Invalid column name 'NSDTFColada'. Ambiguous column name 'TFColada'.    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCac",
    "documentId": "1155745",
    "pdfOk": "2026-04-15 15:05:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026306",
    "documentPackageId": "200005026306",
    "confirmed": "",
    "pdfFile": "NS200005026306.txt",
    "sentOk": "2026-04-15 15:06:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173491950",
    "icon": "ifNA,",
    "orderNumber": "0301758256",
    "dynamicItems": {
      "num_cte_sol": "N000100720",
      "nro_doc_despacho": "200005026306",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM KIRCHHOFF",
      "nro_pedido": "0301758256",
      "desc_cliente_consig": "KIRCHHOFF AUTOMOTIVE MEXICO SA DE C V",
      "num_cte_consig": "N000121705",
      "desc_proveedor": "PHES TRANSPORTES SA DE CV",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "173491950",
      "NSHDocId": "200005026306",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154758",
    "pdfOk": "2026-02-19 13:54:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023230",
    "documentPackageId": "200005023230",
    "confirmed": "",
    "pdfFile": "NS200005023230.txt",
    "sentOk": "2026-02-19 13:55:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA,",
    "orderNumber": "0301715663",
    "dynamicItems": {
      "num_cte_sol": "N000100701",
      "nro_doc_despacho": "200005023230",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM ESTAMPADOS MAGNA",
      "nro_pedido": "0301715663",
      "desc_cliente_consig": "ESTAMPADOS MAGNA S.A. DE C.V.",
      "num_cte_consig": "N000110069",
      "desc_proveedor": "TRANSCARGA DEL NORTE S.A. DE C.V.",
      "fecha_doc": "2026-02-19 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023230",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154912",
    "pdfOk": "2026-02-20 13:43:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023295",
    "documentPackageId": "200005023295",
    "confirmed": "",
    "pdfFile": "NS200005023295.txt",
    "sentOk": "2026-02-20 13:44:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA,",
    "orderNumber": "0301725282",
    "dynamicItems": {
      "num_cte_sol": "N000100709",
      "nro_doc_despacho": "200005023295",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM LEAR",
      "nro_pedido": "0301725282",
      "desc_cliente_consig": "GILL QUERETARO S DE RL DE CV .",
      "num_cte_consig": "N000127162",
      "desc_proveedor": "TEM LOGISTICA SA DE CV",
      "fecha_doc": "2026-02-20 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023295",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154647",
    "pdfOk": "2026-02-18 09:33:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023164",
    "documentPackageId": "200005023164",
    "confirmed": "",
    "pdfFile": "NS200005023164.txt",
    "sentOk": "2026-02-18 09:35:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA",
    "orderNumber": "0301725123",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023164",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301725123",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023164",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154493",
    "pdfOk": "2026-02-21 19:17:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023389",
    "documentPackageId": "200005023389",
    "confirmed": "",
    "pdfFile": "NS200005023389.xls",
    "sentOk": "2026-02-21 19:17:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173492382",
    "icon": "ifNA",
    "orderNumber": "0301710304",
    "dynamicItems": {
      "num_cte_sol": "N000100716",
      "nro_doc_despacho": "200005023389",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM SAN LUIS METAL FORMING",
      "nro_pedido": "0301710304",
      "desc_cliente_consig": "LAGERMEX SILAO, S.A. DE C.V.",
      "num_cte_consig": "N000110606",
      "desc_proveedor": "LOGISTICA DE TRANSPORTE PJH",
      "fecha_doc": "2026-02-21 00:00:00.000",
      "cod_org_venta_key": "173492382",
      "NSHDocId": "200005023389",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "",
    "documentId": "1155406",
    "pdfOk": "2026-04-09 15:11:00.000",
    "invoiceClass": "",
    "documentNumber": "200005025410",
    "documentPackageId": "200005025410",
    "confirmed": "",
    "pdfFile": "NS200005025410.txt",
    "sentOk": "2026-04-09 15:14:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA,,,,,,,,,,,,,,,,",
    "orderNumber": "0301740553",
    "dynamicItems": {
      "num_cte_sol": "6800000109",
      "nro_doc_despacho": "200005025410",
      "num_proveedor": "",
      "desc_cliente_sol": "FORD MOTOR COMPANY",
      "nro_pedido": "0301740553",
      "desc_cliente_consig": "NASG",
      "num_cte_consig": "N000127181",
      "desc_proveedor": "AUTO TRANSPORTES MODERNOS SA DE CV",
      "fecha_doc": "2026-03-30 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005025410",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1155612",
    "pdfOk": "2026-04-15 02:53:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026273",
    "documentPackageId": "200005026273",
    "confirmed": "",
    "pdfFile": "NS200005026273.txt",
    "sentOk": "2026-04-15 02:54:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA,",
    "orderNumber": "0301765358",
    "dynamicItems": {
      "num_cte_sol": "N000100710",
      "nro_doc_despacho": "200005026273",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM MARTINREA RAMOS ARIZPE",
      "nro_pedido": "0301765358",
      "desc_cliente_consig": "ESTAMPADOS MARTINREA",
      "num_cte_consig": "N000110067",
      "desc_proveedor": "GRUPO TRANSPORTISTA Y LOGISTICO",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005026273",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154679",
    "pdfOk": "2026-02-21 22:45:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023391",
    "documentPackageId": "200005023391",
    "confirmed": "",
    "pdfFile": "NS200005023391.txt",
    "sentOk": "2026-02-21 22:46:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157700851",
    "icon": "ifNA,",
    "orderNumber": "0301737336",
    "dynamicItems": {
      "num_cte_sol": "N000100757",
      "nro_doc_despacho": "200005023391",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV",
      "nro_pedido": "0301737336",
      "desc_cliente_consig": "F&P MFG DE MEXICO SA DE C",
      "num_cte_consig": "N000123834",
      "desc_proveedor": "SETRAMEX TRANSPORTES SA DE CV",
      "fecha_doc": "2026-02-21 00:00:00.000",
      "cod_org_venta_key": "157700851",
      "NSHDocId": "200005023391",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154694",
    "pdfOk": "2026-02-20 10:25:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023284",
    "documentPackageId": "200005023284",
    "confirmed": "",
    "pdfFile": "NS200005023284.txt",
    "sentOk": "2026-02-20 10:26:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173492396",
    "icon": "ifNA,",
    "orderNumber": "0301725777",
    "dynamicItems": {
      "num_cte_sol": "N000100711",
      "nro_doc_despacho": "200005023284",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM MARTINREA SILAO",
      "nro_pedido": "0301725777",
      "desc_cliente_consig": "MARTINREA DEVELOPMENTS DE MEXICO SA DE CV",
      "num_cte_consig": "N000120001",
      "desc_proveedor": "SETRAMEX TRANSPORTES SA DE CV",
      "fecha_doc": "2026-02-20 00:00:00.000",
      "cod_org_venta_key": "173492396",
      "NSHDocId": "200005023284",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154553",
    "pdfOk": "2026-02-19 18:12:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023251",
    "documentPackageId": "200005023251",
    "confirmed": "",
    "pdfFile": "NS200005023251.txt",
    "sentOk": "2026-02-19 18:13:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "173491950",
    "icon": "ifNA",
    "orderNumber": "0301737315",
    "dynamicItems": {
      "num_cte_sol": "N000100716",
      "nro_doc_despacho": "200005023251",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM SAN LUIS METAL FORMING",
      "nro_pedido": "0301737315",
      "desc_cliente_consig": "SAN LUIS METAL FORMING,  S.A. DE C.V.",
      "num_cte_consig": "N000110604",
      "desc_proveedor": "CEM LOGISTIC Y CARRIERS SA DE CV",
      "fecha_doc": "2026-02-19 00:00:00.000",
      "cod_org_venta_key": "173491950",
      "NSHDocId": "200005023251",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154609",
    "pdfOk": "2026-02-19 17:43:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023247",
    "documentPackageId": "200005023247",
    "confirmed": "",
    "pdfFile": "NS200005023247.txt",
    "sentOk": "2026-02-19 17:48:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301724547",
    "dynamicItems": {
      "num_cte_sol": "N000100701",
      "nro_doc_despacho": "200005023247",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM ESTAMPADOS MAGNA",
      "nro_pedido": "0301724547",
      "desc_cliente_consig": "ESTAMPADOS MAGNA S.A. DE C.V.",
      "num_cte_consig": "N000110069",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-19 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023247",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "",
    "documentId": "1155171",
    "pdfOk": "2026-05-20 09:06:00.000",
    "invoiceClass": "",
    "documentNumber": "000004992134",
    "documentPackageId": "000004992134",
    "confirmed": "",
    "pdfFile": "NS000004992134.txt",
    "sentOk": "2026-05-20 09:12:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157700851",
    "icon": "ifNA,,,,,,,,,,,,,,,,",
    "orderNumber": "0301721634",
    "dynamicItems": {
      "num_cte_sol": "H000269318",
      "nro_doc_despacho": "000004992134",
      "num_proveedor": "",
      "desc_cliente_sol": "VENTURE STEEL DE MEXICO",
      "nro_pedido": "0301721634",
      "desc_cliente_consig": "VENTURE STEEL DE MEXICO",
      "num_cte_consig": "H000269318",
      "desc_proveedor": "SERVIEXPRESS JC",
      "fecha_doc": "2026-03-05 00:00:00.000",
      "cod_org_venta_key": "157700851",
      "NSHDocId": "000004992134",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1155738",
    "pdfOk": "2026-04-15 22:39:00.000",
    "invoiceClass": "",
    "documentNumber": "200005026317",
    "documentPackageId": "200005026317",
    "confirmed": "",
    "pdfFile": "NS200005026317.txt",
    "sentOk": "2026-04-15 22:41:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA,",
    "orderNumber": "0301758584",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005026317",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301758584",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "HERNANDO ROMO GARZA",
      "fecha_doc": "2026-04-15 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005026317",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154718",
    "pdfOk": "2026-02-20 22:21:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023330",
    "documentPackageId": "200005023330",
    "confirmed": "",
    "pdfFile": "NS200005023330.txt",
    "sentOk": "2026-02-20 22:22:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301725677",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023330",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO",
      "nro_pedido": "0301725677",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-20 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023330",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1155034",
    "pdfOk": "2026-02-20 00:35:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023263",
    "documentPackageId": "200005023263",
    "confirmed": "",
    "pdfFile": "NS200005023263.xls",
    "sentOk": "2026-02-20 00:36:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA",
    "orderNumber": "0301724957",
    "dynamicItems": {
      "num_cte_sol": "N000100707",
      "nro_doc_despacho": "200005023263",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM INMETMATIC",
      "nro_pedido": "0301724957",
      "desc_cliente_consig": "INMETMATIC, S.A. DE C.V.",
      "num_cte_consig": "N000110219",
      "desc_proveedor": "AUTO TRANSPORTES MODERNOS SA DE CV",
      "fecha_doc": "2026-02-20 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023263",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154692",
    "pdfOk": "2026-02-22 20:59:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023403",
    "documentPackageId": "200005023403",
    "confirmed": "",
    "pdfFile": "NS200005023403.txt",
    "sentOk": "2026-02-22 21:02:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA",
    "orderNumber": "0301725279",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023403",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301725279",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "RAMIRO MONTEMAYOR GONZALEZ",
      "fecha_doc": "2026-02-22 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023403",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154671",
    "pdfOk": "2026-02-21 02:40:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023355",
    "documentPackageId": "200005023355",
    "confirmed": "",
    "pdfFile": "NS200005023355.txt",
    "sentOk": "2026-02-21 02:41:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA",
    "orderNumber": "0301737567",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023355",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301737567",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "HERNANDO ROMO GARZA",
      "fecha_doc": "2026-02-21 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023355",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154698",
    "pdfOk": "2026-02-20 21:58:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023328",
    "documentPackageId": "200005023328",
    "confirmed": "",
    "pdfFile": "NS200005023328.txt",
    "sentOk": "2026-02-20 21:59:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA",
    "orderNumber": "0301737362",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023328",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301737362",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "SETRAMEX TRANSPORTES SA DE CV",
      "fecha_doc": "2026-02-20 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023328",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "",
    "documentId": "1155366",
    "pdfOk": "2026-03-26 10:11:00.000",
    "invoiceClass": "",
    "documentNumber": "200005025168",
    "documentPackageId": "200005025168",
    "confirmed": "",
    "pdfFile": "NS200005025168.txt",
    "sentOk": "2026-03-26 10:14:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA,,,,,,,,,,,,,,,,",
    "orderNumber": "0301719963",
    "dynamicItems": {
      "num_cte_sol": "6800000110",
      "nro_doc_despacho": "200005025168",
      "num_proveedor": "",
      "desc_cliente_sol": "FORD MOTOR COMPANY",
      "nro_pedido": "0301719963",
      "desc_cliente_consig": "PWO MEXICO",
      "num_cte_consig": "4800001587",
      "desc_proveedor": "SETRAMEX TRANSPORTES SA DE CV",
      "fecha_doc": "2026-03-26 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005025168",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): No hay XML de Calidad    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavi",
    "documentId": "1154594",
    "pdfOk": "2026-02-18 23:55:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023209",
    "documentPackageId": "200005023209",
    "confirmed": "",
    "pdfFile": "NS200005023209.txt",
    "sentOk": "2026-02-18 23:56:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157702086",
    "icon": "ifNA,",
    "orderNumber": "0301719619",
    "dynamicItems": {
      "num_cte_sol": "N000100710",
      "nro_doc_despacho": "200005023209",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM MARTINREA RAMOS ARIZPE",
      "nro_pedido": "0301719619",
      "desc_cliente_consig": "ESTAMPADOS MARTINREA",
      "num_cte_consig": "N000110067",
      "desc_proveedor": "3 CG GROUP S DE RL DE CV",
      "fecha_doc": "2026-02-18 00:00:00.000",
      "cod_org_venta_key": "157702086",
      "NSHDocId": "200005023209",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154986",
    "pdfOk": "2026-02-22 18:37:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023402",
    "documentPackageId": "200005023402",
    "confirmed": "",
    "pdfFile": "NS200005023402.txt",
    "sentOk": "2026-02-22 18:38:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA,",
    "orderNumber": "0301724862",
    "dynamicItems": {
      "num_cte_sol": "N000100702",
      "nro_doc_despacho": "200005023402",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO S DE RL CV GM FLEX N GATE",
      "nro_pedido": "0301724862",
      "desc_cliente_consig": "ARCELORMITTAL TUBULAR PRODUCTS",
      "num_cte_consig": "4800002483",
      "desc_proveedor": "SERVIEXPRESS JC",
      "fecha_doc": "2026-02-22 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023402",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "System.Data.SqlClient.SqlException (0x80131904): Imposible generar SN, el cliente no esta configurado    at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action`1 wrapCloseInAction)    at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)    at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)    at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()    at System.Data.SqlClient.SqlDataReader.get_MetaData()    at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)    at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmd",
    "documentId": "1154771",
    "pdfOk": "2026-02-21 02:40:00.000",
    "invoiceClass": "",
    "documentNumber": "200005023354",
    "documentPackageId": "200005023354",
    "confirmed": "",
    "pdfFile": "NS200005023354.txt",
    "sentOk": "2026-02-21 02:41:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA",
    "orderNumber": "0301709824",
    "dynamicItems": {
      "num_cte_sol": "H000850000",
      "nro_doc_despacho": "200005023354",
      "num_proveedor": "",
      "desc_cliente_sol": "GENERAL MOTORS DE MEXICO, S. de R.L  DE C.V.",
      "nro_pedido": "0301709824",
      "desc_cliente_consig": "VITTI LOGISTICS S DE R L DE C V",
      "num_cte_consig": "4800001728",
      "desc_proveedor": "HERNANDO ROMO GARZA",
      "fecha_doc": "2026-02-21 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005023354",
      "NSHSociedad": "TM01"
    }
  },
  {
    "documentType": "NS",
    "errorMessage": "",
    "documentId": "1155366",
    "pdfOk": "2026-03-26 10:11:00.000",
    "invoiceClass": "",
    "documentNumber": "200005025168",
    "documentPackageId": "200005025168",
    "confirmed": "",
    "pdfFile": "NS200005025168.txt",
    "sentOk": "2026-03-26 10:14:00.000",
    "printedOk": "",
    "packagedOk": "",
    "salesOrganization": "157701767",
    "icon": "ifNA,,,,,,,,,,,,,,,,",
    "orderNumber": "0301753618",
    "dynamicItems": {
      "num_cte_sol": "6800000110",
      "nro_doc_despacho": "200005025168",
      "num_proveedor": "",
      "desc_cliente_sol": "FORD MOTOR COMPANY",
      "nro_pedido": "0301753618",
      "desc_cliente_consig": "PWO MEXICO",
      "num_cte_consig": "4800001587",
      "desc_proveedor": "SETRAMEX TRANSPORTES SA DE CV",
      "fecha_doc": "2026-03-26 00:00:00.000",
      "cod_org_venta_key": "157701767",
      "NSHDocId": "200005025168",
      "NSHSociedad": "TM01"
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 🔹 ACO — Carta País Origen (CO)
  // Campo identificador: nro_remision (según DocumetosBussines.cs líneas 489-491)
  // ─────────────────────────────────────────────────────────────
  {
    documentType: 'CO',
    errorMessage: '',
    documentId: '1001234',
    pdfOk: '2026-01-15 10:00:00.000',
    invoiceClass: '',
    documentNumber: '4900001234',
    documentPackageId: '',
    confirmed: 'Si',
    pdfFile: 'CO4900001234.pdf',
    sentOk: '2026-01-15 11:00:00.000',
    printedOk: '',
    packagedOk: '',
    salesOrganization: 'TM01',
    icon: 'ifOK',
    orderNumber: '4900001234',
    dynamicItems: {
      nro_remision: '4900001234',
      fecha_doc: '2026-01-15 00:00:00.000',
      desc_cliente: 'ACEROS DEL NORTE SA DE CV',
      num_cte_sol: 'H010001234',
      sociedad: 'TM01'
    }
  },
  {
    documentType: 'CO',
    errorMessage: '',
    documentId: '1001235',
    pdfOk: '',
    invoiceClass: '',
    documentNumber: '4900001235',
    documentPackageId: '',
    confirmed: 'Si',
    pdfFile: '',
    sentOk: '',
    printedOk: '',
    packagedOk: '',
    salesOrganization: 'TM01',
    icon: 'ifNA',
    orderNumber: '4900001235',
    dynamicItems: {
      nro_remision: '4900001235',
      fecha_doc: '2026-01-20 00:00:00.000',
      desc_cliente: 'DISTRIBUIDORA METALURGICA SA',
      num_cte_sol: 'H010001235',
      sociedad: 'TM01'
    }
  },
  {
    documentType: 'CO',
    errorMessage: '',
    documentId: '1001236',
    pdfOk: '2026-02-01 08:45:00.000',
    invoiceClass: '',
    documentNumber: '4900001236',
    documentPackageId: '',
    confirmed: 'Si',
    pdfFile: 'CO4900001236.pdf',
    sentOk: '',
    printedOk: '',
    packagedOk: '',
    salesOrganization: 'TM01',
    icon: 'ifOK',
    orderNumber: '4900001236',
    dynamicItems: {
      nro_remision: '4900001236',
      fecha_doc: '2026-02-01 00:00:00.000',
      desc_cliente: 'TUBACERO SA DE CV',
      num_cte_sol: 'H000146400',
      sociedad: 'TM01'
    }
  },
  {
    documentType: 'CO',
    errorMessage: '',
    documentId: '1001237',
    pdfOk: '2026-02-10 14:00:00.000',
    invoiceClass: '',
    documentNumber: '4900001237',
    documentPackageId: '',
    confirmed: 'Si',
    pdfFile: 'CO4900001237.pdf',
    sentOk: '2026-02-10 15:30:00.000',
    printedOk: '',
    packagedOk: '',
    salesOrganization: 'TM01',
    icon: 'ifOK',
    orderNumber: '4900001237',
    dynamicItems: {
      nro_remision: '4900001237',
      fecha_doc: '2026-02-10 00:00:00.000',
      desc_cliente: 'NATIONAL MATERIAL OF MEXICO S DE RL',
      num_cte_sol: 'H010505607',
      sociedad: 'TM01'
    }
  },
  {
    documentType: 'CO',
    errorMessage: '',
    documentId: '1001238',
    pdfOk: '',
    invoiceClass: '',
    documentNumber: '4900001238',
    documentPackageId: '',
    confirmed: 'Si',
    pdfFile: '',
    sentOk: '',
    printedOk: '',
    packagedOk: '',
    salesOrganization: 'TM01',
    icon: 'ifNA',
    orderNumber: '4900001238',
    dynamicItems: {
      nro_remision: '4900001238',
      fecha_doc: '2026-02-15 00:00:00.000',
      desc_cliente: 'MIDWEST MFG - VALLEY',
      num_cte_sol: 'E000781019',
      sociedad: 'TM01'
    }
  },
  {
    documentType: 'CO',
    errorMessage: '',
    documentId: '1001239',
    pdfOk: '2026-02-20 09:00:00.000',
    invoiceClass: '',
    documentNumber: '4900001239',
    documentPackageId: '',
    confirmed: 'Si',
    pdfFile: 'CO4900001239.pdf',
    sentOk: '',
    printedOk: '',
    packagedOk: '',
    salesOrganization: 'TM01',
    icon: 'ifOK',
    orderNumber: '4900001239',
    dynamicItems: {
      nro_remision: '4900001239',
      fecha_doc: '2026-02-20 00:00:00.000',
      desc_cliente: 'ALMACEN VIEZCA ALTO DE NORIA',
      num_cte_sol: 'H010504365',
      sociedad: 'TM01'
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 🔹 ACO — Carta País Origen Colada (COC)
  // Campo identificador: nro_remision (igual que CO)
  // COC incluye campo adicional 'colada' en dynamicItems
  // ─────────────────────────────────────────────────────────────
  {
    documentType: 'COC',
    errorMessage: '',
    documentId: '2001234',
    pdfOk: '2026-02-10 09:30:00.000',
    invoiceClass: '',
    documentNumber: '4900002234',
    documentPackageId: '',
    confirmed: 'Si',
    pdfFile: 'COC4900002234.pdf',
    sentOk: '',
    printedOk: '',
    packagedOk: '',
    salesOrganization: 'TM01',
    icon: 'ifOK',
    orderNumber: '4900002234',
    dynamicItems: {
      nro_remision: '4900002234',
      fecha_doc: '2026-02-10 00:00:00.000',
      desc_cliente: 'TUBACERO SA DE CV',
      num_cte_sol: 'H010002234',
      colada: 'C-2026-0012'
    }
  },
  {
    documentType: 'COC',
    errorMessage: '',
    documentId: '2001235',
    pdfOk: '',
    invoiceClass: '',
    documentNumber: '4900002235',
    documentPackageId: '',
    confirmed: 'Si',
    pdfFile: '',
    sentOk: '',
    printedOk: '',
    packagedOk: '',
    salesOrganization: 'TM01',
    icon: 'ifNA',
    orderNumber: '4900002235',
    dynamicItems: {
      nro_remision: '4900002235',
      fecha_doc: '2026-02-18 00:00:00.000',
      desc_cliente: 'ACEROS DEL NORTE SA DE CV',
      num_cte_sol: 'H010001234',
      colada: 'C-2026-0015'
    }
  },
  {
    documentType: 'COC',
    errorMessage: '',
    documentId: '2001236',
    pdfOk: '2026-03-01 11:00:00.000',
    invoiceClass: '',
    documentNumber: '4900002236',
    documentPackageId: '',
    confirmed: 'Si',
    pdfFile: 'COC4900002236.pdf',
    sentOk: '2026-03-01 12:00:00.000',
    printedOk: '',
    packagedOk: '',
    salesOrganization: 'TM01',
    icon: 'ifOK',
    orderNumber: '4900002236',
    dynamicItems: {
      nro_remision: '4900002236',
      fecha_doc: '2026-03-01 00:00:00.000',
      desc_cliente: 'NATIONAL MATERIAL OF MEXICO S DE RL',
      num_cte_sol: 'H010505607',
      colada: 'C-2026-0021'
    }
  },
  {
    documentType: 'COC',
    errorMessage: '',
    documentId: '2001237',
    pdfOk: '2026-03-05 08:00:00.000',
    invoiceClass: '',
    documentNumber: '4900002237',
    documentPackageId: '',
    confirmed: 'Si',
    pdfFile: 'COC4900002237.pdf',
    sentOk: '',
    printedOk: '',
    packagedOk: '',
    salesOrganization: 'TM01',
    icon: 'ifOK',
    orderNumber: '4900002237',
    dynamicItems: {
      nro_remision: '4900002237',
      fecha_doc: '2026-03-05 00:00:00.000',
      desc_cliente: 'DISTRIBUIDORA METALURGICA SA',
      num_cte_sol: 'H010001235',
      colada: 'C-2026-0028'
    }
  },
  {
    documentType: 'COC',
    errorMessage: '',
    documentId: '2001238',
    pdfOk: '',
    invoiceClass: '',
    documentNumber: '4900002238',
    documentPackageId: '',
    confirmed: 'Si',
    pdfFile: '',
    sentOk: '',
    printedOk: '',
    packagedOk: '',
    salesOrganization: 'TM01',
    icon: 'ifNA',
    orderNumber: '4900002238',
    dynamicItems: {
      nro_remision: '4900002238',
      fecha_doc: '2026-03-10 00:00:00.000',
      desc_cliente: 'MIDWEST MFG - VALLEY',
      num_cte_sol: 'E000781019',
      colada: 'C-2026-0030'
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

  // 🔹 paginación
  const start = request.start ?? 0;
  const length = request.length ?? data.length;
  const paginatedData = data.slice(start, start + length);

  return {
    recordsFiltered: data.length,
    data: paginatedData
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

// async openDocumentXml(request: DocumentFileRequest): Promise<void> {
//   const xmlDocumentType = this.getXmlDocumentType(request.documentType);

//   console.log('📄 openDocumentXml - request original:', request);
//   console.log('📄 openDocumentXml - xmlDocumentType:', xmlDocumentType);
//   console.log('📄 environment.production:', environment.production);

//   if (!environment.production) {
//     console.log('🧪 MODO MOCK XML');

//     const blob = this.getMockXml(request);

//     console.log('📦 Mock blob generado:', blob);
//     console.log('📦 Mock blob size:', blob.size);
//     console.log('📦 Mock blob type:', blob.type);

//     this.openBlob(blob, `${xmlDocumentType}${request.documentNumber}.xml`);
//     return;
//   }

//   const params = this.toHttpParams({
//     documentType: xmlDocumentType,
//     documentNumber: request.documentNumber,
//     userId: request.userId ?? '',
//     documentId: request.documentId ?? '',
//     invoiceClass: request.invoiceClass ?? ''
//   });

//   console.log('🌐 XML params:', {
//     documentType: xmlDocumentType,
//     documentNumber: request.documentNumber,
//     userId: request.userId ?? '',
//     documentId: request.documentId ?? '',
//     invoiceClass: request.invoiceClass ?? ''
//   });

//   const url = this.buildUrl('api/documentos/archivo');

//   console.log('🌐 XML URL:', url);

//   try {
//     const response = await firstValueFrom(
//       this.http.get(url, {
//         params,
//         observe: 'response',
//         responseType: 'blob'
//       })
//     );

//     console.log('✅ XML response completa:', response);
//     console.log('✅ XML status:', response.status);
//     console.log('✅ XML headers:', response.headers);
//     console.log('✅ XML body:', response.body);

//     const blob = response.body ?? new Blob([], { type: 'text/xml' });

//     console.log('📦 XML blob final:', blob);
//     console.log('📦 XML blob size:', blob.size);
//     console.log('📦 XML blob type:', blob.type);

//     if (blob.size === 0) {
//       console.warn('⚠️ El blob XML viene vacío');
//     }

//     this.openBlob(blob, `${xmlDocumentType}${request.documentNumber}.xml`);

//     console.log('🚀 XML abierto correctamente');
//   } catch (error) {
//     console.error('❌ Error al abrir XML:', error);
//     throw error;
//   }
// }

async openDocumentFile(
  request: DocumentFileRequest,
  options?: {
    fileKind?: 'pdf' | 'xml' | 'txt' | 'excel' | 'zip' | 'csv' | 'auto';
    forceDocumentType?: string;
    fileName?: string;
  }
): Promise<void> {
  const fileKind = options?.fileKind ?? 'auto';

  const documentType =
    options?.forceDocumentType ??
    request.documentType;

  const extension = this.resolveExtension(fileKind, options?.fileName);

  const fileName =
    options?.fileName ??
    `${documentType}${request.documentNumber}${extension}`;

  console.log('📄 openDocumentFile - request:', request);
  console.log('📄 fileKind:', fileKind);
  console.log('📄 documentType final:', documentType);
  console.log('📄 fileName final:', fileName);

  if (!documentType) {
    throw new Error('Tipo de documento vacío o no soportado.');
  }

  if (!environment.production) {
    const blob = this.getMockFile(request, fileKind, fileName);
    this.openBlob(blob, fileName);
    return;
  }

  const params = this.toHttpParams({
  documentType,
  documentNumber: request.documentNumber,
  userId: request.userId ?? '',
  documentId: request.documentId ?? '',
  invoiceClass: request.invoiceClass ?? ''
});

console.log('📦 Params RAW:', {
  documentType,
  documentNumber: request.documentNumber,
  userId: request.userId ?? '',
  documentId: request.documentId ?? '',
  invoiceClass: request.invoiceClass ?? ''
});

console.log('📦 HttpParams:', params.toString());

const url = this.buildUrl('api/documentos/archivo');

console.log('🌐 URL base:', url);

console.log('🌐 URL completa:',
  `${url}?${params.toString()}`
);

console.log('📄 fileKind:', fileKind);
console.log('📄 fileName:', fileName);
console.log('📄 mime esperado:',
  this.resolveMimeType(fileKind, fileName)
);

try {

  console.log('🚀 Ejecutando GET archivo...');

  const response = await firstValueFrom(
    this.http.get(url, {
      params,
      observe: 'response',
      responseType: 'blob'
    })
  );

  console.log('✅ Response completa:', response);

  console.log('✅ Status:', response.status);
  console.log('✅ StatusText:', response.statusText);

  console.log('✅ Headers:',
    response.headers.keys().reduce((acc, key) => {
      acc[key] = response.headers.get(key);
      return acc;
    }, {} as any)
  );

  console.log('✅ Content-Type header:',
    response.headers.get('content-type')
  );

  console.log('✅ Content-Disposition:',
    response.headers.get('content-disposition')
  );

  console.log('✅ Body:', response.body);

  const blob = response.body ?? new Blob([], {
    type: this.resolveMimeType(fileKind, fileName)
  });

  console.log('📦 Blob final:', blob);

  console.log('📦 Blob size:', blob.size);

  console.log('📦 Blob type:', blob.type);

  console.log('📦 Blob instanceof Blob:',
    blob instanceof Blob
  );

  if (blob.size === 0) {
    console.warn('⚠️ El blob viene vacío');
  }

  console.log('🚀 Abriendo blob...');

  this.openBlob(blob, fileName);

  console.log('✅ Archivo abierto correctamente');

} catch (error: any) {

  console.error('❌ Error GET archivo:', error);

  console.error('❌ Status:', error?.status);

  console.error('❌ StatusText:', error?.statusText);

  console.error('❌ URL:', error?.url);

  console.error('❌ Error body:', error?.error);

  throw error;
}
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
    ASN: ['NS', 'NSC', 'NSF', 'NSS', 'NST', 'SN'],

    DR: ['B2B','B2I','B2N','B2S'],

    // 🔹 ACO — Agrupador Cartas Origen
    // ⚠️ OMISIÓN ACO-001: el endpoint GET /api/documentos/agrupador?code=ACO existe
    //    pero la entrada ACO no está en el diccionario de DocumentsController.GetAgrupador().
    //    En modo producción retorna []. En modo mock funciona correctamente.
    //    Tarea de backend: agregar ["ACO"] = new[] { "CO", "COC" } al diccionario.
    ACO: ['CO', 'COC'],

    ACC: ['CC', 'NCC', 'MF', 'MS', 'MT' ]
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
    ], B2B: [
  {
    id: "nro_pedido",
    documentTypeId: "B2B",
    friendlyName: "nro_pedido",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 0,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "B2BHCliente",
    documentTypeId: "B2B",
    friendlyName: "B2BHCliente",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 1,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "B2BHDescripcion",
    documentTypeId: "B2B",
    friendlyName: "B2BHDescripcion",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 2,
    searchField: "F",
    isAutoCompleteClient: false
  },
  {
    id: "B2BHOrdenCompra",
    documentTypeId: "B2B",
    friendlyName: "B2BHOrdenCompra",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 2,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "DescCliente",
    documentTypeId: "B2B",
    friendlyName: "Desc. Cliente",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 3,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "B2BHFechaRecepcion",
    documentTypeId: "B2B",
    friendlyName: "B2BHFechaRecepcion",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 4,
    searchField: "F",
    isAutoCompleteClient: false
  },
  {
    id: "B2BHIdMsgSap",
    documentTypeId: "B2B",
    friendlyName: "B2BHIdMsgSap",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 4,
    searchField: "F",
    isAutoCompleteClient: false
  },
  {
    id: "B2BHNroMsg",
    documentTypeId: "B2B",
    friendlyName: "B2BHNroMsg",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 5,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "B2BHSeveridad",
    documentTypeId: "B2B",
    friendlyName: "B2BHSeveridad",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 7,
    searchField: "F",
    isAutoCompleteClient: false
  },
  {
    id: "B2BHSysId",
    documentTypeId: "B2B",
    friendlyName: "B2BHSysId",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 8,
    searchField: "F",
    isAutoCompleteClient: false
  },
  {
    id: "fecha_doc",
    documentTypeId: "B2B",
    friendlyName: "fecha_doc",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 10,
    searchField: "F",
    isAutoCompleteClient: false
  }
], B2N: [
  {
    id: "nro_pedido",
    documentTypeId: "B2N",
    friendlyName: "nro_pedido",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 1,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "B2NHOrdenCompra",
    documentTypeId: "B2N",
    friendlyName: "B2NHOrdenCompra",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 2,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "B2NHCliente",
    documentTypeId: "B2N",
    friendlyName: "B2NHCliente",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 3,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "DescCliente",
    documentTypeId: "B2N",
    friendlyName: "DescCliente",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 4,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "fecha_doc",
    documentTypeId: "B2N",
    friendlyName: "fecha_doc",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 5,
    searchField: "F",
    isAutoCompleteClient: false
  },
  {
    id: "B2NHNroMsg",
    documentTypeId: "B2N",
    friendlyName: "B2NHNroMsg",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 6,
    searchField: "F",
    isAutoCompleteClient: false
  }
], B2S: [
  {
    id: "nro_pedido",
    documentTypeId: "B2S",
    friendlyName: "B2S",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 1,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "B2SHNroMsg",
    documentTypeId: "B2S",
    friendlyName: "B2SHNroMsg",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 2,
    searchField: "F",
    isAutoCompleteClient: false
  },
  {
    id: "B2SHOrdenCompra",
    documentTypeId: "B2S",
    friendlyName: "B2SHOrdenCompra",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 2,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "B2SHCliente",
    documentTypeId: "B2S",
    friendlyName: "B2SHCliente",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 3,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "fecha_doc",
    documentTypeId: "B2S",
    friendlyName: "fecha_doc",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 4,
    searchField: "F",
    isAutoCompleteClient: false
  },
  {
    id: "B2SHSysId",
    documentTypeId: "B2S",
    friendlyName: "B2SHSysId",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 4,
    searchField: "F",
    isAutoCompleteClient: false
  },
  {
    id: "DescCliente",
    documentTypeId: "B2S",
    friendlyName: "DescCliente",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 5,
    searchField: "T",
    isAutoCompleteClient: false
  }
], B2I: [
  {
    id: "nro_pedido",
    documentTypeId: "B2I",
    friendlyName: "Id Envio",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 1,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "fecha_doc",
    documentTypeId: "B2I",
    friendlyName: "fecha_doc",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 2,
    searchField: "F",
    isAutoCompleteClient: false
  },
  {
    id: "invIdB2BOC",
    documentTypeId: "B2I",
    friendlyName: "invIdB2BOC",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 3,
    searchField: "F",
    isAutoCompleteClient: false
  },
  {
    id: "invCliente",
    documentTypeId: "B2I",
    friendlyName: "Cliente",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 4,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "invEnvio",
    documentTypeId: "B2I",
    friendlyName: "Envio",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 4,
    searchField: "T",
    isAutoCompleteClient: false
  },
  {
    id: "DescCliente",
    documentTypeId: "B2I",
    friendlyName: "Desc Cliente",
    width: 100,
    align: 2,
    alignText: "Center",
    order: 5,
    searchField: "T",
    isAutoCompleteClient: false
  }
],

    // ─────────────────────────────────────────────────
    // 🔹 ACO — Cartas Origen (CO y COC)
    // Headers estimados a partir de selDataFields('CO') / selDataFields('COC').
    // Se resolverán automáticamente cuando la API esté conectada a BD.
    CO: [
      {
        id: 'nro_remision',
        documentTypeId: 'CO',
        friendlyName: 'Nro. Remisión',
        width: 110,
        align: 2,
        alignText: 'Center',
        order: 1,
        searchField: 'T',
        isAutoCompleteClient: false
      },
      {
        id: 'fecha_doc',
        documentTypeId: 'CO',
        friendlyName: 'Fecha Documento',
        width: 90,
        align: 2,
        alignText: 'Center',
        order: 2,
        searchField: 'F',
        isAutoCompleteClient: false
      },
      {
        id: 'desc_cliente',
        documentTypeId: 'CO',
        friendlyName: 'Descripción Cliente',
        width: 250,
        align: 1,
        alignText: 'Left',
        order: 3,
        searchField: 'T',
        isAutoCompleteClient: false
      },
      {
        id: 'num_cte_sol',
        documentTypeId: 'CO',
        friendlyName: 'No. Cliente',
        width: 80,
        align: 2,
        alignText: 'Center',
        order: 4,
        searchField: 'T',
        isAutoCompleteClient: false
      },
      {
        id: 'sociedad',
        documentTypeId: 'CO',
        friendlyName: 'Sociedad',
        width: 70,
        align: 2,
        alignText: 'Center',
        order: 5,
        searchField: 'T',
        isAutoCompleteClient: false
      }
    ],

    COC: [
      {
        id: 'nro_remision',
        documentTypeId: 'COC',
        friendlyName: 'Nro. Remisión',
        width: 110,
        align: 2,
        alignText: 'Center',
        order: 1,
        searchField: 'T',
        isAutoCompleteClient: false
      },
      {
        id: 'fecha_doc',
        documentTypeId: 'COC',
        friendlyName: 'Fecha Documento',
        width: 90,
        align: 2,
        alignText: 'Center',
        order: 2,
        searchField: 'F',
        isAutoCompleteClient: false
      },
      {
        id: 'desc_cliente',
        documentTypeId: 'COC',
        friendlyName: 'Descripción Cliente',
        width: 250,
        align: 1,
        alignText: 'Left',
        order: 3,
        searchField: 'T',
        isAutoCompleteClient: false
      },
      {
        id: 'num_cte_sol',
        documentTypeId: 'COC',
        friendlyName: 'No. Cliente',
        width: 80,
        align: 2,
        alignText: 'Center',
        order: 4,
        searchField: 'T',
        isAutoCompleteClient: false
      },
      {
        id: 'colada',
        documentTypeId: 'COC',
        friendlyName: 'Colada',
        width: 80,
        align: 2,
        alignText: 'Center',
        order: 5,
        searchField: 'T',
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

// private getXmlDocumentType(documentType: string): string {
//   const map: Record<string, string> = {
//     NCP: 'XCN',
//     CP: 'XCP',
//     NS: 'XNS',
//     SU: 'XSU'
//   };

//   return map[documentType] ?? documentType;
// }

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

private resolveExtension(
  fileKind: string,
  fileName?: string
): string {
  const name = (fileName ?? '').toLowerCase();

  if (name.endsWith('.pdf')) return '.pdf';
  if (name.endsWith('.xml')) return '.xml';
  if (name.endsWith('.txt')) return '.txt';
  if (name.endsWith('.zip')) return '.zip';
  if (name.endsWith('.xls')) return '.xls';
  if (name.endsWith('.xlsx')) return '.xlsx';

  switch (fileKind) {
    case 'xml': return '.xml';
    case 'txt': return '.txt';
    case 'excel': return '.xlsx';
    case 'zip': return '.zip';
    case 'pdf': return '.pdf';
    default: return '';
  }
}
private resolveMimeType(fileKind: string, fileName?: string): string {
  const name = (fileName ?? '').toLowerCase();

  if (name.endsWith('.pdf') || fileKind === 'pdf') {
    return 'application/pdf';
  }

  if (name.endsWith('.xml') || fileKind === 'xml') {
    return 'text/xml';
  }

  if (name.endsWith('.txt') || fileKind === 'txt') {
    return 'text/plain';
  }

  if (name.endsWith('.zip') || fileKind === 'zip') {
    return 'application/zip';
  }

  if (name.endsWith('.xls')) {
    return 'application/vnd.ms-excel';
  }

  if (name.endsWith('.xlsx') || fileKind === 'excel') {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  return 'application/octet-stream';
}

private getMockFile(
  request: DocumentFileRequest,
  fileKind: string,
  fileName: string
): Blob {
  const mimeType = this.resolveMimeType(fileKind, fileName);

  if (fileKind === 'xml' || fileName.toLowerCase().endsWith('.xml')) {
    return new Blob(
      [`<document><number>${request.documentNumber}</number></document>`],
      { type: mimeType }
    );
  }

  if (fileKind === 'txt' || fileName.toLowerCase().endsWith('.txt')) {
    return new Blob(
      [`Documento TXT mock\nNúmero: ${request.documentNumber}`],
      { type: mimeType }
    );
  }

  return new Blob(
    [`Archivo mock: ${fileName}`],
    { type: mimeType }
  );
}

// canShowXml(row: any): boolean {
//   const docType = row.docType ?? row.documentType ?? '';
//   const pdfOk = row.doPDFOk ?? row.pdfOk;

//   return !!pdfOk &&
//          pdfOk.toString().trim() !== '' &&
//          this.getXmlDocumentType(docType) !== '';
// }

}

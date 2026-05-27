/**
 * Pruebas unitarias del módulo ACO — Agrupador Cartas Origen (CO y COC)
 *
 * Cubre:
 *  - Carga del agrupador ACO → retorna ['CO', 'COC']
 *  - Selección de CO y COC en el combo (getHeaders por tipo)
 *  - Headers dinámicos diferenciados para CO y COC
 *  - Grid con datos mock de CO y COC con paginación
 *  - Selección múltiple (validación del request)
 *  - Descarga masiva (downloadMultifile → HTTP mock)
 *  - Envío masivo (addDocumentsQueueBulk → HTTP mock)
 *  - Generación PDF en cola (queueRegeneration → HTTP mock)
 *  - Exportación Excel (exportExcel → HTTP mock)
 *  - Manejo de errores en llamadas HTTP
 *
 * El servicio usa `!environment.production` para activar mock data.
 * En el entorno de tests (environment.development.ts), production = false,
 * por lo que los métodos con mock data funcionan sin HTTP real.
 */

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { DocumentsApiService } from './documents-api.service';
import {
  DocumentGridPageRequest,
  DocumentMultifileRequest,
  DocumentQueueBulkRequest,
  DocumentExportRequest,
} from '../models/documents.models';
import { environment } from '../../../../environments/environment';

describe('DocumentsApiService — ACO (Cartas Origen)', () => {
  let service: DocumentsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentsApiService],
    });

    service = TestBed.inject(DocumentsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Agrupador ACO
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getDocumentGroup(ACO)', () => {
    it('debe retornar [CO, COC] en modo mock', async () => {
      const types = await service.getDocumentGroup('ACO');

      expect(types).toEqual(['CO', 'COC']);
      httpMock.expectNone(req => req.url.includes('agrupador'));
    });

    it('el primer elemento debe ser CO', async () => {
      const types = await service.getDocumentGroup('ACO');

      expect(types[0]).toBe('CO');
    });

    it('el segundo elemento debe ser COC', async () => {
      const types = await service.getDocumentGroup('ACO');

      expect(types[1]).toBe('COC');
    });

    it('debe retornar exactamente 2 elementos para ACO', async () => {
      const types = await service.getDocumentGroup('ACO');

      expect(types.length).toBe(2);
    });

    it('un código desconocido debe retornar array vacío', async () => {
      const types = await service.getDocumentGroup('UNKNOWN');

      expect(types).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Tipos de documento — CO y COC deben aparecer en el catálogo
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getDocumentTypes() — CO y COC', () => {
    it('debe incluir CO con nombre "Carta País Origen"', async () => {
      const types = await service.getDocumentTypes();
      const co = types.find(t => t.code === 'CO');

      expect(co).toBeDefined();
      expect(co?.name).toBe('Carta País Origen');
    });

    it('debe incluir COC con nombre "Carta País Origen Colada"', async () => {
      const types = await service.getDocumentTypes();
      const coc = types.find(t => t.code === 'COC');

      expect(coc).toBeDefined();
      expect(coc?.name).toBe('Carta País Origen Colada');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Headers dinámicos — CO
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getHeaders(CO)', () => {
    it('debe retornar headers para CO en modo mock', async () => {
      const headers = await service.getHeaders('CO');

      expect(headers.length).toBeGreaterThan(0);
      httpMock.expectNone(req => req.url.includes('headers'));
    });

    it('los headers de CO deben incluir el campo nro_remision', async () => {
      const headers = await service.getHeaders('CO');
      const field = headers.find(h => h.id === 'nro_remision');

      expect(field).toBeDefined();
      expect(field?.documentTypeId).toBe('CO');
    });

    it('los headers de CO deben incluir fecha_doc', async () => {
      const headers = await service.getHeaders('CO');
      const field = headers.find(h => h.id === 'fecha_doc');

      expect(field).toBeDefined();
      expect(field?.searchField).toBe('F');
    });

    it('los headers de CO deben incluir desc_cliente', async () => {
      const headers = await service.getHeaders('CO');
      const field = headers.find(h => h.id === 'desc_cliente');

      expect(field).toBeDefined();
    });

    it('los headers de CO deben incluir num_cte_sol', async () => {
      const headers = await service.getHeaders('CO');
      const field = headers.find(h => h.id === 'num_cte_sol');

      expect(field).toBeDefined();
    });

    it('los headers de CO deben incluir sociedad', async () => {
      const headers = await service.getHeaders('CO');
      const field = headers.find(h => h.id === 'sociedad');

      expect(field).toBeDefined();
    });

    it('getHeaders(CO, T) debe retornar solo campos de tipo texto', async () => {
      const headers = await service.getHeaders('CO', 'T');

      expect(headers.every(h => h.searchField === 'T')).toBeTrue();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Headers dinámicos — COC
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getHeaders(COC)', () => {
    it('debe retornar headers para COC en modo mock', async () => {
      const headers = await service.getHeaders('COC');

      expect(headers.length).toBeGreaterThan(0);
    });

    it('los headers de COC deben incluir el campo nro_remision', async () => {
      const headers = await service.getHeaders('COC');
      const field = headers.find(h => h.id === 'nro_remision');

      expect(field).toBeDefined();
      expect(field?.documentTypeId).toBe('COC');
    });

    it('COC debe tener el campo exclusivo colada', async () => {
      const headers = await service.getHeaders('COC');
      const field = headers.find(h => h.id === 'colada');

      expect(field).toBeDefined();
      expect(field?.friendlyName).toBe('Colada');
    });

    it('CO NO debe tener el campo colada', async () => {
      const headers = await service.getHeaders('CO');
      const field = headers.find(h => h.id === 'colada');

      expect(field).toBeUndefined();
    });

    it('los headers de CO y COC deben ser conjuntos distintos', async () => {
      const coHeaders = await service.getHeaders('CO');
      const cocHeaders = await service.getHeaders('COC');

      // COC tiene 'colada', CO tiene 'sociedad' en su lugar
      const coIds = coHeaders.map(h => h.id).sort((a, b) => a.localeCompare(b));
      const cocIds = cocHeaders.map(h => h.id).sort((a, b) => a.localeCompare(b));

      expect(coIds).not.toEqual(cocIds);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Grid — datos mock de CO
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getGridPage — CO', () => {
    const baseRequest = (): DocumentGridPageRequest => ({
      documentType: 'CO',
      dateFrom: '20260101',
      dateTo: '20260331',
      filters: {},
      start: 0,
      length: 10,
      sortColumn: '',
      sortDirection: '',
    });

    it('debe retornar datos de tipo CO en modo mock', async () => {
      const response = await service.getGridPage(baseRequest());

      expect(response.data.every(d => d.documentType === 'CO')).toBeTrue();
      httpMock.expectNone(req => req.url.includes('grid'));
    });

    it('debe retornar al menos 6 registros de CO', async () => {
      const response = await service.getGridPage(baseRequest());

      expect(response.data.length).toBeGreaterThanOrEqual(6);
      expect(response.recordsFiltered).toBeGreaterThanOrEqual(6);
    });

    it('los documentos CO deben tener documentNumber como nro_remision', async () => {
      const response = await service.getGridPage(baseRequest());

      response.data.forEach(item => {
        expect(item.documentNumber).toBeTruthy();
        expect(item.dynamicItems['nro_remision']).toBe(item.documentNumber);
      });
    });

    it('debe respetar la paginación: start=0 length=3', async () => {
      const req = { ...baseRequest(), start: 0, length: 3 };
      const response = await service.getGridPage(req);

      expect(response.data.length).toBeLessThanOrEqual(3);
    });

    it('debe retornar array vacío si start es mayor que el total', async () => {
      const req = { ...baseRequest(), start: 9999 };
      const response = await service.getGridPage(req);

      expect(response.data.length).toBe(0);
    });

    it('documentos CO con PDF tienen pdfOk con valor', async () => {
      const response = await service.getGridPage(baseRequest());
      const withPdf = response.data.filter(d => d.pdfOk && d.pdfOk !== '');

      expect(withPdf.length).toBeGreaterThan(0);
      withPdf.forEach(d => {
        expect(d.pdfFile).toBeTruthy();
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Grid — datos mock de COC
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getGridPage — COC', () => {
    const baseRequest = (): DocumentGridPageRequest => ({
      documentType: 'COC',
      dateFrom: '20260101',
      dateTo: '20260331',
      filters: {},
      start: 0,
      length: 10,
      sortColumn: '',
      sortDirection: '',
    });

    it('debe retornar datos de tipo COC en modo mock', async () => {
      const response = await service.getGridPage(baseRequest());

      expect(response.data.every(d => d.documentType === 'COC')).toBeTrue();
    });

    it('debe retornar al menos 5 registros de COC', async () => {
      const response = await service.getGridPage(baseRequest());

      expect(response.data.length).toBeGreaterThanOrEqual(5);
    });

    it('los documentos COC deben tener el campo colada en dynamicItems', async () => {
      const response = await service.getGridPage(baseRequest());

      response.data.forEach(item => {
        expect(item.dynamicItems['colada']).toBeTruthy();
      });
    });

    it('el grid de CO y COC debe retornar conjuntos de datos distintos', async () => {
      const coResponse = await service.getGridPage({
        documentType: 'CO',
        dateFrom: '20260101',
        dateTo: '20260331',
        filters: {},
        start: 0,
        length: 50,
        sortColumn: '',
        sortDirection: '',
      });

      const cocResponse = await service.getGridPage(baseRequest());

      const cocNumbers = new Set(cocResponse.data.map(d => d.documentNumber));

      // No deben compartir números de documento
      const intersection = coResponse.data.filter(d => cocNumbers.has(d.documentNumber));
      expect(intersection.length).toBe(0);
    });

    it('paginación: debe respetar length=2 para COC', async () => {
      const req = { ...baseRequest(), length: 2 };
      const response = await service.getGridPage(req);

      expect(response.data.length).toBeLessThanOrEqual(2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Descarga masiva — downloadMultifile (HTTP mock)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('downloadMultifile — descarga masiva ACO', () => {
    it('debe enviar el request al endpoint api/documentos/multifile', async () => {
      const request: DocumentMultifileRequest = {
        type: 'Multi',
        documentType: 'CO',
        items: [
          { id: 1001234, remision: '4900001234' },
          { id: 1001236, remision: '4900001236' },
        ],
      };

      const promise = service.downloadMultifile(request, 'ACO_CO_Masivo.zip');

      const req = httpMock.expectOne(r =>
        r.url.includes('api/documentos/multifile')
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body.documentType).toBe('CO');
      expect(req.request.body.items.length).toBe(2);

      req.flush(new Blob(['ZIP'], { type: 'application/zip' }));
      await promise;
    });

    it('debe enviar documentType COC correctamente', async () => {
      const request: DocumentMultifileRequest = {
        type: 'Multi',
        documentType: 'COC',
        items: [{ id: 2001234, remision: '4900002234' }],
      };

      const promise = service.downloadMultifile(request, 'ACO_COC_Masivo.zip');

      const req = httpMock.expectOne(r =>
        r.url.includes('api/documentos/multifile')
      );
      expect(req.request.body.documentType).toBe('COC');

      req.flush(new Blob(['ZIP'], { type: 'application/zip' }));
      await promise;
    });

    it('debe propagar el error cuando el servidor falla', async () => {
      const request: DocumentMultifileRequest = {
        type: 'Multi',
        documentType: 'CO',
        items: [{ id: 1001234, remision: '4900001234' }],
      };

      const promise = service.downloadMultifile(request, 'ACO_CO_Masivo.zip');

      const req = httpMock.expectOne(r =>
        r.url.includes('api/documentos/multifile')
      );
      req.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

      await expectAsync(promise).toBeRejected();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Envío masivo — addDocumentsQueueBulk (HTTP mock)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('addDocumentsQueueBulk — envío masivo ACO', () => {
    it('debe enviar el request al endpoint api/documentos/queue/add-bulk', async () => {
      const request: DocumentQueueBulkRequest = {
        items: [
          {
            dqNumber: '4900001234',
            dqDocId: 1001234,
            dqDocTypeId: 'CO',
            dqAction: 'SEND',
          },
          {
            dqNumber: '4900001236',
            dqDocId: 1001236,
            dqDocTypeId: 'CO',
            dqAction: 'SEND',
          },
        ],
      };

      const promise = service.addDocumentsQueueBulk(request);

      const req = httpMock.expectOne(r =>
        r.url.includes('api/documentos/queue/add-bulk')
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body.items.length).toBe(2);
      expect(req.request.body.items[0].dqAction).toBe('SEND');
      expect(req.request.body.items[0].dqDocTypeId).toBe('CO');

      req.flush({ error: false, message: 'Enviado correctamente' });
      const response = await promise;
      expect(response.error).toBeFalse();
    });

    it('debe manejar envío masivo de COC con acción SEND', async () => {
      const request: DocumentQueueBulkRequest = {
        items: [
          {
            dqNumber: '4900002234',
            dqDocId: 2001234,
            dqDocTypeId: 'COC',
            dqAction: 'SEND',
          },
        ],
      };

      const promise = service.addDocumentsQueueBulk(request);

      const req = httpMock.expectOne(r =>
        r.url.includes('api/documentos/queue/add-bulk')
      );
      expect(req.request.body.items[0].dqDocTypeId).toBe('COC');

      req.flush({ error: false, message: 'Enviado correctamente' });
      await promise;
    });

    it('debe propagar el error cuando el servidor falla en envío masivo', async () => {
      const request: DocumentQueueBulkRequest = {
        items: [
          {
            dqNumber: '4900001234',
            dqDocId: 1001234,
            dqDocTypeId: 'CO',
            dqAction: 'SEND',
          },
        ],
      };

      const promise = service.addDocumentsQueueBulk(request);

      const req = httpMock.expectOne(r =>
        r.url.includes('api/documentos/queue/add-bulk')
      );
      req.flush('Error', { status: 503, statusText: 'Service Unavailable' });

      await expectAsync(promise).toBeRejected();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. Generación PDF — queueRegeneration (HTTP mock)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('queueRegeneration — generación PDF ACO', () => {
    it('debe enviar el request al endpoint api/documentos/recreacion/cola', async () => {
      const items = [
        { id: 1001234, remision: '4900001234' },
        { id: 1001236, remision: '4900001236' },
      ];

      const promise = service.queueRegeneration(items);

      const req = httpMock.expectOne(r =>
        r.url.includes('recreacion/cola')
      );
      expect(req.request.method).toBe('POST');

      req.flush({ error: false, message: 'Documentos en cola de regeneración' });
      const response = await promise;
      expect(response.error).toBeFalse();
    });

    it('debe propagar error en fallo de generación PDF', async () => {
      const items = [{ id: 1001234, remision: '4900001234' }];

      const promise = service.queueRegeneration(items);

      const req = httpMock.expectOne(r =>
        r.url.includes('recreacion/cola')
      );
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

      await expectAsync(promise).toBeRejected();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. Exportación Excel (HTTP mock)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('exportExcel — exportación Excel ACO', () => {
    it('debe enviar el request al endpoint api/documentos/export/excel para CO', async () => {
      const request: DocumentExportRequest = {
        documentType: 'CO',
        dateFrom: '20260101',
        dateTo: '20260331',
        filters: {},
      };

      const promise = service.exportExcel(request, 'ACO_CO_Excel.xlsx');

      const req = httpMock.expectOne(r =>
        r.url.includes('api/documentos/export/excel')
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body.documentType).toBe('CO');

      req.flush(new Blob(['XLSX'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      await promise;
    });

    it('debe enviar el request para COC correctamente', async () => {
      const request: DocumentExportRequest = {
        documentType: 'COC',
        dateFrom: '20260101',
        dateTo: '20260331',
        filters: {},
      };

      const promise = service.exportExcel(request, 'ACO_COC_Excel.xlsx');

      const req = httpMock.expectOne(r =>
        r.url.includes('api/documentos/export/excel')
      );
      expect(req.request.body.documentType).toBe('COC');

      req.flush(new Blob(['XLSX'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      await promise;
    });

    it('debe propagar error en fallo de exportación Excel', async () => {
      const request: DocumentExportRequest = {
        documentType: 'CO',
        dateFrom: '20260101',
        dateTo: '20260331',
        filters: {},
      };

      const promise = service.exportExcel(request);

      const req = httpMock.expectOne(r =>
        r.url.includes('api/documentos/export/excel')
      );
      req.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

      await expectAsync(promise).toBeRejected();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 11. Selección múltiple — validación del request de descarga masiva
  // ─────────────────────────────────────────────────────────────────────────────

  describe('selección múltiple — composición del request', () => {
    it('el request de descarga masiva debe incluir todos los items seleccionados de CO', async () => {
      const selectedCOItems = [
        { id: 1001234, remision: '4900001234' },
        { id: 1001236, remision: '4900001236' },
        { id: 1001237, remision: '4900001237' },
      ];

      const request: DocumentMultifileRequest = {
        type: 'Multi',
        documentType: 'CO',
        items: selectedCOItems,
      };

      const promise = service.downloadMultifile(request, 'ACO_CO_Masivo.zip');

      const req = httpMock.expectOne(r =>
        r.url.includes('multifile')
      );
      expect(req.request.body.items.length).toBe(3);
      expect(req.request.body.items.map((i: { remision: string }) => i.remision))
        .toEqual(['4900001234', '4900001236', '4900001237']);

      req.flush(new Blob(['ZIP'], { type: 'application/zip' }));
      await promise;
    });

    it('el request de envío masivo debe mapear correctamente todos los documentos COC seleccionados', async () => {
      const selectedCOCItems: DocumentQueueBulkRequest = {
        items: [
          { dqNumber: '4900002234', dqDocId: 2001234, dqDocTypeId: 'COC', dqAction: 'SEND' },
          { dqNumber: '4900002236', dqDocId: 2001236, dqDocTypeId: 'COC', dqAction: 'SEND' },
          { dqNumber: '4900002237', dqDocId: 2001237, dqDocTypeId: 'COC', dqAction: 'SEND' },
        ],
      };

      const promise = service.addDocumentsQueueBulk(selectedCOCItems);

      const req = httpMock.expectOne(r =>
        r.url.includes('add-bulk')
      );
      expect(req.request.body.items.length).toBe(3);
      expect(
        req.request.body.items.every((i: { dqDocTypeId: string; dqAction: string }) =>
          i.dqDocTypeId === 'COC' && i.dqAction === 'SEND'
        )
      ).toBeTrue();

      req.flush({ error: false, message: 'Enviado correctamente' });
      await promise;
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 12. Verificación de entorno mock
  // ─────────────────────────────────────────────────────────────────────────────

  describe('entorno de tests', () => {
    it('el entorno de tests debe tener production = false para activar mocks', () => {
      expect(environment.production).toBeFalse();
    });

    it('el servicio debe estar disponible mediante inyección', () => {
      expect(service).toBeTruthy();
    });
  });
});

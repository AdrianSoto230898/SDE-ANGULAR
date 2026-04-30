import { AfterViewInit, Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfigurationService } from '../../services/configuration.service';
import { ArticuloUpsertDto } from '../../models/configuration.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogosService } from '../../services/catalogos.service';
import { CustomInputComponent } from '../../../../shared/components/ui-elements/custom-input/custom-input.component';
import { CustomSelectSearchComponent } from '../../../../shared/components/ui-elements/custom-select-search/custom-select-search.component';
import { DateInputComponent } from '../../../../shared/components/ui-elements/date-input/date-input.component';
import Shepherd from 'shepherd.js';
import Quill from 'quill';
import { ToastService } from '../../../../core/services/ui/toast/toast.service';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CustomInputComponent, CustomSelectSearchComponent, DateInputComponent, ToastComponent]
})
export class FormPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('myModal', { static: false })
  myModal!: ElementRef<HTMLDialogElement>;

  private catalogosService = inject(CatalogosService);
  public toastService = inject(ToastService);

  private tour: any;

  tipos: any[] = [];
  areas: any[] = [];
  procesos: any[] = [];
  subprocesos: any[] = [];
  articuloTipos: any[] = [];
  selAreaId: number | null = null; selProcesoId: number | null = null;

  dateStart = { start: new Date() };
  today = new Date();

  editId: number | null = null;
  saving = false;

  form = this.fb.group({
    titulo: ['', Validators.required],
    areaSubprocesoId: [null as number | null, Validators.required],
    articuloTipoId: [null as number | null, Validators.required],
    usuarioReferenteId: [0],
    version: [1, Validators.required],
    orden: [1, Validators.required],
    keywords: ['', Validators.required],
    fechaPublicacion: [null as string | null],
    contenidoHTML: ['', Validators.required],
    contenidoSinFormato: [''],
    activo: [true]
  });

  adjuntos: any[] = [];
  adjuntoOpen = false;
  fileToSend: File | null = null;
  adjuntoTitulo = '';
  adjuntoDescripcion = '';
  uploading = false;

  // Tour modal
  welcomeOpen = false;
  dontShowAgain = false

  //@ViewChild('modalAdjunto') modalAdjunto!: IonModal;
  @ViewChild('qlEditor', { static: false }) qlEditor!: ElementRef<HTMLDivElement>;

  private quill: any;
  full = false;                 // pantalla completa
  private editorMinH = '48vh';  // alto por defecto

  constructor(private fb: FormBuilder, private api: ConfigurationService,
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.cargarAreas();
    this.cargarAreaProcesos();
    this.cargarAreaSubprocesos();
    this.cargarArticuloTipos();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') this.cargar(+id);

    // Detectar si ya no se debe mostrar
    const hide = localStorage.getItem('articleTutorial');
    if (!hide) {
      this.welcomeOpen = true;
    }

    this.form.valueChanges.subscribe(v => {
      const html = v?.contenidoHTML || '';
      const plain = this.stripHtml(html);
      if (plain !== this.form.value.contenidoSinFormato) {
        this.form.patchValue({ contenidoSinFormato: plain }, { emitEvent: false });
      }
    });
  }

  ngAfterViewInit() {
    // Inicializa el editor
    this.initEditor();

    // Inicializa el tour
    this.initTour();
  }

  initEditor() {
    this.quill = new Quill(this.qlEditor.nativeElement, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['link', 'blockquote', 'code-block'],
          ['clean']
        ]
      }
    });

    // Altura inicial
    this.setEditorHeight(this.editorMinH);

    // Cargar HTML actual del form (si viene de edición)
    const html = this.form.value.contenidoHTML || '';
    this.quill.root.innerHTML = html;

    // Sync -> Form
    this.quill.on('text-change', () => {
      const htmlNow = this.quill.root.innerHTML;
      const textNow = (this.quill.getText() || '').trim();
      this.form.patchValue(
        { contenidoHTML: htmlNow, contenidoSinFormato: textNow },
        { emitEvent: false }
      );
    });

    // Sync <- Form (si alguien setea desde fuera)
    this.form.get('contenidoHTML')?.valueChanges.subscribe(v => {
      if (!this.quill) return;
      if ((v || '') !== this.quill.root.innerHTML) {
        this.quill.root.innerHTML = v || '';
      }
    });
  }

  ngOnDestroy() {
    // Quill no expone destroy formal; despega listeners
    if (this.quill) { this.quill = null; }
    document.documentElement.style.overflow = '';
  }

  goList() { this.router.navigate(['/article/list']); }

  cargarAreas(): void {
    this.catalogosService.getAreas().subscribe({
      next: (areas) => {
        this.areas = areas;
      },
      error: (err) => {
        console.error('Error al cargar las áreas:', err);
      }
    });
  }

  cargarAreaProcesos(): void {
    this.catalogosService.getAreaProcesos().subscribe({
      next: (procesos) => {
        this.procesos = procesos;
      },
      error: (err) => {
        console.error('Error al cargar los procesos:', err);
      }
    });
  }

  cargarAreaSubprocesos(): void {
    this.catalogosService.getAreaSubprocesos().subscribe({
      next: (opciones) => {
        this.subprocesos = opciones;
      },
      error: (err) => {
        console.error('Error al cargar los subprocesos:', err);
      }
    });
  }

  cargarArticuloTipos(): void {
    this.catalogosService.getArticuloTipos().subscribe({
      next: (tipos) => {
        this.articuloTipos = tipos;
      },
      error: (err) => {
        console.error('Error al cargar los tipos de artículo:', err);
      }
    });
  }

  cargar(id: number) {
    this.api.getById(id).subscribe(resp => {
      const a = resp?.data ?? resp;
      this.editId = a.articuloId;

      // sincronizar el signal/variable que controla la fecha
      if (a.fechaPublicacion) {
        this.dateStart = { start: new Date(a.fechaPublicacion) };
      }

      // Se buscan los tipos de artículos y subprocesos para los select
      const articuloTipo = this.articuloTipos.find(t => +t.value === a.articuloTipoId) ?? null;
      const areaSubproceso = this.subprocesos.find(s => +s.value === a.areaSubprocesoId) ?? null;

      this.form.patchValue({
        titulo: a.titulo ?? '',
        articuloTipoId: articuloTipo,
        usuarioReferenteId: a.usuarioReferenteId ?? 0,
        areaSubprocesoId: areaSubproceso,
        contenidoHTML: a.contenidoHTML ?? '',
        contenidoSinFormato: a.contenidoSinFormato ?? '',
        keywords: a.keywords ?? '',
        orden: a.orden ?? 0,
        version: a.version ?? 1,
        fechaPublicacion: a.fechaPublicacion
          ? String(a.fechaPublicacion).substring(0, 10)
          : null,
        activo: a.activo ?? true
      });
    });
  }

  // Guarda o actualiza el artículo 
  guardar() {
    // Establece la fecha de publicación
    this.form.get('fechaPublicacion')?.setValue(this.dateStart?.start?.toISOString() ?? null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    // 👇 Extraer solo el valor numérico si viene como objeto
    const areaSubprocesoId = typeof v.areaSubprocesoId === 'object'
      ? +(v.areaSubprocesoId as any).value
      : v.areaSubprocesoId;

    const articuloTipoId = typeof v.articuloTipoId === 'object'
      ? +(v.articuloTipoId as any).value
      : v.articuloTipoId;

    const dto: ArticuloUpsertDto = {
      articuloId: this.editId ?? null,
      titulo: v.titulo!,
      articuloTipoId,
      usuarioReferenteId: v.usuarioReferenteId!,
      areaSubprocesoId,
      contenidoHTML: v.contenidoHTML!,
      contenidoSinFormato: v.contenidoSinFormato ?? '',
      orden: v.orden ?? 0,
      keywords: v.keywords ?? null,
      fechaPublicacion: v.fechaPublicacion ?? null
    };

    this.saving = true;
    const obs = this.editId
      ? this.api.update(this.editId, dto)
      : this.api.create(dto);

    obs.subscribe({
      next: (r) => {
        this.saving = false;

        if (!r.executionError) {
          // alert(r.message);
          this.toastService.showToast('Artículo guardado.', 'success', 4000, 'bottom-center');
        } else {
          alert("Error: " + r.message);
          this.toastService.showToast('Error al guardar el artículo.', 'error', 4000, 'bottom-center');
        }
      },
      error: () => this.saving = false
    });
  }

  openAdjuntoModal() {
    if (!this.editId) { alert('Guarda el artículo para adjuntar archivos.'); return; }
    this.adjuntoOpen = true;
    this.fileToSend = null;
    this.adjuntoTitulo = '';
    this.adjuntoDescripcion = '';
  }

  onFile(ev: any) {
    this.fileToSend = ev?.target?.files?.[0] ?? null;
  }

  @HostListener('document:keydown.escape')
  onEsc() { if (this.full) this.toggleFull(); }

  toggleFull() {
    this.full = !this.full;

    document.body.style.overflow = this.full ? 'hidden' : '';

    if (this.full) this.setEditorHeightFull();
    else this.setEditorHeight(this.editorMinH);
  }

  private setEditorHeightFull() {
    setTimeout(() => {
      const host = this.qlEditor?.nativeElement as HTMLElement | null;
      const toolbar = host?.querySelector('.ql-toolbar') as HTMLElement | null;

      const topBarH = 56;                      // tu barrita superior
      const tbH = toolbar?.offsetHeight ?? 42; // toolbar de Quill
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const h = `${vh - (topBarH + tbH + 24)}px`; // 24px margen

      this.setEditorHeight(h);
    }, 0);
  }

  limpiarFormato() {
    const plain = (this.quill?.getText?.() || '').trim() || this.stripHtml(this.form.value.contenidoHTML || '');
    this.form.patchValue({ contenidoSinFormato: plain }, { emitEvent: false });
  }

  private setEditorHeight(h: string) {
    // Ajusta editor Quill por DOM
    setTimeout(() => {
      const root = this.qlEditor?.nativeElement?.querySelector('.ql-editor') as HTMLElement | null;
      const container = this.qlEditor?.nativeElement?.querySelector('.ql-container') as HTMLElement | null;
      if (root) root.style.minHeight = h;
      if (container) container.style.minHeight = h;
    }, 0);
  }

  private stripHtml(html: string): string {
    const el = document.createElement('div');
    el.innerHTML = html;
    const text = (el.textContent || el.innerText || '').trim();
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /** Sugerencia simple de keywords a partir de título + texto plano */
  private suggestKeywords(title: string, plain: string): string {
    const text = `${title} ${plain}`.toLowerCase();
    const words = text.match(/[a-z0-9áéíóúüñ]{4,}/gi) || [];
    const stop = new Set(['para', 'con', 'sin', 'este', 'esta', 'como', 'cuando', 'donde', 'unos', 'unas', 'solo', 'sobre', 'que', 'por', 'del', 'los', 'las', 'una', 'uno', 'entre', 'desde', 'hacia']);
    const freq = new Map<string, number>();

    for (const w of words) if (!stop.has(w)) freq.set(w, (freq.get(w) || 0) + 1);

    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([w]) => w)
      .join(', ');
  }

  // Inicia el tour
  private initTour() {
    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shepherd-tailwind',
        scrollTo: { behavior: 'smooth', block: 'center' }
      },
      useModalOverlay: true
    });

    this.tour.addStep({
      id: 'guardar',
      text: 'Usa <b>Guardar</b> para crear o actualizar el artículo.',
      attachTo: { element: '#btn-guardar', on: 'left' },
      classes: 'rounded-2xl bg-white dark:bg-neutral-900 text-black dark:text-white shadow-xl p-4 w-[320px] gap-3 text-xs mb-3',
      buttons: [
        { text: 'Siguiente', classes: 'btn-primary h-10 px-3 md:px-4 rounded-full', action: this.tour.next }
      ]
    });

    this.tour.addStep({
      id: 'listado',
      text: 'Con <b>Listado</b> podrás ver todos los artículos creados.',
      attachTo: { element: '#btn-listado', on: 'left' },
      classes: 'rounded-2xl bg-white dark:bg-neutral-900 text-black dark:text-white shadow-xl p-4 w-[320px] gap-3 text-xs mb-3',
      buttons: [
        { text: 'Volver', classes: 'btn-secondary h-10 px-3 md:px-4 rounded-full', action: this.tour.back },
        { text: 'Siguiente', classes: 'btn-primary h-10 px-3 md:px-4 rounded-full', action: this.tour.next }
      ]
    });

    this.tour.addStep({
      id: 'editor',
      text: 'Aquí puedes <b>escribir y dar formato</b> al contenido del artículo.',
      classes: 'rounded-2xl bg-white dark:bg-neutral-900 text-black dark:text-white shadow-xl p-4 w-[320px] text-sm mb-3',
      attachTo: { element: '#editor-html', on: 'top' },
      buttons: [
        { text: 'Volver', action: this.tour.back, classes: 'btn-secondary h-10 px-3 md:px-4 rounded-full' },

        { text: 'Siguiente', action: this.tour.next, classes: 'btn-primary h-10 px-3 md:px-4 rounded-full' }
      ]
    });

    this.tour.addStep({
      id: 'pantalla-completa',
      text: 'Si necesitas más espacio, usa este botón para <b>activar pantalla completa</b> en el editor.',
      classes: 'rounded-2xl bg-white dark:bg-neutral-900 text-black dark:text-white shadow-xl p-4 w-[320px] text-sm gap-3 mb-3',
      attachTo: { element: '#btn-full-editor', on: 'bottom' },
      buttons: [
        { text: 'Volver', action: this.tour.back, classes: 'btn-secondary h-10 px-3 md:px-4 rounded-full' },
        { text: 'Finalizar', action: this.tour.complete, classes: "btn-primary h-10 px-3 md:px-4 rounded-full" }
      ]
    });

    setTimeout(() => {
      this.openTutorial();
    }, 100);
  }

  // Comienza el tour
  startTour() {
    if (this.dontShowAgain) {
      localStorage.setItem('articleTutorial', '1');
    }

    this.myModal.nativeElement.close();

    setTimeout(() => {
      this.tour.start();
    }, 400);
  }

  // Abre el modal del tutorial
  openTutorial() {
    const show = localStorage.getItem('articleTutorial');

    if (show === '1') return;

    this.welcomeOpen = false;
    this.myModal.nativeElement.showModal();
  }

  // Cierra el modal
  closeWelcome() {
    if (this.dontShowAgain) {
      localStorage.setItem('articleTutorial', '1');
    }

    this.myModal.nativeElement.close();
  }
}
import { ChangeDetectorRef, Component, computed, ElementRef, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';

import { FormControl, FormsModule } from '@angular/forms';
import { ConfigurationService } from '../../services/configuration.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ColumnDef, CustomTableComponent } from '../../../../shared/components/ui-elements/custom-table/custom-table.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { ToastService } from '../../../../core/services/ui/toast/toast.service';
import { StatisticsService } from '../../../../core/services/shared/statistics/statistics.service';
import { SidebarService } from '../../../../core/services/shared/sidebar/sidebar.service';


@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  standalone: true,
  imports: [FormsModule, CustomTableComponent, ToastComponent]
})
export class ListPage implements OnInit {
  @ViewChild('myModal', { static: false })
  myModal!: ElementRef<HTMLDialogElement>;

  public toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private statisticsService = inject(StatisticsService);
  public sidebarService = inject(SidebarService);

  q = '';
  loading = false;

  // tabla
  items: any[] = [];
  columns: ColumnDef[] = [];

  // paginación
  currentPage = 1;
  itemsPerPage = 10;
  selectedRow: any = null;

  // modal
  deleteOpen = false;

  // templates para celdas
  @ViewChild('tituloTpl') tituloTpl!: TemplateRef<any>;
  @ViewChild('tipoTpl') tipoTpl!: TemplateRef<any>;
  @ViewChild('accionesTpl') accionesTpl!: TemplateRef<any>;

  constructor(private api: ConfigurationService, private router: Router) { }

  ngOnInit() {
    this.columns = [
      {
        key: 'acciones', header: 'Acciones', align: 'left', widthClass: 'w-[160px]',
        actions: [
          { id: 'view', icon: 'icon-[solar--eye-linear]', click: (r: any) => this.onView(r) },
          { id: 'edit', icon: 'icon-[solar--pen-linear]', click: (r: any) => this.onEdit(r) },
          { id: 'delete', icon: 'icon-[solar--home-2-bold]', click: (r: any) => this.onDelete(r) },
        ]
      },
      { key: 'titulo', header: 'Nombre', align: 'left', widthClass: 'w-[280px]', truncate: true, type: 'text' },
      { key: 'articuloTipoNombre', header: 'Tipo', align: 'left', widthClass: 'w-[200px]', type: 'text' },
      { key: 'fechaCreacion', header: 'Creado', align: 'left', widthClass: 'w-[80px]', type: 'date' },
      { key: 'version', header: 'Versión', align: 'center', widthClass: 'w-[80px]', type: 'number' },
      { key: 'activo', header: 'Activo', align: 'center', widthClass: 'w-[80px]', type: 'boolean' },
    ];


    this.buscar();
  }

  ngAfterViewInit() {

  }

  buscar() {
    this.loading = true;
    this.api.buscar({ titulo: this.q?.trim() || undefined }).subscribe({
      next: list => {
        this.items = list || [];
        this.cdr.detectChanges();
      },
      error: _ => {
        this.items = [];
        this.toastService.showToast(
          'Error al cargar la información de los artículos.',
          'error',
          4000,
          'bottom-center'
        );
      },
      complete: () => {
        setTimeout(() => this.loading = false, 300);
      }
    });
  }

  onCreate() {
    this.router.navigate(['/article/form']);
  }

  onView(row: any) {
    this.openArticleById(row.articuloId);
  }
  onEdit(row: any) {
    this.router.navigate(['/article/form', row.articuloId]);
  }

  onDelete(row: any) {
    this.selectedRow = row;
    this.deleteOpen = true;

    // Abre el modal
    this.myModal.nativeElement.showModal();
  }

  closeModal() {
    this.deleteOpen = false;
    // Cierra el modal
    this.myModal.nativeElement.close();
  }

  confirmDelete() {
    if (!this.selectedRow) return;

     // Cierra el modal
     this.myModal.nativeElement.close();

    this.api.delete(this.selectedRow.articuloId).subscribe({
      next: (r) => {
        if (!r.executionError) {
          this.deleteOpen = false;
          this.buscar(); // refresca la lista
          this.toastService.showToast('Artículo eliminado.', 'success', 4000, 'bottom-center');
        } else {
          this.toastService.showToast('Error al eliminar el artículo.', 'error', 4000, 'bottom-center');
        }
      },
      error: () => {
        alert("Error al comunicarse con el servidor");
      }
    });
  }

  openArticleById(id: number) {
    this.sidebarService.open(id);

    this.statisticsService.saveStatistics({
      usuarioId: 1,
      estadisticaPantallaId: 10,
      articuloId: id,
      prompt: '',
      resultados: 0
    }).subscribe();
  }
}
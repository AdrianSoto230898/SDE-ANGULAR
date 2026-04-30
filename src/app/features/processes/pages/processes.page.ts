import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessesService } from '../services/processes.service';
import { AreaModel } from '../models/area.model';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../../core/services/shared/sidebar/sidebar.service';
import { StatisticsService } from '../../../core/services/shared/statistics/statistics.service';

@Component({
  selector: 'app-processes',
  templateUrl: './processes.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class ProcessesPage implements OnInit {
  private procesosService = inject(ProcessesService);
  public sidebarService = inject(SidebarService);
  private statisticsService = inject(StatisticsService);

  readonly loading = signal(true);
  areasData = signal<AreaModel[]>([]); // tu signal de áreas
  selectedAreaId = signal<number | null>(null); // id seleccionada

  ngOnInit() {
    this.procesosService.getProcesosTree().subscribe({
      next: (resp) => {
        this.areasData.set(resp.data ?? []);
        // Preselecciona la primera área si existe
        if (resp.data && resp.data.length) {
          this.selectedAreaId.set(resp.data[0].areaId);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  readonly selectedArea = computed(() =>
    this.areasData().find(a => a.areaId === this.selectedAreaId())
  );

  selectArea(areaId: number) {
    this.selectedAreaId.set(areaId);
  }

  // Estado expandido por proceso (usando Map para control individual)
  expandedProcs = signal<{ [key: number]: boolean }>({});

  toggleProc(procId: number) {
    this.expandedProcs.update(expanded => ({
      ...expanded,
      [procId]: !expanded[procId]
    }));
  }

  openArticleById(id: number) {
    this.sidebarService.open(id);

    this.statisticsService.saveStatistics({
      usuarioId: 1,
      estadisticaPantallaId: 3,
      articuloId: id,
      prompt: '',
      resultados: 0
    }).subscribe();
  }
}


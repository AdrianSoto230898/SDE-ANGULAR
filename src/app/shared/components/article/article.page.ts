import { Component, effect, inject, OnInit, Signal, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SidebarService } from '../../../core/services/shared/sidebar/sidebar.service';
import { StatisticsService } from '../../../core/services/shared/statistics/statistics.service';
import { MainService } from '../../../features/main/services/main.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.page.html',
  styleUrls: ['./article.page.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class ArticlePage implements OnInit {
  private sidebarService = inject(SidebarService);
  private mainService = inject(MainService);
  private route = inject(ActivatedRoute);
  private statisticsService = inject(StatisticsService);

  isLoading = signal(true);

  articuloId = 0;
  articulo: any[] = [];

  constructor() {
    effect(() => {
      if (this.sidebarService.getCurrentArticleId() > 0) {
        this.getCurrentArticleId(this.sidebarService.getCurrentArticleId());
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const parsedId = Number(id);
        if (!isNaN(parsedId) && parsedId > 0) {
          // Carga el articulo y guarda la estadística
          this.getCurrentArticleId(parsedId);
          this.savestatistics();
        }
      }
    });
  }

  getCurrentArticleId(id: number): void {
    this.articuloId = id;
    this.isLoading.set(true);
  
    this.mainService.getById(id).subscribe({
      next: (response) => {
 
        this.articulo = [response.data];
        this.isLoading.set(false);
      },
      error: (err) => {
        //console.error('Error al obtener el artículo:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Guarda en la estadística - 9 = Artículo Externo
  savestatistics(){
    this.statisticsService.saveStatistics({
      usuarioId: 1,              
      estadisticaPantallaId: 9,
      articuloId: this.articuloId,
      prompt: '',
      resultados: 0,
    }).subscribe({
      next: (resp) => console.log('Estadística registrada', resp),
      error: (err) => console.error('Error registrando estadística', err)
    });
  }

}

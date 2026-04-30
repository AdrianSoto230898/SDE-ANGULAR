import { Component, computed, DestroyRef, effect, EffectRef, ElementRef, inject, input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SidebarService } from '../../../../core/services/shared/sidebar/sidebar.service';
import { StatisticsService } from '../../../../core/services/shared/statistics/statistics.service';
import { formatTimestamp } from '../../../../core/utils/time-utils';
import { Subscription } from 'rxjs';
import { gsap } from 'gsap';

@Component({
  selector: 'app-chat-ai',
  templateUrl: './chat-ai.page.html',
  standalone: true,
  imports: [FormsModule]
})
export class ChatAiPage implements OnInit, OnDestroy {
  public sidebarService = inject(SidebarService);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private statisticsService = inject(StatisticsService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('geminiBorder') geminiBorder?: ElementRef<HTMLDivElement>;
  private borderTl: any;
  
  id = input<number>();
  prompt = input<string>();
  text = input('');
  type = input<'text' | 'html' | 'article' | 'grouped-articles'>('text');

  articles = input<{ id: number; titulo: string }[]>();

  isLoading = input<boolean>(false);

  ts = input<number | string | Date | undefined>();
  timeMode = input<'12' | '24'>('12');

  // Se convierte la fecha a string
  timeStr = computed(() => formatTimestamp(this.ts(), this.timeMode()));

  constructor() {
    effect(() => {
      if (this.isLoading()) {
        // Esperar un tick para asegurarse de que geminiLoader existe
        setTimeout(() => this.startLoader(), 0);
      } else {
        setTimeout(() => {
          this.stopLoader();
        }, 400);
      }
    });
  }
  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.stopLoader();
  }

  ngOnInit() {

  }

  openArticleById(id: number) {
    this.sidebarService.open(id);

    this.statisticsService.saveStatistics({
      usuarioId: 1,
      estadisticaPantallaId: 3,
      articuloId: id,
      prompt: this.prompt(),
      resultados: 0
    }).subscribe();
  }

  private startLoader() {
    if (!this.geminiBorder) return;
    const el = this.geminiBorder.nativeElement;
  
    gsap.set(el, { display: 'block', rotate: 0, transformOrigin: '50% 50%' });
    gsap.killTweensOf(el);
  
    this.borderTl = gsap.to(el, {
      rotate: '+=360',
      duration: 1,
      ease: 'none',
      repeat: -1
    });
  }
  
  private stopLoader() {
    if (!this.geminiBorder) return;
    const el = this.geminiBorder.nativeElement;
  
    const currentRotation = ((gsap.getProperty(el, 'rotate') as number) % 360 + 360) % 360;
    gsap.killTweensOf(el);
  
    const degreesLeft = 360 - currentRotation;
  
    gsap.to(el, {
      rotate: `+=${degreesLeft}`,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(el, { display: 'none' }); // ✅ esto ya no retorna nada
      }
    });
  }
  

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}



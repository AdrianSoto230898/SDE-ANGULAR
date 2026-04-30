import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { gsap } from 'gsap';

import { register } from 'swiper/element/bundle';

import { environment } from '../../../../../environments/environment';
import { AnimationService } from '../../../../core/services/ui/animations/animation.service';
import { LoadingService } from '../../../../core/services/ui/loading/loading.service';
import { AuthService } from '../../services/auth.service';

register();

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit, AfterViewInit, OnDestroy {
  msgErrorLogIn: string | null = null;
  isLoading = signal(false);
  currentYear = new Date().getFullYear();
  currentSlide = signal(0);

  slides = [
    {
      image: 'assets/images/bg/bg-1.jpg',
      title: 'Gestión centralizada para cada operación',
      subtitle: 'Control total',
      badges: ['Eficiencia', 'Seguridad']
    },
    {
      image: 'assets/images/bg/bg-5.jpg',
      title: 'Acceso centralizado a la información clave',
      subtitle: 'Visión unificada',
      badges: ['Conectividad', 'Trazabilidad']
    },
    {
      image: 'assets/images/bg/bg-6.jpg',
      title: 'Protección confiable para cada documento',
      subtitle: 'Seguridad reforzada',
      badges: ['Respaldo', 'Confianza']
    }
  ];

  readonly http = inject(HttpClient);
  readonly loadingService = inject(LoadingService);
  private readonly msalService = inject(MsalService);
  private readonly animationService = inject(AnimationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  readonly appBrand = environment.APP_BRAND;

  @ViewChild('swiperEl') swiperEl!: ElementRef;
  @ViewChildren('animation') animation!: QueryList<ElementRef>;
  @ViewChildren('animationTwo') animationTwo!: QueryList<ElementRef>;

  ngOnDestroy(): void {
    this.animationService.clearAnimations();
  }

  /** Animación GSAP: stagger de cada hijo del slide-content */
  private animateSlideContent(swiperInstance: any): void {
    const activeSlide = swiperInstance.slides?.[swiperInstance.activeIndex];
    if (!activeSlide) return;

    const content = activeSlide.querySelector('.slide-content');
    if (!content) return;

    const children = Array.from(content.children) as HTMLElement[];
    children.forEach(child => gsap.killTweensOf(child));

    gsap.fromTo(
      children,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.15
      }
    );
  }

  private swiperReady = false;

  private initSwiper(): void {
    const el = this.swiperEl?.nativeElement;
    if (!el) return;

    Object.assign(el, {
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 800,
      allowTouchMove: false,
      observer: true,
      observeParents: true
    });

    el.initialize();

    el.addEventListener('swiperslidechange', () => {
      if (!this.swiperReady) return;

      const swiper = el.swiper;
      if (!swiper) return;

      this.ngZone.run(() => {
        this.currentSlide.set(swiper.realIndex);
      });
      this.animateSlideContent(swiper);
    });

    setTimeout(() => {
      this.swiperReady = true;
      if (el.swiper) {
        this.animateSlideContent(el.swiper);

        // Watchdog: si el autoplay se detiene, reiniciarlo
        setInterval(() => {
          const swiper = el.swiper;
          if (swiper && swiper.autoplay && !swiper.autoplay.running) {
            swiper.autoplay.start();
          }
        }, 6000);
      }
    }, 400);
  }

  ngOnInit(): void {
    this.isLoading.set(true);

    this.msalService.handleRedirectObservable().subscribe({
      next: async (result: AuthenticationResult | null) => {
        if (!result?.accessToken) {
          this.isLoading.set(false);
          return;
        }

        try {
          const email = result.account?.username ?? '';
          const displayName = result.account?.name ?? '';

          const claims = result.account?.idTokenClaims as Record<string, any> | undefined;
          const siglaRed = claims?.['samaccountname'] || claims?.['onpremisessamaccountname'] || '';

          const payload = {
            token: result.accessToken,
            tokenApi: result.accessToken,
            tokenId: result.idToken,
            sigla: siglaRed,
            expiresOn: result.expiresOn?.toISOString() ?? '',
            displayName,
            mail: email,
            avatar: '',
            permissions: [],
            sdeSession: null
          };

          await this.authService.saveUserData(environment.AZURE_AD, payload);
          await this.router.navigate(['/documents']);
        } catch (error) {
          console.error('Error autenticando en SDE:', error);
          this.msgErrorLogIn = 'Ocurrio un error inesperado durante el inicio de sesion.';
        } finally {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.msgErrorLogIn = 'Ocurrio un error inesperado durante el inicio de sesion.';
      }
    });
  }

  siglaFromMdw(userName: string): string {
    return userName.split('\\').pop() ?? userName;
  }

  ngAfterViewInit(): void {
    this.animationService.animateElementsBottomTop(this.animation);
    this.animationService.animateElementsTopBottom(this.animationTwo);

    setTimeout(() => this.initSwiper(), 50);
  }

  goToSlide(index: number): void {
    const el = this.swiperEl?.nativeElement;
    if (el?.swiper) {
      el.swiper.slideToLoop(index);
    }
  }

  login(): void {
    this.isLoading.set(true);
    this.msalService.loginRedirect();
  }
}
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, Renderer2, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../models/user/user.model';
import { AuthService } from '../../../features/access/services/auth.service';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { environment } from '../../../../environments/environment.development';
import { AccountInfo, InteractionStatus } from '@azure/msal-browser';
import { catchError, filter, firstValueFrom, of, skip, take, timeout } from 'rxjs';
import { LoadingService } from '../../../core/services/ui/loading/loading.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private renderer = inject(Renderer2);
  private msalService = inject(MsalService);
  private router = inject(Router);
  private msalBroadcast = inject(MsalBroadcastService);
  private loadingService = inject(LoadingService);

  user: User | any;

  displayName = '';
  thumbnailPhoto = ''
  userProfile: any;
  isDarkMode: boolean = false;
  isOpen = false;
  isLoggingOut = false;

  constructor() {
    // Verificar si el modo oscuro está habilitado al cargar la página
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
      this.isDarkMode = true;
    }
  }

  async ngOnInit(): Promise<void> {
    await this.getProfileUser();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isOpen = false;
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark');
      localStorage.setItem('darkMode', 'enabled');
    } else {
      this.renderer.removeClass(document.body, 'dark');
      localStorage.setItem('darkMode', 'disabled');
    }
  }

  async getProfileUser() {
    this.user = await this.authService.getProfile();
  }

  /** Cierra sesión de forma robusta y muestra loader */
  async logout(): Promise<void> {
    this.loadingService.show();

    try {
      /* 0. Inicialización MSAL (por si acaso) */
      await firstValueFrom(this.msalService.initialize());

      /* 1. Cuenta → account */
      const email = this.user?.mail ?? null;
      const account: AccountInfo | undefined =
        email ? this.msalService.instance.getAccountByUsername(email) ?? undefined
          : undefined;

      /* 2. Comprueba si hay interacción en curso */
      const currentStatus = await firstValueFrom(
        this.msalBroadcast.inProgress$.pipe(take(1))
      );

      if (currentStatus !== InteractionStatus.None) {
        await firstValueFrom(
          this.msalBroadcast.inProgress$.pipe(
            skip(1),
            filter(st => st === InteractionStatus.None),
            take(1),
            timeout({ first: 5000 }),
            catchError(() => of(InteractionStatus.None))
          )
        );
      }

      /* 3. Logout */
      await firstValueFrom(
        this.msalService.logoutRedirect({
          account,
          logoutHint: email ?? undefined,
          postLogoutRedirectUri: environment.AZURE_CONFIG.postLogoutRedirectUri
        })
      );

      /* No ponemos isLoggingOut = false porque la app redirige 👆  */
    } catch (err) {
      console.error('Logout falló → fallback', err);
      this.fallbackHardLogout();  // terminará recargando la app
    } finally {
      // Si por cualquier razón seguimos en la misma página, ocultamos el loader
      // this.isLoggingOut = false;
      this.loadingService.hide();
    }
  }

  /* Fuera del servicio o como método privado */
  fallbackHardLogout(): void {
    localStorage.removeItem(environment.AZURE_AD);          // tu propia clave
    window.location.assign(environment.AZURE_CONFIG.postLogoutRedirectUri);
  }


}

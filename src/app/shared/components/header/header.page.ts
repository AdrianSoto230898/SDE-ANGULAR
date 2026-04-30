import { Component, ElementRef, HostListener, inject, OnInit, output, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from '../../../features/access/services/auth.service';
import { User } from '../../models/user/user.model';


@Component({
  selector: 'app-header',
  templateUrl: './header.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class HeaderPage implements OnInit {
  private authService = inject(AuthService);
  private renderer = inject(Renderer2);
  private msalService = inject(MsalService);
  private elRef = inject(ElementRef);

  user: User | any;

  displayName = '';
  thumbnailPhoto = ''
  userProfile: any;
  isDarkMode: boolean = false;
  isOpen = false;


  toggleMenu = output();
  constructor() {
    // Verificar si el modo oscuro está habilitado al cargar la página
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
      this.isDarkMode = true;
    }
  }

  ngOnInit(): void {
    this.getProfileUser();
  }


  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside) {
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

  async logOut() {
    // 1️⃣ Limpia la sesión local
    this.authService.logout();

    // 2️⃣ Asegura que MSAL este inicializado antes de llamar cualquier API
    try {
      await this.msalService.instance.initialize();
      await this.msalService.instance.logoutRedirect();
    } catch (e) {
      console.warn('MSAL logout error:', e);
    }
  }


  onToggle() {
    this.toggleMenu.emit();
  }

}

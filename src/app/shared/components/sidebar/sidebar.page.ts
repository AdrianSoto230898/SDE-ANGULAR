import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

import { MenuService } from '../../../core/services/shared/menu/menu.service';
import { AuthService } from '../../../features/access/services/auth.service';
import { User } from '../../models/user/user.model';

type MenuItem = {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  exact?: boolean;
  base?: string;
  children?: MenuItem[];
};

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.page.html',
  standalone: true,
  imports: [FormsModule, RouterModule]
})
export class SidebarPage implements OnInit {
  private readonly authService = inject(AuthService);
  readonly menuService = inject(MenuService);
  readonly router = inject(Router);

  readonly configGroup = { id: 'config' };
  readonly documentsGroup = { id: 'documents' }; // 👈 AGRÉGALO AQUÍ
  openId: string | null = null;

  menu: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ph ph-house', path: '/main/dashboard' },
    { id: 'documentos', label: 'Documentos', icon: 'ph ph-files', path: '/documents' },
    { id: 'plantillas', label: 'Plantillas', icon: 'ph ph-note-blank', path: '/glossary' },
    {
      id: 'config',
      label: 'Configuracion',
      icon: 'ph ph-gear',
      base: '/configuration',
      children: [
        { id: 'art-list', label: 'Lista de articulos', icon: 'ph ph-list', path: '/configuration/list' },
        { id: 'art-new', label: 'Crear articulo', icon: 'ph ph-file-plus', path: '/configuration/form', exact: true }
      ]
    },
    { id: 'admin', label: 'Admin', icon: 'ph ph-users-three', path: '/processes' },
    { id: 'permisos', label: 'Permisos', icon: 'ph ph-shield-check', path: '/voice-assistant' },
    { id: 'bitacora', label: 'Bitacora', icon: 'ph ph-book-open', path: '/processes' },
    { id: 'planeamiento', label: 'Planeamiento', icon: 'ph ph-calendar-dots', path: '/processes' }
  ];

  private readonly lsKey = 'sidebar.openGroups';
  openGroups: Record<string, boolean> = {};

  readonly currentUrl = signal(this.router.url);
  readonly user = signal<User | null>(null);

  ngOnInit(): void {
    this.getProfileUser();
    this.loadOpenGroups();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }

  closeMenu() {
    this.menuService.close();
  }

  goTo(url: string) {
    this.closeMenu();
    this.router.navigateByUrl(url);
  }

  private loadOpenGroups() {
    try {
      this.openGroups = JSON.parse(localStorage.getItem(this.lsKey) || '{}') || {};
    } catch {
      this.openGroups = {};
    }
  }

  async getProfileUser() {
    this.user.set(await this.authService.getProfile());
  }

  isGroupActive(): boolean {
    const childs = ['/configuration/list', '/configuration/form'];
    return childs.some((path) => this.router.isActive(path, {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    }));
  }

  isOpen(group: { id: string }) {
    return this.openId === group.id || this.isGroupActive();
  }

  toggle(id: string) {
    this.openId = this.openId === id ? null : id;
  }
}
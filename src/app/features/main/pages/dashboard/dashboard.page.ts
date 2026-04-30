import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../access/services/auth.service';
import { CustomButtonComponent } from '../../../../shared/components/ui-elements/custom-button/custom-button.component';

type QuickCard = {
  id: string;
  label: string;
  description: string;
  icon: string;
  path: string;
  colorToken: string;
  iconColor: string;
};

type ActivityItem = {
  id: number;
  label: string;
  time: string;
  icon: string;
  bgColor: string;
  iconColor: string;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomButtonComponent]
})
export class DashboardPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly userName = signal('Usuario');
  readonly currentDate = signal(this.formatDate());

  readonly quickCards: QuickCard[] = [
    {
      id: 'docs',
      label: 'Documentos',
      description: 'Consulta y gestion de documentos electronicos.',
      icon: 'ph ph-files',
      path: '/documents',
      colorToken: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      id: 'plantillas',
      label: 'Plantillas',
      description: 'Formatos estandar y plantillas del sistema.',
      icon: 'ph ph-note-blank',
      path: '/glossary',
      colorToken: 'bg-info/10',
      iconColor: 'text-info'
    },
    {
      id: 'configuration',
      label: 'Configuracion',
      description: 'Gestion de articulos y parametros del sistema.',
      icon: 'ph ph-gear',
      path: '/configuration/list',
      colorToken: 'bg-warning/10',
      iconColor: 'text-warning'
    },
    {
      id: 'admin',
      label: 'Admin',
      description: 'Gestion de usuarios, roles y permisos.',
      icon: 'ph ph-users-three',
      path: '/processes',
      colorToken: 'bg-success/10',
      iconColor: 'text-success'
    }
  ];

  readonly recentActivity: ActivityItem[] = [
    {
      id: 1,
      label: 'Documento actualizado: Politica de envios',
      time: 'Hace 10 min',
      icon: 'ph ph-file-text',
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      id: 2,
      label: 'Nuevo articulo creado: Addin B2B',
      time: 'Hace 1 hora',
      icon: 'ph ph-file-plus',
      bgColor: 'bg-success/10',
      iconColor: 'text-success'
    },
    {
      id: 3,
      label: 'Configuracion de permisos actualizada',
      time: 'Hace 3 horas',
      icon: 'ph ph-shield-check',
      bgColor: 'bg-info/10',
      iconColor: 'text-info'
    },
    {
      id: 4,
      label: 'Plantilla de entregas modificada',
      time: 'Ayer',
      icon: 'ph ph-note-blank',
      bgColor: 'bg-warning/10',
      iconColor: 'text-warning'
    }
  ];

  ngOnInit() {
    this.loadUser();
  }

  private async loadUser() {
    try {
      const profile = await this.authService.getProfile();
      if (profile?.sdeSession?.name || profile?.nombre || profile?.name || profile?.displayName) {
        this.userName.set(profile.sdeSession?.name ?? profile.nombre ?? profile.name ?? profile.displayName ?? 'Usuario');
      }
    } catch {
      // mantiene el valor por defecto
    }
  }

  private formatDate(): string {
    return new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onChatClick(): void {
    this.router.navigate(['/documents']);
  }
}
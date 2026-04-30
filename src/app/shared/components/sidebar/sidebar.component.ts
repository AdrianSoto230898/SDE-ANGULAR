import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  constructor(private router: Router) {}

  // Control de grupos abiertos
  openGroups: Record<string, boolean> = {};

  // Nombres de grupos (puedes reutilizar)
  documentsGroup = 'documents';
  configGroup = 'config';

  toggle(group: string) {
    this.openGroups[group] = !this.openGroups[group];
  }

  isOpen(group: string): boolean {
    return !!this.openGroups[group];
  }

  ngOnInit() {
    // Auto expandir según ruta actual
    if (this.router.url.includes('/documents')) {
      this.openGroups[this.documentsGroup] = true;
    }

    if (this.router.url.includes('/configuration')) {
      this.openGroups[this.configGroup] = true;
    }
  }
}
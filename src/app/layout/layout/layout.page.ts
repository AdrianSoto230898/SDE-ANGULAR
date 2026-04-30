import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { MenuService } from '../../core/services/shared/menu/menu.service';
import { SidebarService } from '../../core/services/shared/sidebar/sidebar.service';
import { HeaderPage } from '../../shared/components/header/header.page';
import { SidebarPage } from '../../shared/components/sidebar/sidebar.page';
import { ArticlePage } from '../../shared/components/article/article.page';

@Component({
  selector: 'app-layout-page',
  templateUrl: './layout.page.html',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, HeaderPage, ArticlePage, SidebarPage]
})
export class LayoutPagePage implements OnInit {
  sidebarService = inject(SidebarService);
  menuService = inject(MenuService);


  user = {
    name: 'John Doe',
    avatar: 'https://ionicframework.com/docs/demos/api/avatar/avatar.svg',
    mail: 'jhondoe@ternium.com.mx'
  };

  constructor() {
    effect(() => {
    });
  }

  ngOnInit() {
  }

  get menuCollapsed() {
    return this.menuService.menuCollapsed();
  }

  toggleMenu() {
    this.menuService.toggle();
  }

}

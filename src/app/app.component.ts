import { Component, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './shared/components/loading/loading.component';


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, LoadingComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  isDarkMode: boolean = false;

  constructor(private renderer: Renderer2) {
    // Verificar si el modo oscuro está habilitado al cargar la página
    const darkMode = localStorage.getItem('darkMode');

    if (darkMode === 'enabled') {
      this.isDarkMode = true;
      this.renderer.addClass(document.body, 'dark');
    }
  }

}

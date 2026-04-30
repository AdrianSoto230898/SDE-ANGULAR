import { Component, computed, effect, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/ui/loading/loading.service';



@Component({
    selector: 'app-loading',
    imports: [],
    templateUrl: './loading.component.html',
    styleUrl: './loading.component.scss'
})
export class LoadingComponent {
   // Inyección del servicio
   public loadingService = inject(LoadingService);

   constructor() {
  }
}

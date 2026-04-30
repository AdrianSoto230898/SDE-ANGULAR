import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-denied',
    imports: [RouterModule],
    templateUrl: './denied.component.html',
    styleUrl: './denied.component.scss'
})
export class DeniedComponent {
  public router = inject(Router);

  redirectToLogin(): void {
    this.router.navigate(['/access'])
  }
}

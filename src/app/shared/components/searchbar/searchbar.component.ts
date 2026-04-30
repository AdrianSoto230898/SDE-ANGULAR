import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-searchbar',
    imports: [],
    templateUrl: './searchbar.component.html',
    styleUrl: './searchbar.component.scss'
})
export class SearchbarComponent {

  private router = inject(Router);

  navigateSearch(){
    this.router.navigate(['/search'])
  }

}

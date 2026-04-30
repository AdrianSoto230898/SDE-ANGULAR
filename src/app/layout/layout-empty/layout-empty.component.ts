import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
    selector: 'app-layout-empty',
    imports: [RouterOutlet, NavbarComponent],
    templateUrl: './layout-empty.component.html',
    styleUrl: './layout-empty.component.scss'
})
export class LayoutEmptyComponent {

}

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

import { MediaQueryService } from '../../core/services/ui/media/media.service';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
    selector: 'app-layout-base',
    imports: [
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    ToastComponent
],
    templateUrl: './layout-base.component.html',
    styleUrl: './layout-base.component.scss'
})

export class LayoutBaseComponent implements OnInit, OnDestroy {

  public mediaService = inject(MediaQueryService);
  public isMobile: boolean = false;
  private subscription: Subscription = new Subscription();

  openView = false;
  openFilter = false;
  view = 'Gestional';

  ngOnInit(): void {
    this.subscription.add(
      this.mediaService.mediaQuery('max', 'sm').subscribe(isMobile => {
        this.isMobile = isMobile;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}

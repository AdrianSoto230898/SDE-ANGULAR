import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
 menuCollapsed = signal(true);

  open() {
    this.menuCollapsed.set(false);
  }

  close() {
    this.menuCollapsed.set(true);
  }

  toggle() {
    this.menuCollapsed.update(v => !v);
  }
}

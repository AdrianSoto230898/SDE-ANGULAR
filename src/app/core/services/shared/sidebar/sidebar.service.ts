import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isOpen = signal(false);
  private currentArticleId = signal<number>(0);

  open(id: any) {
    this.isOpen.set(true);
    this.currentArticleId.set(id);
  }

  close() {
    this.isOpen.set(false);
    this.currentArticleId.set(0);
  }

  isArticleSidebarOpen() {
    return this.isOpen();
  }

  getCurrentArticleId() {
    return this.currentArticleId();
  }
}

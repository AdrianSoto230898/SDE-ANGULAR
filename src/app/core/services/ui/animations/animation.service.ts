import { Injectable } from '@angular/core';
import { gsap } from 'gsap';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private animations: gsap.core.Tween[] = []; // Almacena las animaciones activas

  public animateElementsSpeed(refHtml: any): void {
    setTimeout(() => {
      const elements = refHtml.toArray().map((el: { nativeElement: any }) => el.nativeElement);
      const animation = gsap.from(elements, {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 0.2,
        ease: 'power3.easeOut',
      });

      this.animations.push(animation); // 📌 Guardamos la animación
    });
  }

  public animateElementsTopBottom(refHtml: any): void {
    const elements = refHtml.toArray().map((el: { nativeElement: any }) => el.nativeElement);
    const animation = gsap.from(elements, {
      opacity: 0,
      y: -30,
      stagger: 0.05,
      duration: 0.2,
      ease: 'power3.easeOut',
    });

    this.animations.push(animation);
  }

  public animateElementsBottomTop(refHtml: any): void {
    const elements = refHtml.toArray().map((el: { nativeElement: any }) => el.nativeElement);
    const animation = gsap.from(elements, {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.3,
      ease: 'power3.easeOut',
    });

    this.animations.push(animation);
  }

  /**
   * Método para limpiar todas las animaciones activas y evitar fugas de memoria.
   * Debe llamarse en ngOnDestroy en los componentes que usan este servicio.
   */
  public clearAnimations(): void {
    this.animations.forEach((anim, index) => {
      anim.kill(); // Eliminar la animación activa
    });

    this.animations = []; // Vaciar el array
  }
}

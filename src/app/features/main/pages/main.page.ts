import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatAiPage } from './chat-ai/chat-ai.page';
import { ChatUserPage } from './chat-user/chat-user.page';
import { MainService } from '../services/main.service';
import Fuse from 'fuse.js';
import gsap from 'gsap';
import { AnimationService } from '../../../core/services/ui/animations/animation.service';
import { StatisticsService } from '../../../core/services/shared/statistics/statistics.service';
import { SidebarService } from '../../../core/services/shared/sidebar/sidebar.service';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

// Tipos para los mensajes
export type ChatMessage = {
  id?: number;
  prompt: string;
  from: 'user' | 'ai';
  text: string;
  type?: 'text' | 'html' | 'article' | 'grouped-articles';
  articles?: {
    id: number;
    titulo: string;
  }[];
  isLoading?: boolean;
  ts?: number | string | Date;
};

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatUserPage, ChatAiPage, RouterModule]
})
export class MainPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('animation') animation: QueryList<ElementRef> | any;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('ph') placeholderEl!: ElementRef<HTMLElement>;

  // Animación de los placeholders
  animatedPlaceholder = signal('Suscripción de Mensajería');
  private placeholders = ['Suscripción de Mensajería', 'Instalación de Addin B2B', 'Generación de Entregas'];
  private currentIndex = 0;

  private animationService = inject(AnimationService);
  statisticsService = inject(StatisticsService);
  sidebarService = inject(SidebarService);
  mainService = inject(MainService);
  selectedArticle = signal<{ title: string; description: string; } | null>(null);

  messages = signal<ChatMessage[]>([]);
  userInput = signal('');
  loading = signal(false);

  messagesElement?: ElementRef<HTMLDivElement>;
  articulos: any[] = [];

  fuse: Fuse<any> | any;

  private streamSub?: Subscription;

  constructor() { }

  // Animaciones con gsap
  ngAfterViewInit(): void {
    this.animationService.animateElementsBottomTop(this.animation);
    this.cyclePlaceholders();
  }

  // Obtener todos los articulos
  ngOnInit() {
    this.getArticles();
  }

  // Limpiar las animaciones
  ngOnDestroy(): void {
    this.animationService.clearAnimations();
    this.streamSub?.unsubscribe();
  }

  // obtener todos los articulos
  getArticles() {
    try {
      this.mainService.getAllArticulos().subscribe((response: any) => {
        this.articulos = response.data;
        // Puedes instanciar Fuse aquí si quieres mantenerlo como propiedad
        this.fuse = new Fuse(response.data, {
          keys: ['titulo', 'keywords'],
          threshold: 0.35
        });
      });
    } catch (error) { }
  }

  // Enviar el mensaje
  // sendMessage() {
  //   const message = this.userInput().trim();
  //   if (!message) return;

  //   this.messages.update((msgs) => [...msgs, { from: 'user', prompt: message, text: message, type: 'text', ts: Date.now() }]);
  //   setTimeout(() => this.scrollToBottom(), 50);
  //   this.userInput.set('');
  //   this.loading.set(true);

  //   setTimeout(() => {
  //     this.loading.set(false);
  //     const results = this.fuse.search(message).slice(0, 5); // Los 5 primeros resultados
  //     if (results.length) {
  //       const articleList = results.map((r: { item: { articuloId: any; titulo: any; }; }) => ({
  //         id: r.item.articuloId,
  //         titulo: r.item.titulo
  //       }));

  //       const aiMessage: ChatMessage = {
  //         prompt: message,
  //         from: 'ai',
  //         type: 'grouped-articles',
  //         text: `He encontrado ${results.length} resultado${results.length > 1 ? 's' : ''} para tu búsqueda.`,
  //         articles: articleList,
  //         ts: Date.now()
  //       };

  //       this.messages.update((msgs) => [...msgs, aiMessage]);
  //       this.savestatistics(null, message, results.length);
  //     } else {

  //       const fallbackResponses = [
  //         `Lo siento, no encontré información relacionada con: "${message}". Intenta usar palabras clave diferentes o más específicas.`,
  //         `No he podido encontrar resultados para: "${message}". Tal vez puedas reformular tu consulta o probar con otros términos.`,
  //         `No se encontraron coincidencias para: "${message}". Asegúrate de que la ortografía sea correcta o intenta con un tema más general.`,
  //         `No hay resultados disponibles para: "${message}". ¿Podrías probar con una consulta distinta o más precisa?`,
  //         `Búsqueda sin resultados para: "${message}". Si el tema es reciente o muy específico, podrías intentar con otras palabras clave.`
  //       ];

  //       const randomText = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

  //       this.messages.update((msgs) => [
  //         ...msgs,
  //         {
  //           prompt: message,
  //           from: 'ai',
  //           type: 'text',
  //           text: randomText
  //         }
  //       ]);

  //       this.savestatistics(null, message, 0);
  //     }

  //     setTimeout(() => this.scrollToBottom(), 150);
  //   }, 400);
  // }

  // Guarda en la estadística
  savestatistics(articuloId?: any, prompt?: string, resultados?: number) {
    this.statisticsService.saveStatistics({
      usuarioId: 1,
      estadisticaPantallaId: 3,
      articuloId,
      prompt,
      resultados
    }).subscribe({
      next: (resp) => {

      },
      error: (err) => {

      }
    });
  }

  // Posicionar el scroll al final
  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  // Animación de los placeholders
  private cyclePlaceholders() {
    const el = this.placeholderEl.nativeElement;

    // Colocamos el span abajo, invisible
    gsap.set(el, { yPercent: 100, opacity: 0 });
    const tl = gsap.timeline({ repeat: -1 });
    tl
      // ► Entrada: slide-up + fade-in
      .to(el, {
        yPercent: 0,
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
      })
      // ► Pausa visible 1.5 s
      .to({}, { duration: 1.5 })
      // ► Salida: slide-up (sigue subiendo) + fade-out
      .to(el, {
        yPercent: -100,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          // Cambiamos el texto cuando ya desapareció
          this.currentIndex = (this.currentIndex + 1) % this.placeholders.length;
          this.animatedPlaceholder.set(this.placeholders[this.currentIndex]);
          // Lo colocamos de nuevo abajo (listo para la siguiente vuelta)
          gsap.set(el, { yPercent: 100, opacity: 0 });
        },
      });
  }

  // Animación del input
  onInput(event: Event) {
    const v = (event.target as HTMLInputElement).value;
    this.userInput.set(v);
    if (v === '') {
      const el = this.placeholderEl.nativeElement;
      gsap.timeline()
        .set(el, { yPercent: 100, opacity: 0 })             // empieza abajo, oculto
        .to(el, {
          yPercent: 0,
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
        });
    }
  }

  // Enviar el mensaje
  sendMessageAI() {
    const message = this.userInput().trim();
    if (!message) return;

    // 1) Mensaje del usuario
    this.messages.update((msgs) => [
      ...msgs,
      { from: 'user', prompt: message, text: message, type: 'text', ts: Date.now() }
    ]);
    setTimeout(() => this.scrollToBottom(), 50);
    this.userInput.set('');
    this.loading.set(true);

    // 2) Buscar artículos locales con Fuse
    // const results = this.fuse?.search(message).slice(0, 5) ?? [];
    // if (results.length) {
    //   const articleList = results.map((r: { item: { articuloId: any; titulo: any } }) => ({
    //     id: r.item.articuloId,
    //     titulo: r.item.titulo
    //   }));

    //   const aiMessage: ChatMessage = {
    //     prompt: message,
    //     from: 'ai',
    //     type: 'grouped-articles',
    //     text: `He encontrado ${results.length} resultado${results.length > 1 ? 's' : ''} para tu búsqueda.`,
    //     articles: articleList,
    //     ts: Date.now()
    //   };

    //   this.messages.update((msgs) => [...msgs, aiMessage]);
    //   this.savestatistics(null, message, results.length);
    //   this.loading.set(false);
    //   setTimeout(() => this.scrollToBottom(), 150);
    //   return;
    // }

    // 3) Si no hay artículos → insertamos loader AI
    const aiMsg: ChatMessage = { from: 'ai', prompt: message, text: '', type: 'text', isLoading: true, ts: Date.now() };
    this.messages.update((msgs) => [...msgs, aiMsg]);

    // 4) Abrimos stream SSE
    this.streamSub = this.mainService.streamChatSse(message).subscribe({
      next: (chunk) => {
        // si sigue en loading, lo apagamos
        if (aiMsg.isLoading) {
          aiMsg.isLoading = false;
          aiMsg.text = '';
        }

        aiMsg.text += chunk;
        this.messages.update((msgs) => [...msgs]);
        this.scrollToBottom();

        // 🔹 animación con GSAP
        const container = this.messagesContainer.nativeElement;
        const lastMessage = container.querySelector('.chat-message:last-child');
        if (lastMessage) {
          gsap.fromTo(
            lastMessage,
            { opacity: 0.6, y: 2 },
            { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }
          );
        }
      },
      error: (_err) => {
        this.loading.set(false);
        this.streamSub?.unsubscribe();
      },
      complete: () => {
        this.loading.set(false);
        this.streamSub?.unsubscribe();

        // highlight cuando termine
        const container = this.messagesContainer.nativeElement;
        const lastMessage = container.querySelector('.chat-message:last-child');
        if (lastMessage) {
          gsap.fromTo(
            lastMessage,
            { backgroundColor: '#f9ac41' },
            { backgroundColor: 'transparent', duration: 1 }
          );
        }
      }
    });

    // 5) Guardamos estadística
    this.savestatistics(null, message, 0);
  }

}


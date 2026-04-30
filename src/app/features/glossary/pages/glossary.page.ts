import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlossaryTerm } from '../models/glossary.model';
import { GlosarioService } from '../services/glosario.service';
import Fuse from 'fuse.js';


@Component({
  selector: 'app-glossary',
  templateUrl: './glossary.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class GlossaryPage {
  private glosarioService = inject(GlosarioService);

  readonly alphabet = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
  readonly activeLetter = signal('A');
  readonly searchTerm = signal('');

  // Siempre usa el array final que pintas
  glossaryItems = signal<GlossaryTerm[]>([]);
  fuse: Fuse<GlossaryTerm> | null = null;

  ngOnInit() {
    this.getGlosario();
  }

  getGlosario() {
    this.glosarioService.getAll().subscribe(response => {

      // Mapea tu backend a GlossaryTerm si lo necesitas:
      const data = (response.data || []).map((item: any) => ({
        term: item.glosarioNombre || item.term,
        definition: item.contenidoSinFormato || item.definition,
        subtitle: item.areaNombre || item.subtitle || '', // o el campo correcto
        resources: item.keywords || item.resources || '',
        url: item.url,
        // otros campos según tu modelo
      }));
      this.glossaryItems.set(data);
      this.fuse = new Fuse(data, {
        keys: ['term', 'resources', 'definition', 'subtitle'],
        threshold: 0.33,
      });
    });
  }

  navigateToUrl(url: string): void {
    if (url && typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.updateSearch(value);
  }

  selectLetter(letter: string) {
    this.activeLetter.set(letter);
    this.closeAll();
    this.searchTerm.set('');
  }

  updateSearch(term: string) {
    this.searchTerm.set(term);
    this.closeAll();
  }

  toggleTerm(term: GlossaryTerm) {
    term.open = !term.open;

    // Forzar signal para refrescar la UI si es necesario (inmutable workaround)
    this.glossaryItems.update(arr => arr.map(t => (t === term ? { ...t } : t)));
  }

  closeAll() {
    this.glossaryItems.update(arr => arr.map(t => ({ ...t, open: false })));
  }

  // ------------- LOGICA DE FILTRADO FINAL ----------------
  readonly filteredTerms = computed(() => {
    const all = this.glossaryItems();
    const letter = this.activeLetter();
    const term = this.searchTerm().trim();
  
    // Si hay búsqueda:
    if (term.length > 0 && this.fuse) {
      // Si el filtro activo es "#", ignora el filtro por letra y solo busca por término
      if (letter === '#') {
        return this.fuse.search(term).map(result => result.item);
      }
      // Si no, busca y además filtra por la letra
      return this.fuse
        .search(term)
        .map(result => result.item)
        .filter(item => (item.term[0]?.toUpperCase() ?? '') === letter);
    }
  
    // Si NO hay búsqueda
    if (letter === '#') {
      // Mostrar todos los resultados
      return all;
    }
  
    // Si hay letra seleccionada distinta de "#"
    return all.filter(item => (item.term[0]?.toUpperCase() ?? '') === letter);
  });
  
}
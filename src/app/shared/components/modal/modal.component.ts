import { CommonModule } from "@angular/common";
import { Component, model, output, effect, input, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ModalService } from "../../../core/services/shared/modal/modal.service";

export interface MyModalOption {
  value: number | null;  // <-- antes era sólo `number`
  label?: string;
  name?: string;         // <-- Para aceptar 'name' si viene del backend
  description?: string;
  image?: string;
}


@Component({
    selector: 'app-modal',
    imports: [CommonModule, FormsModule],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss'
})
export class ModalComponent {
  public modalServide = inject(ModalService);
  // Animation
  // @ViewChildren('refAnime') refAnime: QueryList<ElementRef> | any;
  // public animationService = inject(AnimationService);

  // Controla la visibilidad del modal
  isVisible = model(false);

  // Activa el campo de busqueda en el modal
  search = model(false);
  searchQuery: string = '';
  searching = false;
  optionsFiltered: MyModalOption[] = [];

  // Título del modal
  title = model<string>('');

  // Lista de opciones recibidas
  //options = model<{ label: string; value: number; description?: string; image?: string }[]>([]);
  options = model<MyModalOption[]>([]);

  // Almacena el índice de la opción seleccionada
  selectedOption = model<number | null>(null);

  // Tamaño del modal
  size = model<string>('small');

  // Emite la opción seleccionada
  optionSelected = output<any>();

  optionsFilteredSkeleton = [1,2,3,4,5];

  // Emite al cancelar
  cancel = output<void>();

  // Emite al aceptar
  ok = output<void>();

  constructor() {
    // Usar un efecto para inicializar `optionsFiltered` cuando el modal se muestra
    effect(() => {
      if (this.isVisible()) {
        // Cargamos el arreglo real
        const original = this.options();
  
        // Agregamos un item “Ninguna” al inicio
        // const noneItem: MyModalOption = { value: 0, label: 'Ninguna' };
  
        // Insertar “Ninguna” + resto de elementos
        this.optionsFiltered = [...original];
      }
    });
  }

  // Metodo para filtrar la lista de opciones
  onSearch(): void {
    // Validar si el campo de búsqueda está vacío
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      // Si está vacío, no se realiza la búsqueda y se restablecen las opciones
      this.searching = false;
      this.optionsFiltered = this.options(); // Restablece a la lista completa o al estado inicial
      return;
    }
  
    // Si no está vacío, realizar la búsqueda
    this.searching = true;
  
    this.optionsFiltered = this.options().filter((item) =>
      item.label?.toLowerCase().includes(this.searchQuery.toLowerCase()) || item.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  // Selecciona una opción y la emite
  selectOption(index: number): void {
    const selectedItem = this.optionsFiltered[index]; // Obtiene el objeto seleccionado
    this.selectedOption.set(selectedItem.value); // Guarda el identificador único
    this.optionSelected.emit(selectedItem); // Emite el objeto seleccionado
  }

  cleanSearch() {
    this.searching = false;
    this.searchQuery = "";

    this.optionsFiltered = this.options();
  }

  // Maneja la acción de cancelar
  onCancel() {
    this.cancel.emit();
    this.isVisible.set(false);
  }

  // Maneja la acción de aceptar
  onOk() {
    if (this.selectedOption() !== null) {
      this.ok.emit();
      this.isVisible.set(false);
    }
  }
}

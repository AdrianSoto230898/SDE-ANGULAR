import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, HostListener, inject, Input } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CustomTableComponent } from '../custom-table/custom-table.component';

export interface MyOptionType {
  value: any;
  label?: string;  // opcional
  name?: string;   // opcional
}

@Component({
  selector: 'app-custom-select-value',
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-select-value.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectValueComponent),
      multi: true
    }
  ]
})
export class CustomSelectValueComponent {
  @Input() options: MyOptionType[] = [];
  @Input() placeholder: string = 'Seleccione...';

  disabled: boolean = false;

  private elRef = inject(ElementRef);

  // Para mostrar la etiqueta seleccionada
  selectedLabel: string = '';
  // Control del dropdown
  openDropdown = false;
  // Buscador
  searchTerm = '';

  // Internamente, esta será la "value" que reportamos al padre
  private _value: any | null = null;

  // Métodos de ControlValueAccessor
  onChange = (_: any) => { };
  onTouched = () => { };

  // HostListener que escucha cualquier clic en el documento
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target)) {
      this.openDropdown = false;
    }
  }

  writeValue(value: any): void {
    if (value && typeof value === 'object') {
      this._value = value.value;
      this.selectedLabel = value.label || '';
    } else {
      this._value = value;
      const found = this.options.find(opt => opt.value === value);
      this.selectedLabel = found?.label || found?.name || '';
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Implementación de setDisabledState
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
 * Retorna true si la opción que se está iterando es la que
 * actualmente está seleccionada en el componente.
 */
  isOptionSelected(opt: MyOptionType) {
    return this._value === opt.value;
  }

  /**
   * Abre/cierra el dropdown manualmente
   */
  // Modifica toggleDropdown para que no abra si está deshabilitado
  toggleDropdown(force?: boolean) {
    if (this.disabled) {
      return; // No hace nada si el componente está deshabilitado
    }
    this.onTouched();
    this.openDropdown = force !== undefined ? force : !this.openDropdown;
    if (this.openDropdown) {
      this.searchTerm = '';
    }
  }

  /**
   * Retorna las opciones filtradas según `searchTerm`
   */
  get filteredOptions(): MyOptionType[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.options;
    }
    return this.options.filter(opt => {
      const label = opt.label?.toString().toLowerCase() ?? '';
      const name = opt.name?.toString().toLowerCase() ?? '';
      const valueStr = String(opt.value).toLowerCase();
      return label.includes(term)
        || name.includes(term)
        || valueStr.includes(term);
    });
  }

  /**
 * Cuando seleccionas una opción
 */
  selectOption(option: MyOptionType) {
    this._value = option.value;
    this.selectedLabel = option.label || option.name || '';

    // Emitimos un objeto con ambos valores
    this.onChange({ value: option.value, label: this.selectedLabel });

    this.toggleDropdown(false);
  }

  onClearSelected() {
    this._value = null;
    this.selectedLabel = '';
    // Avisar al padre que se limpió
    this.onChange(null);
    // Opcional: cierra el dropdown
    this.openDropdown = false;
  }
}


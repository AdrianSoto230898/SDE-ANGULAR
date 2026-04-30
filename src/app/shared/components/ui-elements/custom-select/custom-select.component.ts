import { Component, ElementRef, Input, OnInit, ViewChild, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';
import { CommonModule } from '@angular/common';

type MyOptionType = {
  value: number;
  label?: string;  // opcional
  name?: string;   // opcional
};

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  standalone: true,
  imports: [ModalComponent, CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ]
})
export class CustomSelectComponent implements ControlValueAccessor, OnInit {
  // Se agrega la referencia al componente ModalAlertPage
  @ViewChild(ModalComponent) modalAlert!: ModalComponent;
  @ViewChild('myModal', { static: false }) myModal!: ElementRef<HTMLDialogElement>;



  selectedOption: any = null;
  public selectedLabel: string = '';

  options = input<MyOptionType[]>([]);
  //options = model<{ label: string; value: number; description?: string; image?: string }[]>([]);
  placeholder = input<string>('');

  value: string = '';  // Valor seleccionado
  isDisabled: boolean = false;

  ngOnInit() {

  }

  // Funciones que Angular inyecta para manejar cambios y el estado touched
  onChange = (value: string) => { };
  onTouched = () => {
    this.showModal();
  };

  // Métodos de ControlValueAccessor
  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  preventOpen(event: MouseEvent) {
    // Evita que el select abra el menú nativo
    event.preventDefault();
    // Aquí si lo deseas, podrías abrir tu modal en vez:
    // this.showModal();
  }

  // Método que se ejecuta cuando cambia el valor del select
  changeValue(event: any): void {
    const value = event.target.value;
    this.value = value;
    this.onChange(value);  // Notifica al formulario del nuevo valor
  }

  // Mostrar el modal con opciones
  showModal() {
    // Se asignan los signals
    this.modalAlert.isVisible.set(true);
    this.modalAlert.search.set(true);
    this.modalAlert.title.set(this.placeholder());
    this.modalAlert.size.set('medium');

    // Abre el modal
    if (this.myModal) {
      this.myModal.nativeElement.showModal();
    }
  }

  // Manejar la selección de una opción
  onOptionSelected(option: { label: string; value: number; description?: string; image?: string }) {
    this.selectedOption = option;
  }

  // Manejar la acción de cancelar
  onCancel() {
    this.selectedOption = [];
    if (this.myModal) {
      this.myModal.nativeElement.close();
    }
  }

  // Manejar la acción de aceptar
  onOk() {
    this.modalAlert.isVisible.set(false);
  
    const selectedId = this.selectedOption.value;
    const selectedLbl = this.selectedOption.label ?? this.selectedOption.name ?? '';
  
    // Guardamos el ID en this.value
    this.value = selectedId.toString();
  
    // *Atención* aquí le estás enviando el *label* al padre
    this.onChange(selectedLbl); 
  
    // Guardas el label para mostrarlo dentro del mismo CustomSelect
    this.selectedLabel = selectedLbl;
  
    this.closeModal();
  }
  
  // Cerrar el modal
  closeModal(): void {
    if (this.myModal) {
      this.myModal.nativeElement.close();
    }
  }
}

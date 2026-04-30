import { CommonModule } from '@angular/common';
import { Component, forwardRef, input, model } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-custom-input',
    imports: [CommonModule],
    templateUrl: './custom-input.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomInputComponent),
            multi: true,
        },
    ]
})
export class CustomInputComponent implements ControlValueAccessor {
  placeholder = input<string>(''); 
  type = input<string>("text");
  value = model<string> ('');  // Acepta el valor desde el componente padre
  isDisabled = model<boolean> (false);  // Acepta el estado 'disabled' desde el componente padre
  icon = model<string> ('');

  onChange = (value: string) => {};
  onTouched = () => {};

  // Este método es llamado por Angular cuando el valor del formulario cambia
  writeValue(value: string): void {
    this.value.set(value);
  }

  // Registra una función que Angular llamará cuando el valor del input cambie
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Registra una función que Angular llamará cuando el input sea tocado
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Permite a Angular habilitar/deshabilitar el input
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  // Método que se llama cuando el valor del input cambia
  updateValue(event: any): void {
    this.value.set(event.target.value);
    this.onChange(this.value());  // Notifica el cambio a Angular
    this.onTouched();
  }
}

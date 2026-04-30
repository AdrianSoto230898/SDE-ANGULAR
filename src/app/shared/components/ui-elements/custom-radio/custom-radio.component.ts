import { Component, forwardRef, input, model } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-custom-radio',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './custom-radio.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomRadioComponent),
            multi: true
        }
    ]
})
export class CustomRadioComponent implements ControlValueAccessor {
    options = input<{ value: string | number | boolean, label: string }[]>([]);
    name = input<string>('radio-group');
    disabled = input<boolean>(false);

    // Internal state
    selectedValue = model<any>(null);
    isDisabled = false;

    // ControlValueAccessor functions
    onChange = (value: any) => { };
    onTouched = () => { };

    writeValue(value: any): void {
        if (value !== undefined) {
            this.selectedValue.set(value);
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    selectOption(value: any) {
        if (!this.disabled() && !this.isDisabled) {
            this.selectedValue.set(value);
            this.onChange(this.selectedValue());
            this.onTouched();
        }
    }
}

import { Component, forwardRef, input, model } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-custom-toggle',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './custom-toggle.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomToggleComponent),
            multi: true
        }
    ]
})
export class CustomToggleComponent implements ControlValueAccessor {
    label = input<string>('');
    disabled = input<boolean>(false);

    // Internal state
    checked = model<boolean>(false);
    focused = false;
    isDisabled = false;

    // ControlValueAccessor functions
    onChange = (value: boolean) => { };
    onTouched = () => { };

    writeValue(value: boolean): void {
        if (value !== undefined) {
            this.checked.set(value);
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

    toggle(event: Event) {
        event.preventDefault(); // prevent default browser checkbox behavior
        if (!this.disabled() && !this.isDisabled) {
            this.checked.update(v => !v);
            this.onChange(this.checked());
            this.onTouched();
        }
    }
}

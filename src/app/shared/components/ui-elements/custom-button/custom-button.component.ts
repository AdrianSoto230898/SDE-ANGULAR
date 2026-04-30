import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-custom-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './custom-button.component.html'
})
export class CustomButtonComponent {
    variant = input<'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'>('primary');
    size = input<'sm' | 'md' | 'lg'>('md');
    disabled = input<boolean>(false);
    loading = input<boolean>(false);
    icon = input<string>('');
    type = input<'button' | 'submit' | 'reset'>('button');
    loadingText = input<string>('Procesando...');

    clicked = output<void>();

    onClick(event: Event) {
        if (!this.disabled() && !this.loading()) {
            this.clicked.emit();
        } else {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    get buttonClasses(): string {
        let base = 'inline-flex items-center justify-center font-medium rounded-full font-semibold rounded-full  transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

        // Size variants
        switch (this.size()) {
            case 'sm': base += ' px-3 py-1.5 text-sm gap-1.5'; break;
            case 'md': base += ' px-6 py-2.5 text-sm gap-2'; break;
            case 'lg': base += ' px-6 py-4 text-sm gap-2.5'; break;
        }

        // Color variants
        switch (this.variant()) {
            case 'primary':
                base += ' bg-primary text-primary-content hover:brightness-90 focus:ring-primary/50';
                break;
            case 'secondary':
                base += ' bg-secondary text-secondary-content hover:bg-secondary-hover focus:ring-secondary/50';
                break;
            case 'outline':
                base += ' border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800';
                break;
            case 'ghost':
                base += ' text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800';
                break;
            case 'danger':
                base += ' bg-error text-error-content hover:bg-error-hover focus:ring-error/50';
                break;
        }

        return base;
    }
}

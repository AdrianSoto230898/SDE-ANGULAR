import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-custom-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './custom-card.component.html'
})
export class CustomCardComponent {
    padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
    bordered = input<boolean>(false);

    get cardClasses(): string {
        let base = 'flex flex-col bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden';

        if (this.bordered()) {
            base += ' border border-neutral-200 dark:border-neutral-800';
        }

        return base;
    }

    get bodyClasses(): string {
        switch (this.padding()) {
            case 'none': return 'p-0';
            case 'sm': return 'p-4';
            case 'md': return 'p-6';
            case 'lg': return 'p-8';
            default: return 'p-6';
        }
    }
}

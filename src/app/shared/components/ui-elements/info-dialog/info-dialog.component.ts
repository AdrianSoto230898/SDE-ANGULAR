
import { Component, ElementRef, input, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface InfoDialogData {
    title: string;
    description?: string;
    example?: string;
    notes?: string;
}

@Component({
    selector: 'app-info-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './info-dialog.component.html',
    styleUrl: './info-dialog.component.scss'
})
export class InfoDialogComponent {
    infoData = input<InfoDialogData>();

    // Using viewChild to access the dialog element
    infoModal = viewChild<ElementRef<HTMLDialogElement>>('infoModal');

    open() {
        this.infoModal()?.nativeElement.showModal();
    }

    close() {
        this.infoModal()?.nativeElement.close();
    }
}

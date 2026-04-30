import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-send-mail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 ESTE ES EL FIX
  templateUrl: './send-mail-modal.component.html'
})
export class SendMailModalComponent {

  @Input() visible = false;
  @Input() form: any;

  @Output() close = new EventEmitter<void>();
  @Output() accept = new EventEmitter<void>();
}
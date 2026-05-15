import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SendMailConfigResponse } from '../../models/popSend/popSend.model';

@Component({
  selector: 'app-send-mail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './send-mail-modal.component.html'
})
export class SendMailModalComponent implements OnChanges {

  @Input() visible = false;
  @Input() form: SendMailConfigResponse | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() accept = new EventEmitter<SendMailConfigResponse>();
  @Output() sendTypeChange = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    console.group('📧 SEND MAIL MODAL');

    if (changes['visible']) {
      console.log('👁️ Visible:', this.visible);
    }

    if (changes['form']) {
      console.log('📄 Form:', this.form);
    }

    console.groupEnd();
  }

  onSendTypeChange(): void {
    if (!this.form) {
      return;
    }

    console.group('🔄 SEND TYPE CHANGE');
    console.log('📌 Nuevo tipo:', this.form.tipodeEnvio);
    console.log('📄 Form actual:', this.form);
    console.groupEnd();

    this.sendTypeChange.emit(this.form.tipodeEnvio);
  }
}
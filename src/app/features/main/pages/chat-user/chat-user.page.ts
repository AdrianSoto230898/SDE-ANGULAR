import { Component, computed, input, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { formatTimestamp } from '../../../../core/utils/time-utils';


@Component({
  selector: 'app-chat-user',
  templateUrl: './chat-user.page.html',
  standalone: true,
  imports: [FormsModule]
})
export class ChatUserPage implements OnInit {
  text = input('');

  ts = input<number | string | Date | undefined>();
  timeMode = input<'12' | '24'>('24');

  // Se convierte la fecha a string
  timeStr = computed(() => formatTimestamp(this.ts(), this.timeMode()));

  constructor() { }

  ngOnInit() {
  }

}

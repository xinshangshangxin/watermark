import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

export interface MessageDialogData {
  title?: string;
  content?: string;
  okName?: string;
}

@Component({
  selector: 'app-dialog-message',
  templateUrl: './dialog-message.component.html',
  styleUrls: ['./dialog-message.component.scss'],
})
export class DialogMessageComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: MessageDialogData) {}

  ngOnInit() {}
}

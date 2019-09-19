import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';

import {
  DialogMessageComponent,
  MessageDialogData,
} from './dialog-message/dialog-message.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openMessage(data: MessageDialogData): Observable<void> {
    const dialogRef = this.dialog.open(DialogMessageComponent, {
      width: '250px',
      data: {
        okName: '确定',
        ...data,
      },
    });

    return dialogRef.afterClosed();
  }
}

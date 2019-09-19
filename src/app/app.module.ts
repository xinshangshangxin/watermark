import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSpinner } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColorPickerModule } from 'ngx-color-picker';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { DialogMessageComponent } from './dialog/dialog-message/dialog-message.component';

@NgModule({
  declarations: [AppComponent, DialogMessageComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    FormsModule,
    ColorPickerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [MatSpinner, DialogMessageComponent],
})
export class AppModule {}

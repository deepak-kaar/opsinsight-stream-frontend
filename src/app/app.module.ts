import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrimeNgModules } from './core/modules/primeng.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NgxSpinnerModule } from "ngx-spinner";
import { DatePipe } from '@angular/common';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DatabaseAdministrationComponent } from './modules/database-administration/database-administration.component';

@NgModule({
  declarations: [
    AppComponent,
    DatabaseAdministrationComponent
  ],
  imports: [
    PrimeNgModules,
    BrowserModule,
    AppRoutingModule,
    NgxSpinnerModule,
    DragDropModule,
    MonacoEditorModule.forRoot(),
  ],
  providers: [DialogService, provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
      }
    }), MessageService, DatePipe, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }

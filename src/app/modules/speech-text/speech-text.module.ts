import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpeechTextRoutingModule } from './speech-text-routing.module';
import { SpeechTextComponent } from './speech-text.component';
import { SpeechHomeComponent } from './pages/speech-home/speech-home.component';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';



@NgModule({
  declarations: [
    SpeechTextComponent,
    SpeechHomeComponent,
  
  ],
  imports: [
    CommonModule,
    SpeechTextRoutingModule,
    SidebarComponent,
    PrimeNgModules
  ]
})
export class SpeechTextModule { }

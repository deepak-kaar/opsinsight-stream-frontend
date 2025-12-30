import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpeechTextComponent } from './speech-text.component';
import { SpeechHomeComponent } from './pages/speech-home/speech-home.component';


const routes: Routes = [{ path: '', component: SpeechHomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpeechTextRoutingModule { }

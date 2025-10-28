import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataStreamComponent } from './data-stream.component';
import { StreamHomeComponent } from './pages/stream-home/stream-home.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home', component: StreamHomeComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataStreamRoutingModule { }

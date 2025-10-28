import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewStreamComponent } from './view-stream.component';
import { ViewHomeComponent } from './pages/view-home/view-home.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  { path: 'home', component: ViewHomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewStreamRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewStreamRoutingModule } from './view-stream-routing.module';
import { ViewStreamComponent } from './view-stream.component';
import { ViewHomeComponent } from './pages/view-home/view-home.component';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';


@NgModule({
  declarations: [
    ViewStreamComponent,
    ViewHomeComponent
  ],
  imports: [
    CommonModule,
    ViewStreamRoutingModule,
    SidebarComponent,
    PrimeNgModules
  ]
})
export class ViewStreamModule { }

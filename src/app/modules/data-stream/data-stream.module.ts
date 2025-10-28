import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataStreamRoutingModule } from './data-stream-routing.module';
import { DataStreamComponent } from './data-stream.component';
import { StreamHomeComponent } from './pages/stream-home/stream-home.component';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';


@NgModule({
  declarations: [
    DataStreamComponent,
    StreamHomeComponent
  ],
  imports: [
    CommonModule,
    DataStreamRoutingModule,
    SidebarComponent,
    PrimeNgModules
  ]
})
export class DataStreamModule { }

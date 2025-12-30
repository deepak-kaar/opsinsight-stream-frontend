import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScanDocumentRoutingModule } from './scan-document-routing.module';
import { ScanDocumentComponent } from './scan-document.component';
import { ScanHomeComponent } from './pages/scan-home/scan-home.component';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';


@NgModule({
  declarations: [
    ScanDocumentComponent,
    ScanHomeComponent
  ],
  imports: [
    CommonModule,
    ScanDocumentRoutingModule,
    SidebarComponent,
    PrimeNgModules
  ]
})
export class ScanDocumentModule { }

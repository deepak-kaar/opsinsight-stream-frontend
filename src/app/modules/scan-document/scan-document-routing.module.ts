import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScanDocumentComponent } from './scan-document.component';
import { ScanHomeComponent } from './pages/scan-home/scan-home.component';

const routes: Routes = [{ path: '', component: ScanHomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScanDocumentRoutingModule { }

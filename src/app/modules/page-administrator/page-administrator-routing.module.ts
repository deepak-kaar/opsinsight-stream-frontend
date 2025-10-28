import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageManagerComponent } from './pages/page-manager/page-manager.component';
import { PageBuilderComponent } from './pages/page-builder/page-builder.component';

const routes: Routes = [{
  path: '',
  pathMatch: 'full',
  redirectTo: 'pageManager'
},
{
  path: 'pageManager',
  component: PageManagerComponent
},
{
  path: 'pageBuilder',
  component: PageBuilderComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageAdministratorRoutingModule { }

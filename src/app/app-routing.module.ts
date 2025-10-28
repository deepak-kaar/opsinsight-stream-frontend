import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { screenGuardGuard } from './core/guards/screen-guard/screen-guard.guard';
import { ScreenGuardDisplayComponent } from './core/components/screen-guard-display/screen-guard-display.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./modules/landing-page/landing-page.module').then((m) => m.LandingPageModule)
  },
  {
    path: 'pageAdmin',
    loadChildren: () =>
      import('./modules/page-administrator/page-administrator.module').then(
        (m) => m.PageAdministratorModule
      )
  },
  {
    path: 'orgAdmin',
    loadChildren: () =>
      import('./modules/organization-administration/organization-administration.module').then(
        (m) => m.OrganizationAdministrationModule
      )
  },
  {
    path: 'datapointAdmin',
    loadChildren: () => import('./modules/datapoint-administration/datapoint-administration.module').then((m) => m.DatapointAdministrationModule)
  },
  {
    path: 'desktop-required',
    component: ScreenGuardDisplayComponent
  },
  {
    path: 'calculationEngine',
    loadChildren: () => import('./modules/calculation-engine/calculation-engine.module').then((m) => m.CalculationEngineModule)
  },
  {
    path: 'globalRenderer',
    loadChildren: () => import('./modules/renderer/renderer.module').then((m) => m.RendererModule)
  },
  {
    path: 'correlationEngine',
    loadChildren: () => import('./modules/correlation-engine/correlation-engine.module').then((m) => m.CorrelationEngineModule)
  },
  {
    path: 'activityEngine',
    loadChildren: () => import('./modules/activity-engine/activity-engine.module').then((m) => m.ActivityEngineModule)
  },
  {
    path: 'piadmin',
    loadChildren: () =>
      import('./modules/pi-administration/pi-administration.module').then(
        (m) => m.PiAdministrationModule
      )
  },
  {
    path: 'datasourceAdmin',
    loadChildren: () =>
      import('./modules/datasource-administration/datasource-administration.module').then(
        (m) => m.DatasourceAdministrationModule
      )
  },
  {
    path: 'databaseAdmin',
    loadChildren: () =>
      import('./modules/database-administration/database-administration.module').then(
        (m) => m.DatabaseAdministrationModule
      )
  },
  { path: 'dataStream', loadChildren: () => import('./modules/data-stream/data-stream.module').then(m => m.DataStreamModule) },
  { path: 'viewStream', loadChildren: () => import('./modules/view-stream/view-stream.module').then(m => m.ViewStreamModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageAdministratorRoutingModule } from './page-administrator-routing.module';
import { PageAdministratorComponent } from './page-administrator.component';
import { PageManagerComponent } from './pages/page-manager/page-manager.component';
import { SidebarComponent } from '../../core/components/sidebar/sidebar.component';
import { PrimeNgModules } from '../../core/modules/primeng.module';
import { PageBuilderComponent } from './pages/page-builder/page-builder.component';
import { CanvasConfigComponent } from './components/dialogs/canvas-config/canvas-config.component';
import { RoleAssignementComponent } from './components/role-assignement/role-assignement.component';
import { PageAssignementComponent } from './components/page-assignement/page-assignement.component';
import { ManagePageComponent } from './components/manage-page/manage-page.component';
import { GridstackModule, GridstackComponent } from 'gridstack/dist/angular';
import { WidgetsModule } from '../widgets/widgets.module';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { CodeEditorComponent } from './components/dialogs/code-editor/code-editor.component';
import { FrequencyConfigComponent } from './components/dialogs/frequency-config/frequency-config.component';
import { ImageUploadComponent } from './components/dialogs/image-upload/image-upload.component';
import { TextInputComponent } from './components/dialogs/text-input/text-input.component';
import { TemplateConfirmationComponent } from './components/dialogs/template-confirmation/template-confirmation.component';
import { LlmChatboxComponent } from './components/dialogs/llm-chatbox/llm-chatbox.component';


@NgModule({
  declarations: [
    PageAdministratorComponent,
    PageManagerComponent,
    PageBuilderComponent,
    CanvasConfigComponent,
    RoleAssignementComponent,
    PageAssignementComponent,
    ManagePageComponent,
    CodeEditorComponent,
    FrequencyConfigComponent,
    ImageUploadComponent,
    TextInputComponent,
    TemplateConfirmationComponent,
    LlmChatboxComponent,
  ],
  imports: [
    MonacoEditorModule.forRoot(),
    CommonModule,
    GridstackModule,
    PrimeNgModules,
    PageAdministratorRoutingModule,
    SidebarComponent,
    WidgetsModule,
  ]
})
export class PageAdministratorModule { }

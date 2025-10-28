import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

/**
 * @component
 * @description
 * `CodeEditorComponent` is a dialog-based component used to edit JSON code.
 * It uses PrimeNG's DynamicDialog to receive input data and return the edited result.
 * The component uses a code editor (e.g., Monaco) with syntax highlighting for JSON.
 */
@Component({
  selector: 'app-code-editor',
  standalone: false,
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.css'
})
export class CodeEditorComponent {
  /**
   * Configuration options for the code editor.
   * - `theme`: Sets the editor's theme to "vs-dark".
   * - `language`: Specifies JSON as the editing language.
   * - `automaticLayout`: Ensures the editor automatically adjusts its layout.
   */
  editorOptions = {
    theme: 'vs-dark', language: 'json',
    automaticLayout: true
  };

  /**
   * Holds the JSON code to be edited, initially populated from the dialog config data.
   */
  code: string = ''

  /**
   * Creates an instance of the CodeEditorComponent.
   *
   * @param dialogConfig - Contains the input data passed to the dialog.
   * @param ref - Reference to the dialog used for closing and returning data.
   */
  constructor(public dialogConfig: DynamicDialogConfig, private ref: DynamicDialogRef) {
    const data = this.dialogConfig?.data ?? {};
    this.code = JSON.stringify(data, null, 2);
  }

  /**
   * Called when the user clicks the "save" button.
   * Closes the dialog and returns the updated code along with a success status.
   * @returns - returns nothing
   */
  save():void {
    if (this.code) {
      this.ref.close({
        status: true,
        code: this.code
      });
    }
  }

}

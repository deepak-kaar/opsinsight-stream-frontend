import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OrganizationAdministrationService } from 'src/app/modules/organization-administration/organization-administration.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { FileUpload } from 'primeng/fileupload';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { NetworkStatusService } from 'src/app/core/utils/network-status.service';
import { OfflineQueueService } from 'src/app/core/utils/offline-queue.service';
import { PlatformService } from 'src/app/core/utils/platform.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TieredMenu } from 'primeng/tieredmenu';

/**
 * @component
 * @description
 * The `ManageAppComponent` is responsible for managing application in the organization administration module.
 * This is a dialog component invoked from AppsManager Component , at the time of invocation the data for this component and mode is supplied
 * It works based on the mode.
 * If the mode is create it used to create an app by accepting the values entered by the user with the help of app form.
 * If the mode is edit it used to edit an existing app by patching the existing app value to the app form from the value passed while invocation.
 */
@Component({
  selector: 'app-manage-app',
  standalone: false,
  templateUrl: './manage-app.component.html',
  styleUrl: './manage-app.component.css'
})
export class ManageAppComponent implements OnInit, OnDestroy {
  /**
   * @property {FormGroup} appForm - Form group that holds application form controls.
   */
  appForm: FormGroup;

  /**
   * @property {any[]} classifications - Stores a list of classifications (potentially for dropdown selection).
   */
  classifications: any[] = [
    "Tier 1",
    "Tier 2"
  ];

  /**
 * @property {any[]} activeStatus - Stores a list of active status (potentially for dropdown selection).
 */
  activeStatus: any[] = [
    {
      name: 'Active',
      value: 'active'
    },
    {
      name: 'Inactive',
      value: 'inactive'
    }
  ];

  /**
 * @property {any[]} adminRoles - Stores a list of adminRoles (potentially for dropdown selection).
 */
  adminRoles: any[] = [];

  /**
   * @property {any} index - Stores an index value used for file operations or list selections.
   */
  index: any;

  /**
   * @property {any[]} files - Stores the list of uploaded files.
   */
  files: any[] = [];

  /**
   * @property {number} totalSize - The total size of uploaded files.
   */
  totalSize: number = 0;

  /**
   * @property {number} totalSizePercent - Percentage representation of the uploaded file size.
   */
  totalSizePercent: number = 0;

  /**
   * @property {any} uploadedFile - Stores the last uploaded file reference.
   */
  uploadedFile: any;

  /**
   * @property {string | ArrayBuffer | null} imageUrl - Stores the preview URL of the uploaded image.
   */
  imageUrl: string | ArrayBuffer | null = null;

  /**
   * @property {boolean} isExistingImage - Indicates whether an existing image is already set.
   */
  isExistingImage: boolean = false;

  /**
   * @property {FileUpload} fileUpload - Reference to the PrimeNG FileUpload component.
   */
  @ViewChild('fileUpload')
  fileUpload!: FileUpload;

  /**
   * @property {FormData} appData - stores the app information as formdata.
   */
  appData = new FormData()

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
 * @property {string} mode - stores the appId when the mode is edit.
 */
  appId: string = '';

  /**
 * @property {boolean} isOnline - Indicates current network status (true = online, false = offline).
 */
  isOnline: boolean = navigator.onLine;

  /**
   * @property {Subscription} sub - Holds the subscription to the network status observable.
   */
  private sub!: Subscription;

 isMobilePlatform: boolean = false;

  fileSelectedFromMobile: boolean = false;

  /**
   * @constructor
   * @param {DynamicDialogConfig} dialogConfig - Configuration for the dynamic dialog.
   * @param {DynamicDialogRef} ref - Reference to the dynamic dialog instance.
   * @param {OrganizationAdministrationService} orgAdminService - Service for handling organization-related operations.
   * @param {PrimeNG} config - PrimeNG configuration settings.
   * @param {MessageService} messageService - Service for displaying messages to the user.
   * @param {FormBuilder} fb - Form builder service for handling reactive forms.
   * @param {NgxSpinnerService} spinner - Ngx Spinner service to interact with loaders
   * * @param {NetworkStatusService} networkService - Service for monitoring and providing network connectivity status.
   */
  constructor(public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private orgAdminService: OrganizationAdministrationService,
    private config: PrimeNG,
    private messageService: MessageService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private networkService: NetworkStatusService,
    private offlineQueueService: OfflineQueueService,
    private platform: PlatformService,
    private sanitizer: DomSanitizer,
    private ngZone:NgZone,
    private cdr :ChangeDetectorRef
  ) {
    this.appForm = this.fb.group({
      appName: new FormControl<string>('', [Validators.required]),
      appDescription: new FormControl<string>('', [Validators.required]),
      appAdminRole: new FormControl<string>(''),
      appClassification: new FormControl<string>(''),
      appOwner: new FormControl<string>(''),
      appContact: new FormControl<string>(''),
      appStatus: new FormControl<string>('')
    });
     // Check if running in mobile webview
    this.isMobilePlatform = !!(window as any).FlutterChannel;


    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.appId = this.dialogConfig.data?.appData?.appId;
      this.patchValue(this.dialogConfig.data?.appData)
    }
  }

  /**
 * Lifecycle hook that is called after Angular has initialized the component.
 * Fetches the list of applications from the backend.
 * Subscribes to the NetworkStatusService to track online/offline status
 *   and updates the `isOnline` property accordingly.
 * @returns {void} - returns nothing i.e(void)
 */
  ngOnInit(): void {
    this.getRoles()
    this.sub = this.networkService.getNetworkStatus()
      .subscribe(status => {
        this.isOnline = status;
      });
      this.setupMobileFileHandler();

      // (window as any).onFlutterFileSelected = (fileData: any) => {
      //  this.ngZone.run(()=>{
      //   console.log('oninitfile name',fileData.name);
      //   const blob = this.base64ToBlob(fileData.data, fileData.mimeType);

      //   const file = new File([blob], fileData.name,  { type: fileData.mimeType });
      //   (file as any).objectUrl = fileData.objectUrl;
        
        

      //   const reader = new FileReader();

      //   this.files = [file];
      //   console.log('fileupload',this.fileUpload)
        
        
      //   this.totalSize = file.size;
      //   this.totalSizePercent = 100;
      //   reader.onload = (e: any) => {
      //   this.imageUrl = e.target.result; // base64 data URL for preview
      //   console.log('image url',this.imageUrl)
      //   };
      //   reader.readAsDataURL(file);
      //  })

  
     
      // };
  }

  /**
   * Lifecycle hook that is called just before the component is destroyed.
   * Unsubscribes from the network status subscription to prevent memory leaks.
   * @returns {void} - returns nothing i.e. (void)
   */
  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.cleanupMobileFileHandler();
  }

  /**
   * Sets up the Flutter/Mobile file selection handler
   */
  private setupMobileFileHandler(): void {
    if (this.isMobilePlatform) {
      (window as any).onFlutterFileSelected = (fileData: any) => {
        // this.ngZone.run(() => {
        //   this.handleMobileFileSelection(fileData);
        // });
        this.handleMobileFileSelection(fileData);
      };
    }
  }

  /**
   * Cleans up the mobile file handler
   */
  private cleanupMobileFileHandler(): void {
    if (this.isMobilePlatform && (window as any).onFlutterFileSelected) {
      delete (window as any).onFlutterFileSelected;
    }
  }

  /**
   * Handles file selection from mobile platform
   */
  private handleMobileFileSelection(fileData: any): void {
    console.log('Mobile file selected:', fileData.name);

    // Validate if existing image needs to be cleared first
    // if (this.isExistingImage) {
    //   this.messageService.add({ 
    //     severity: 'error', 
    //     summary: 'Error', 
    //     detail: "Please clear the existing image first", 
    //     life: 3000 
    //   });
    //   return;
    // }

    // Validate if files already exist
    // if (this.files.length > 0) {
    //   this.messageService.add({ 
    //     severity: 'error', 
    //     summary: 'Error', 
    //     detail: "Please clear the current selection first", 
    //     life: 3000 
    //   });
    //   return;
    // }

    try {
      const mimeType = this.getMimeTypeFromExtension(fileData.mimeType, fileData.name);

     /*  // Convert base64 to blob
      const blob = this.base64ToBlob(fileData.data, fileData.mimeType);
      // var objectURL = URL.createObjectURL(blob);
      
      // Create File object
      const file = new File([blob], fileData.name, { type: fileData.mimeType });
      var objectUrl = URL.createObjectURL(file);
      (file as any).objectURL = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      */
      const blob = this.base64ToBlob(fileData.data, mimeType);
      const file = new File([blob], fileData.name, { type: mimeType });
  
      // 2️⃣ Create a blob URL for preview
      const objectURL = URL.createObjectURL(file);
      (file as any).objectURL = objectURL;
  
      // 3️⃣ Store file for UI
      this.files.push(file);
      // this.files = [file];

      this.fileSelectedFromMobile = true;
  
      // 4️⃣ Trigger change detection (important in WebView)
      // this.cdr.markForCheck();
      // this.cdr.detectChanges();



      console.log('file type during mobile upload', typeof(file), file,  (file as any).objectURL);
      

      // Update component state
    
     
      this.totalSize = file.size;
      this.totalSizePercent = 100;

      // this.ngZone.run(() => {
      //   this.files = [file];
      //   this.totalSize = file.size;
      //   this.totalSizePercent =  100;
      //   this.fileSelectedFromMobile = true
      // });

      // console.log('files length',this.files.length)
      // console.log(!this.files );

      // Read file for preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        console.log('Mobile image loaded for preview');
      };
      reader.onerror = (error) => {
        console.error('Error reading mobile file:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: "Failed to read file", 
          life: 3000 
        });
      };
      reader.readAsDataURL(file);

      // Show success message
      // this.messageService.add({ 
      //   severity: 'success', 
      //   summary: 'Success', 
      //   detail: 'File selected successfully', 
      //   life: 3000 
      // });

    } catch (error) {
      console.error('Error processing mobile file:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: "Failed to process file", 
        life: 3000 
      });
    }
  }

   /**
   * Gets proper MIME type from file extension
   */
   private getMimeTypeFromExtension(mimeType: string, fileName: string): string {
    // If we already have a proper MIME type, use it
    if (mimeType && mimeType.includes('/')) {
      return mimeType;
    }

    // Extract extension and map to MIME type
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeMap: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf'
    };

    return mimeMap[extension] || `image/${extension}` || 'application/octet-stream';
  }


  // /**
  //  * Handles file selection - works for both web and mobile after mobile handler processes file
  //  */
  // choose(event: any, callback: () => void): void {
  //   if (this.isMobilePlatform) {
  //     // Trigger Flutter file picker
  //     (window as any).FlutterChannel.postMessage('chooseFile');
  //   } else {
  //     // Use web file picker
  //     callback();
  //   }
  // }

  /**
   * Handles file selection and executes a callback function.
   * @param {any} event - The file selection event.
   * @param {() => void} callback - A callback function to execute after file selection.
   * @returns {void} - returns nothing (i.e) void
   */
  choose(event: any, callback: () => void): void {
    if ((window as any).FlutterChannel) {
      (window as any).FlutterChannel.postMessage('chooseFile');
    }
    else{
    callback();
    }
  }

  /**
  * Clears the selected image and resets file-related properties.
  * @returns {void} - returns nothing (i.e) void
  */
  clearImage(): void {
    console.log('clear img clicked')
    // // Revoke object URLs to prevent memory leaks
    // this.files.forEach(file => {
    //   if ((file as any).objectURL && (file as any).objectURL.startsWith('blob:')) {
    //     URL.revokeObjectURL((file as any).objectURL);
    //   }
    // });

   
    if (this.fileUpload) {
      console.log('file upload', this.fileUpload)
      this.fileUpload.files = [];
      this.fileUpload.clear();
    }
    this.files = [];
    this.totalSizePercent = 0;
  }

  /**
   * Handles file removal for templating.
   * @param {any} event - The file removal event.
   * @param {any} file - The file to be removed.
   * @param {Function} removeFileCallback - Callback function for file removal.
   * @returns {void} - returns nothing (i.e) void
   * @param {any} index - Index of the file to be removed.
   */
  onRemoveTemplatingFile(event: any, file: any, removeFileCallback: any, index: any): void {

     // Revoke object URL if it exists
    //  if ((file as any).objectURL && (file as any).objectURL.startsWith('blob:')) {
    //   URL.revokeObjectURL((file as any).objectURL);
    // }
    removeFileCallback(event, index);
    this.files = []
    this.totalSizePercent = 0;
  }

  /**
   * Clears the file upload template.
   * @param {() => void} clear - Callback function to clear the file upload component.
   */
  onClearTemplatingUpload(clear: () => void) {
    clear();
    this.totalSize = 0;
    this.totalSizePercent = 0;
  }

  /**
 * Handles file upload for a templated file upload component.
 * @param {any} fileUpload - The file upload component reference.
 * @returns {void} - returns nothing (i.e) void
 */
  onTemplatedUpload(fileUpload: any): void {

    // this.spinner.show();


    this.totalSizePercent = 100;
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
    // this.spinner.show();
    const reader = new FileReader();
    const file = this.files[0];
    this.uploadEvent(()=>{});
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
      console.log('imageUrl', this.imageUrl)
      this.files = [];
      this.totalSize = 0;
      this.totalSizePercent = 0;
      fileUpload?.clear();
    };
    reader.readAsDataURL(file);
    fileUpload?.clear();

  }

  /**
  * Handles file selection and validates the number of selected files.
  * @param {any} event - The file selection event containing the list of selected files.
  * @returns {void} - returns nothing (i.e) void
  */
  onSelectedFiles(event: any): void {
    if (this.files.length > 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "You can't select more than one image", life: 3000 });
    }
    else if (this.isExistingImage) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please clear the existing Image", life: 3000 });
    }
    else {
      console.log('file type during web upload',typeof(event.currentFiles),event.currentFiles);
      this.files = event.currentFiles;
      this.files.forEach((file: any) => {
        this.totalSize += parseInt(this.formatSize(file.size));
      });
      this.totalSizePercent = 100;
    }

  }

  /**
  * Triggers the file upload process using a callback function.
  * @param {() => void} callback - Callback function to execute after initiating the upload.
  * @returns {void} - returns nothing (i.e) void
  */
  uploadEvent(callback: () => void): void {
    callback();
  }


  /**
  * Formats the size of the uploaded image using primeng Config and Math functions
  * Takes the bytes as input and convert it into string
  * @param {number} bytes - File size in bytes
  * @returns {string} - return the formatted file size in readable format
  */
  formatSize(bytes: number): string {
    const k = 1024;
    const dm = 1;
    const sizes: any = this.config.translation.fileSizeTypes;
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
  }


  /**
   * Changes the existing Image flag to false from true
   * @returns {void} - returns nothing (i.e) void
   */
  clearExisting(): void {
    this.isExistingImage = false;
  }

  /**
  * Fetches the list of applications from the backend and assigns it to the `roles` array.
  * calls the show method from spinner service to show the loader before getRoles method and hides after fetching.
  * @returns {void} - returns nothing i.e(void)
  */
  getRoles(): void {
    this.spinner.show();
    this.orgAdminService.getRoles({ roleLevel: 'OpsInsight', roleLevelId: null }).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.adminRoles = res.roles
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  /**
 * Validates the appForm.
 * If its valid and the mode is create, calls the createApp method from org Admin service to create an app by passing the appForm Value.
 * If its valid and the mode is edit, calls the editApp method from org Admin service to edit an app by passing the appForm Value.
 * It its not valid shows a toast message with error
 * @returns {void} - returns nothing (i.e) void
 */
  createApp(): void {
    if (this.mode === 'create') {
      if (this.appForm.valid) {
        this.appData.append('appName', this.appForm.get('appName')?.value);
        this.appData.append('appDescription', this.appForm.get('appDescription')?.value);
        this.appData.append('appClassification', this.appForm.get('appClassification')?.value);
        this.appData.append('adminRole', this.appForm.get('appAdminRole')?.value);
        this.appData.append('appOwner', this.appForm.get('appOwner')?.value);
        this.appData.append('appContact', this.appForm.get('appContact')?.value);
        this.appData.append('appLogo', this.files[0]);
      }
      if (this.isOnline) {
        console.log('is online');
        for (const [key, value] of this.appData.entries()) {
          console.log(key, value);
        }
        this.orgAdminService.createApp(this.appData).subscribe({
          next: (res: any) => {
            this.ref.close({ status: true });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While Creating app", life: 3000 });
          }
        })
      }
      else {
        console.log('into offline');
        for (const [key, value] of this.appData.entries()) {
          console.log(key, value);
        }
        this.offlineQueueService.queueRequest('app/postApp', this.appData);
        this.ref.close({ status: true });

      }
    }
    else {
      if (this.appForm.valid) {
        this.appData.append('appId', this.appId);
        this.appData.append('appName', this.appForm.get('appName')?.value);
        this.appData.append('appDescription', this.appForm.get('appDescription')?.value);
        this.appData.append('appClassification', this.appForm.get('appClassification')?.value);
        this.appData.append('adminRole', this.appForm.get('appAdminRole')?.value);
        this.appData.append('appOwner', this.appForm.get('appOwner')?.value);
        this.appData.append('appContact', this.appForm.get('appContact')?.value);
        this.appData.append('appStatus', this.appForm.get('appStatus')?.value);
        this.appData.append('appLogo', this.files[0]);
      }
      this.orgAdminService.updateApp(this.appData).subscribe({
        next: (res: any) => {
          this.ref.close({ status: true });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While Creating app", life: 3000 });
        }
      })
    }
  }

  /**
   * Patches the application data to the appForm
   * @param {any} app - application data
   * @returns {void} - returns nothing (i.e) void
   */
  patchValue(app: any): void {
    console.log(app)
    this.appForm.patchValue({
      appName: app.appName,
      appDescription: app.appDescription,
      appAdminRole: app.adminRole,
      appClassification: app.appClassification,
      appOwner: app.appOwner,
      appContact: app.appContact,
      appStatus: app.appStatus
    })
    this.isExistingImage = true;
    this.uploadedFile = "data:" + app?.appLogoType + ";base64," + app.appLogo;
  }

  base64ToBlob(base64: string, mime: string) {
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }
  
}

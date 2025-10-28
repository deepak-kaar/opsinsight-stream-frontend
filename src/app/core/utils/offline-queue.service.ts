import { Injectable } from '@angular/core';
import { NetworkStatusService } from './network-status.service';
import { IndexedDbService } from './indexed-db.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { debounceTime, filter } from 'rxjs';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class OfflineQueueService {
  private isProcessing = false;
  formData: any;
  constructor(
    private networkService: NetworkStatusService,
    private dbService: IndexedDbService,
    private http: HttpClient,
    private encryption: EncryptionService
  ) {
    // Subscribe to network changes
    this.networkService.getNetworkStatus()
      .pipe(
        debounceTime(1000), // wait 1 second to avoid online/offline bounce
        filter(status => status === true) // only when online
      )
      .subscribe(async () => {
        if (this.isProcessing) return;

        this.isProcessing = true;
        try {
          await this.processPendingRequests();
        } finally {
          this.isProcessing = false;
        }
      });
  }

  async queueRequest(url: string, formData: FormData,): Promise<void> {

    const jsonData = this.formDataToJson(formData);
    const payload = this.encryption.encrypt(jsonData);
    var files = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        var obj = { key, value };
        files.push(obj);
      }
    }
    const requestData = {
      url,
      payload,
      timestamp: new Date().toISOString(),
      files
    };



    //console.log('req data after encryption', requestData);

    await this.dbService.addRequest(requestData);
    //console.log('Stored offline request:', requestData);

  }

  private async processPendingRequests(): Promise<void> {
    const requests = await this.dbService.getAllRequests();
    if (requests.length > 0) {
      
      for (const req of requests) {
        const decryptData = await this.encryption.decrypt(req.payload);
      
        const formData =  this.objectToFormData(decryptData);
      

        for (const fileData of req.files) {
          formData.append(fileData.key, fileData.value);
        }
       

       
        var url = environment.apiUrl + req.url;

        try {
          // Perform HTTP POST request
          const response =  this.http.post(url, formData).toPromise();
          
          
          await this.dbService.deleteRequest(req.id);
          //console.log('Offline requests cleared after processing');
        } catch (error) {
          
        }




      };
      await this.dbService.clearRequests();
      // //console.log('Offline requests cleared after processing');
    }
  }




  private formDataToJson(formData: FormData): any {
    const obj: any = {};
    formData.forEach((value, key) => {

      if (value instanceof File) {
        // Optional: handle file separately
        // obj[key] = value.name;
      } else {
        obj[key] = value;
      }
    });
    return obj;
  }




  private objectToFormData(obj: any): FormData {

    const formData = new FormData();
    for (const key in obj) {
      formData.append(key, obj[key]);
    }

    return formData;

  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatabaseAdministrationService extends BaseApiService {

  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url

  //query strings
  get_query: string = this.baseUrl + '';
  post_query: string = this.baseUrl + '';
  put_query: string = this.baseUrl + '';
  delete_query: string = this.baseUrl + '';
  
  //Get Attribute by org string
  get_attribute_by_orgs: string = this.baseUrl + 'attribute/getAttributeByOrgs';


  get_data_source: string = this.baseUrl + 'datasource/getDataSource';


  getDataSource(params?: any): Observable<any> {
    return this.http.get(this.get_data_source, { params }).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatasourceAdministrationService extends BaseApiService {


  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url

  get_data_source: string = this.baseUrl + 'datasource/getDataSource';
  post_data_source: string = this.baseUrl + 'datasource/postDataSource';
  put_data_source: string = this.baseUrl + 'datasource/updateDataSource';
  delete_data_source: string = this.baseUrl + 'datasource/deleteDataSource';

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

  getDataSourceById(id: any): Observable<any> {
    return this.http.get(this.get_data_source + id).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  postDataSource(datasource: any): Observable<any> {
    return this.http.post(this.post_data_source, datasource).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }


  putDataSource(updated_datasource: any, id: any): Observable<any> {
    return this.http.post(`${this.put_data_source}/${id}`, updated_datasource).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }


  deleteDataSource(id: any): Observable<any> {
    return this.http.delete(`${this.delete_data_source}/${id}`).pipe(
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

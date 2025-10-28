import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/config/api-endpoint.config';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PiAdministrationService extends BaseApiService {

  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url

  //PI send strings
  get_pi_send: string = this.baseUrl + 'pi/getPiSend';
  post_pi_send: string = this.baseUrl + 'pi/postPiSend';
  put_pi_send: string = this.baseUrl + 'pi/updatePiSend';
  delete_pi_send: string = this.baseUrl + 'pi/deletePiSend';
  get_entity_list: string = this.baseUrl + 'entity/getEntity'; // url to fetch the entity list
  get_instance_list: string = this.baseUrl + 'instance/getInstance'; // url to fetch the instance list
  get_entity_details: string = this.baseUrl + 'entity/getEntity/'; //url to fetch the entity details

  //PI receive strings
  get_pi_receive: string = this.baseUrl + 'pi/getPiReceive';
  post_pi_receive: string = this.baseUrl + 'pi/postPiReceive';
  put_pi_receive: string = this.baseUrl + 'pi/updatePiReceive';
  delete_pi_receive: string = this.baseUrl + 'pi/deletePiReceive';

  //Get Attribute by org string
  get_attribute_by_orgs: string = this.baseUrl + 'attribute/getAttributeByOrgs';


  getAttributesByOrg(payload: any): Observable<any> {
    return this.http.post(this.get_attribute_by_orgs, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }



  getPISend(payload: any): Observable<any> {
    return this.http.post(this.get_pi_send, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  postPISend(pi_send: any): Observable<any> {
    return this.http.post(this.post_pi_send, pi_send).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }


  putPISend(updated_pi_send: any, id: any): Observable<any> {
    return this.http.post(`${this.put_pi_send}/${id}`, updated_pi_send).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  deletePISend(id: any): Observable<any> {
    return this.http.delete(`${this.delete_pi_send}/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }


  getPIReceive(payload: any): Observable<any> {
    return this.http.post(this.get_pi_receive, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  postPIReceive(pi_receive: any): Observable<any> {
    return this.http.post(this.post_pi_receive, pi_receive).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  putPIReceive(updated_pi_receive: any, id: any): Observable<any> {
    return this.http.post(`${this.put_pi_receive}/${id}`, updated_pi_receive).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  /**
   * Fetches the list of entity.
   *
   * @returns An Observable of the response containing entity data.
   * @param {any} payload - payload to specify the type of the feature
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getEntityList(payload: any): Observable<any> {
    return this.http.post(this.get_entity_list, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
* Fetches the list of instance.
*
* @returns An Observable of the response containing instance data.
* @param {any} payload - payload to specify the type of the feature
* @throws {Error} Throws an error if the request fails or times out.
*/
  getInstanceList(payload: any): Observable<any> {
    return this.http.post(this.get_instance_list, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
* Sends a GET request to fetch the details of particular entity.
* @param {any} entityId - entity id to get the details of particular entity.
* @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
*/
  getEntityDetailsById(entityId: string): Observable<any> {
    return this.http.get(this.get_entity_details + entityId).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
 * Sends a GET request to fetch the details of particular instance by calling the get method from base api service.
 * @param {any} instanceId - instance id to get the details of particular instance.
 * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
 */
  getInstanceDetailsById(instanceId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.DATAPOINT_ADMIN.INSTANCE.GET_LIST + instanceId);
  }


  deletePIReceive(id: any): Observable<any> {
    return this.http.delete(`${this.delete_pi_receive}/${id}`).pipe(
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

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/config/api-endpoint.config';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class LandingPageService extends BaseApiService {

  /**
    * Fetches the list of ongoing events cards.
    * @returns An Observable of the response containing ongoing flags cards.
    * @throws {Error} Throws an error if the request fails or times out.
    */
  getOnGoingFlags(): Observable<any> {
    return this.get(API_ENDPOINTS.LANDING_PAGE.GET_ONGOING_CARDS)
  }
}

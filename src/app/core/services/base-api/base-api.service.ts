import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpErrorHandlerService } from '../http-error-handler/http-error-handler.service';
import { Observable, timeout, catchError } from 'rxjs';

/**
 * @description
 * BaseApiService provides generic HTTP methods (`GET`, `POST`, `PUT`, `DELETE`)
 * that wrap Angular's HttpClient with default timeout and centralized error handling.
 *
 * This service is designed to be extended by other services in the application
 * that communicate with RESTful APIs.
 *
 * @example
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class UserService extends BaseApiService {
 *   getUsers(): Observable<User[]> {
 *     return this.get<User[]>('/users');
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  /**
   * Base URL for all API requests. Taken from the environment configuration.
   */
  protected readonly baseUrl: string = environment.apiUrl;

  /**
   * Default timeout duration for all HTTP requests (in milliseconds).
   * Defaults to 20 seconds.
   */
  protected readonly defaultTimeout = 20000;

  protected http = inject(HttpClient)
  private errorService = inject(HttpErrorHandlerService);

  /**
   * @description
   * Sends a GET request to the specified endpoint.
   *
   * @param endpoint - Relative or absolute URL of the API endpoint.
   * @param options - Optional configuration including headers, params, and timeout.
   * @returns An `Observable<T>` with the HTTP response.
   */
  protected get<T>(endpoint: string, options: {
    params?: HttpParams | Record<string, string | string[]>,
    headers?: HttpHeaders | Record<string, string | string[]>,
    responseType?: any,
    timeoutMs?: number
  } = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const timeoutValue = options.timeoutMs || this.defaultTimeout;

    return this.http.get<T>(url, options).pipe(
      timeout(timeoutValue),
      catchError(error => this.errorService.handleError(error))
    );
  }

  /**
   * @description
   * Sends a POST request to the specified endpoint with a request body.
   *
   * @param endpoint - Relative or absolute URL of the API endpoint.
   * @param body - Payload to send in the request body.
   * @param options - Optional configuration including headers, params, and timeout.
   * @returns An `Observable<T>` with the HTTP response.
   */
  protected post<T>(endpoint: string, body: any, options: {
    params?: HttpParams | Record<string, string | string[]>,
    headers?: HttpHeaders | Record<string, string | string[]>,
    responseType?: any,
    timeoutMs?: number
  } = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const timeoutValue = options.timeoutMs || this.defaultTimeout;

    return this.http.post<T>(url, body, options).pipe(
      timeout(timeoutValue),
      catchError(error => this.errorService.handleError(error))
    );
  }

  /**
   * @description
   * Sends a PUT request to the specified endpoint with a request body.
   * @param endpoint - Relative or absolute URL of the API endpoint.
   * @param body - Payload to send in the request body.
   * @param options - Optional configuration including headers, params, and timeout.
   * @returns An `Observable<T>` with the HTTP response.
   */
  protected put<T>(endpoint: string, body: any, options: {
    params?: HttpParams | Record<string, string | string[]>,
    headers?: HttpHeaders | Record<string, string | string[]>,
    responseType?: any,
    timeoutMs?: number
  } = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const timeoutValue = options.timeoutMs || this.defaultTimeout;

    return this.http.put<T>(url, body, options).pipe(
      timeout(timeoutValue),
      catchError(error => this.errorService.handleError(error))
    );
  }

  /**
   * @description
   * Sends a DELETE request to the specified endpoint.
   * @param endpoint - Relative or absolute URL of the API endpoint.
   * @param options - Optional configuration including headers, params, and timeout.
   * @returns An `Observable<T>` with the HTTP response.
   */
  protected delete<T>(endpoint: string, options: {
    params?: HttpParams | Record<string, string | string[]>,
    headers?: HttpHeaders | Record<string, string | string[]>,
    responseType?: any,
    timeoutMs?: number
  } = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const timeoutValue = options.timeoutMs || this.defaultTimeout;

    return this.http.delete<T>(url, options).pipe(
      timeout(timeoutValue),
      catchError(error => this.errorService.handleError(error))
    );
  }

  /**
   * @description
   * Builds a full URL for an API call by prepending the base URL if the endpoint is relative.
   * @param endpoint - API endpoint to call. Can be a relative path (`/users`) or full URL.
   * @returns A fully qualified URL string.
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${this.baseUrl}${endpoint}`;
  }
}


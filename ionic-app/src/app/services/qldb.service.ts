import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QldbService {

  constructor(
    private http: HttpClient

) { }


  setHeaders(): HttpHeaders {
    const headersConfig = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': localStorage.getItem('x-api-key')
    };
    return new HttpHeaders(headersConfig);
}

  private formatErrors(error: any) {
    const err_msg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    return throwError(error);
  }

  get(path: string, params: HttpParams): Observable<any> {
    if (params == null) {
        params = new HttpParams();
    }
    return this.http.get(`${environment.api_url}${path}`, { headers: this.setHeaders(), params }).
    pipe(map((response: any) => response),
        catchError(this.formatErrors));
}

post(path: string, body: Object = {}): Observable<any> {
  return this.http.post(
      `${environment.api_url}${path}`,
      JSON.stringify(body),
      { headers: this.setHeaders() }
  ).pipe(map((response: any) => response),
      catchError(this.formatErrors));
}

put(path: string, body: Object = {}): Observable<any> {
  return this.http.put(
      `${environment.api_url}${path}`,
      JSON.stringify(body),
      { headers: this.setHeaders() }
  ).pipe(map((response: any) => response),
      catchError(error => this.formatErrors(error)));
}

}

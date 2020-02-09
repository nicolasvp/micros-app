import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MicrosService {

  constructor(private http: HttpClient) { }

  // Obtiene todos los paraderos del recorrido de la micro de ida o vuelta
  getMicrosByStopCode(microId: string, direction: string) {
    const stops: any[] = [];
    return this.http.get(`https://api.scltrans.it/v1/routes/${microId}/directions/${direction}`)
    .pipe(
      map((response: any) => {
        return response.results.stop_times;
      }),
      catchError(e => throwError(e))
    );
  }

  // Obtiene informacion del recorrido de la micro(el origen y el destino)
  getDirectionsByMicroId(microId: string) {
    return this.http.get(`https://api.scltrans.it/v1/routes/${microId}`)
    .pipe(
      map((response: any) => {
        //console.log(response.directions);
        return response.directions;
      }),
      catchError(e => throwError(e))
    );
  }
}

import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MicrosService {

  constructor(private http: HttpClient) { }

  // Obtiene la ruta de una micro segun la direction(ida o vuelta) que se le pase (0 o 1)
  // microCode => "numero" de la micro Ej: I03
  getMicroRouteByDirection(microCode: string, directionId: string) {
    return this.http.get(`https://api.scltrans.it/v2/routes/${microCode}/directions/${directionId}`)
    .pipe(
      map((response: any) => {
        return response.results.stop_times;
      }),
      catchError(e => throwError(e))
    );
  }

  // Obtiene la ruta de una micro de ida y de vuelta segun el "numero" de la micro
  // Ej: I03, este endpoint se demora más de los normal, 1 a 6 segundos
  getAllMicroRoutes(microCode: string) {
    return this.http.get(`https://api.scltrans.it/v1/routes/${microCode}`)
    .pipe(
      map((response: any) => {
        return response.directions;
      }),
      catchError(e => throwError(e))
    );
  }
}

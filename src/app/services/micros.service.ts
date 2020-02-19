import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MicrosService {

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la ruta de una micro segun la direction(ida o vuelta) que se le pase (0 o 1)
   * microCode => "numero" de la micro Ej: I03
   * @param microCode: string, codigo de la micro Ej: I03
   * @param directionId: number, direccion de la micro, puede ser 1 o 0
   */
  getMicroRouteByDirection(microCode: string, directionId: number) {
    return this.http.get(`https://api.scltrans.it/v2/routes/${microCode}/directions/${directionId}`)
    .pipe(
      map((response: any) => {
        return response.results.shape;
      }),
      catchError(e => throwError(e))
    );
  }

  /**
   * Obtiene las direcciones de una micro de ida y de vuelta segun el codigo de la micro
   * Siempre devolverá 2 direcciones (0 y 1)
   * Ej: I03 => devuelve "Villa Portales" y "Villa los Heroes"
   * @param microCode: string, code la micro Ej: I03
   */
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

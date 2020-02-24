import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  // Radio alrededor del punto de ubicacion del cliente en el que se buscarán paraderos
  RADIUS = environment.stop_radius;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene los paraderos alrededor de una localidad(latitud y longitud)
   * @param latitude: number, latitud en numero decimal
   * @param longitude: number, longitud en numero decimal
   */
  getStopsAround(latitude: number, longitude: number) {
    return this.http.get<any>(`https://api.scltrans.it/v2/map?radius=${this.RADIUS}&center_lat=${latitude}&center_lon=${longitude}`)
    .pipe(
      catchError(e => throwError(e))
    );
  }
}

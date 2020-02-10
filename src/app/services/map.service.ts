import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  RADIUS = 400;

  constructor(private http: HttpClient) { }

  // Obtiene las paradas alrededor de una locatidad(latitud y longitud)
  getStopsAround(latitude: number, longitude: number) {
    return this.http.get<any>(`https://api.scltrans.it/v2/map?radius=${this.RADIUS}&center_lat=${latitude}&center_lon=${longitude}`)
    .pipe(
      catchError(e => throwError(e))
    );
  }
}

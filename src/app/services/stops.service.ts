import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NextArrivals } from '../interfaces/nextArrivals';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Stop } from '../interfaces/stop';

@Injectable({
  providedIn: 'root'
})
export class StopsService {

  constructor(private http: HttpClient) { }

  // Obtiene la lista de micros de un paradero segun el code(stop_id)
  getNextArrivalsFromStop(code: string) {
    return this.http.get<NextArrivals>(`https://api.scltrans.it/v2/stops/${code}/next_arrivals`)
    .pipe(
      map( (response: any) => {
        response.results.forEach(arrival => {
          arrival.bus_distance = arrival.bus_distance != null ?
          this.reCalculateDistance(arrival.bus_distance) :
          null;
          arrival.arrival_estimation = this.editMessage(arrival.arrival_estimation);
        });
        return response;
      }),
      catchError(e => throwError('Error al cargar información, inténtelo nuevamente.'))
    );
  }

  // Obtiene la información del paradero segun el code(stop_id)
  getStopInfoByCode(code: string) {
    return this.http.get<Stop>(`https://api.scltrans.it/v1/stops/${code}`)
    .pipe(
      catchError(e => throwError(e))
    );
  }

  reCalculateDistance(busDistance: number) {
    const tempDistance = busDistance - 500;
    return tempDistance > 0 ? tempDistance + ' m.' : null;
  }

  editMessage(message: string) {
    return message === 'Servicio fuera de horario de operacion para ese paradero' ?
    'Servicio fuera de horario.' :
    message;
  }

  // Obtiene la lista de los recorridos para un paradero
  getMicrosByStopCode(code: string) {
    const stops: any[] = [];
    return this.http.get<Stop>(`https://api.scltrans.it/v3/stops/${code}/stop_routes`)
    .pipe(
      map((response: any) => {
        response.results.forEach( stop => {
          stops.push(stop.route.route_id);
        });
        return stops;
      }),
      catchError(e => throwError(e))
    );
  }
}

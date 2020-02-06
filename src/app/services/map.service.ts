import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Stop } from '../interfaces/stop';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private http: HttpClient) { }


  getStopsAround(latitude: number, longitude: number) {
    return this.http.get<any>(`https://api.scltrans.it/v2/map?radius=400&center_lat=${latitude}&center_lon=${longitude}`)
    .pipe(
      catchError(e => throwError(e))
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bip } from '../interfaces/bip';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class BipService {

  constructor(private http: HttpClient, private databaseService: DatabaseService) { }

  /**
   * Obtiene la informacion de la tarjeta bip
   * El saldo se actualiza durante la noche por lo que presenta un desfase durante el día
   * @param bipNumber: string, numero de la tarjeta bip Ej: 12345678
   */
  getBipInfo(bipNumber: string) {
    return this.http.get<Bip>(`http://bip-servicio.herokuapp.com/api/v1/solicitudes.json?bip=${bipNumber}`)
    .pipe(
      catchError(e => throwError(e))
    );
  }
}

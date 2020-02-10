import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bip } from '../interfaces/bip';

@Injectable({
  providedIn: 'root'
})
export class BipService {

  constructor(private http: HttpClient) { }

  // Obtiene el saldo de la tarjeta bip
  // El saldo se actualiza durante la noche por lo que presenta un desfase durante el día
  getBipAmount() {
    return this.http.get<Bip>('http://bip-servicio.herokuapp.com/api/v1/solicitudes.json?bip=22618718');
  }
}

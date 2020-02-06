import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bip } from '../interfaces/bip';

@Injectable({
  providedIn: 'root'
})
export class BipService {

  constructor(private http: HttpClient) { }

  getBipAmount() {
    return this.http.get<Bip>('http://bip-servicio.herokuapp.com/api/v1/solicitudes.json?bip=22618718');
  }
}

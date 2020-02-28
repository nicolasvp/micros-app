import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Stop } from '../interfaces/stop';
import { StopsService } from './stops.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  /**
   * La base de datos que se utiliza es del tipo key:value
   */

  // Campos de la base de datos
  FAVORITE_STOP_CODE: string = 'stop_code';
  FAVORITE_STOP_NAME: string = 'stop_name';
  STOPS_LIST: string = 'stops_list';
  BIP_INFO: string = 'bip_info';
  BIP_NUMBER: string = 'bip_number';
  BIP_LAST_UPDATE = 'bip_last_update';

  stops: Stop [] = [];
  MAX_STOPS_LIST_LENGTH = 15;

  constructor(private storage: Storage, private stopsService: StopsService) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadStopsInMemory();
  }

  // Carga los paraderos al inicio para dejarlos en memoria(variable stops)
  async loadStopsInMemory() {
    const storedStops = await this.getValueFromDB(this.STOPS_LIST);
    if (storedStops !== null) {
      this.stops = storedStops;
    }
  }

  setFavoriteStopCode(code: string) {
    this.storage.set(this.FAVORITE_STOP_CODE, code);
  }

  setFavoriteStopName(name: string) {
    this.storage.set(this.FAVORITE_STOP_NAME, name);
  }

  setBipNumber(bipNumber: number) {
    this.storage.set(this.BIP_NUMBER, bipNumber);
  }

  setBipInfo(bipInfo: any) {
    this.storage.set(this.BIP_INFO, bipInfo);
  }

  setStopToList() {
    this.storage.set(this.STOPS_LIST, this.stops);
  }

  setBipLastUpdate(lastUpdate: string) {
    this.storage.set(this.BIP_LAST_UPDATE, lastUpdate);
  }

  /**
   * Obtiene el valor de la base de datos segun la key
   * @param key: string, llave del valor almacenado en la base de datos que se desea obtener
   * @return value: puede ser un string o un array
   */
  getValueFromDB(key: string) {
    return this.storage.get(key).then(
      (value) => {
        return value;
      }
    );
  }

  /**
   * Elimina un valor de la base de datos segun la key
   * @param key: string, llave del valor almacenado en la base de datos
   */
  removeValueFromDB(key: string) {
    this.storage.remove(key);
  }

  /**
   * Elimina de la lista(array stops) y luego actualiza el valor del stops en la base de datos
   * @param code: string, codigo del paradero Ej: PI587
   */
  removeStopFromList(code: string) {
    const index = this.stops.findIndex(x => x.stop_code === code);
    if (index !== undefined) {
      this.stops.splice(index, 1);
      this.setStopToList();
    }
  }

  /**
   * Agrega un paradero buscando primero la información en la API segun el stopCode
   * @param stop: string, codigo del paradero Ej: PI587
   */
  addStopWithStopCode(stop: string) {
    this.stopsService.getStopInfo(stop).subscribe(
      response => {
        this.checkMaxLengthStopList();
        this.stops.push({
          stop_code: response.stop_code,
          stop_name: response.stop_name
        });
        this.setStopToList();
      },
      error => {
        console.log(error);
      }
    );
    return this.stops;
  }

  /**
   * Agrega un paradero con toda la información necesaria,
   * no necesita ir a buscar la info a la API
   * @param stop: Stop, objeto de paradero con todos sus atributos(name, code, etc)
   */
  addStopWithObject(stop: Stop) {
    this.checkMaxLengthStopList();
    this.stops.push({
      stop_code: stop.stop_code,
      stop_name: stop.stop_name
    });
    this.setStopToList();
  }

  /**
   * Revisa si se alcanzó el limite maximo de la lista de paraderos, si lo alcanzó entonces elimina el primero de la lista
   * Orden FIFO
   */
  checkMaxLengthStopList() {
    if (this.stops !== null) {
      if (this.stops.length >= this.MAX_STOPS_LIST_LENGTH) {
        this.stops.splice(0, 1);
      }
    }
  }
}

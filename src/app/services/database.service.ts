import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

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

  constructor(private storage: Storage) {
    this.storage.set(this.FAVORITE_STOP_NAME, 'Paradero');
    this.storage.set(this.FAVORITE_STOP_CODE, 'PI587');
  }

  setFavoriteStopCode(code: string) {
    this.storage.set(this.FAVORITE_STOP_CODE, code);
  }

  setFavoriteStopName(name: string) {
    this.storage.set(this.FAVORITE_STOP_NAME, name);
  }

  // Obtiene el valor de la base de datos segun la llave que se le pase
  getValueFromDB(key: string) {
    return this.storage.get(key).then(
      (value) => {
        return value;
      }
    );
  }

  removeValueFromDB(key: string) {
    this.storage.remove(key);
  }
}

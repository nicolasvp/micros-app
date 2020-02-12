import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private storage: Storage) {
    this.storage.set('favorite_stop', 'PI587');
  }

  setStopAsFavorite(stopCode: string) {
    this.storage.set('favorite_stop', stopCode);
  }

  getFavoriteStop() {
    return this.storage.get('favorite_stop').then(
      (value) => {
        return value;
      }
    );
  }
}

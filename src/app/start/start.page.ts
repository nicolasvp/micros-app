import { Component, OnInit } from '@angular/core';
import { StopsService } from '../services/stops.service';
import { Stop } from '../interfaces/stop';
import { Bip } from '../interfaces/bip';
import { BipService } from '../services/bip.service';
import { DatabaseService } from '../services/database.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-start',
  templateUrl: 'start.page.html',
  styleUrls: ['start.page.scss']
})
export class StartPage implements OnInit {

  nextArrivals: Stop[] = [];
  bipInfo: Bip;
  bipSpinner: boolean = true;
  stopSpinner: boolean = true;
  stopErrorPresent: boolean = false;
  stopErrorMessage: string = '';
  bipErrorPresent: boolean = false;
  bipErrorMessage: string = '';
  STOP_NAME_MAX_LENGTH: string = '20';
  BIP_NUMBER_MAX_LENGTH: string = '12';
  favoriteStop = {
    code: '',
    name: ''
  };

  constructor(private stopService: StopsService,
              private bipService: BipService,
              private databaseService: DatabaseService,
              private alertController: AlertController) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.getStopInfo();
    this.getBipInfo();
  }

  ionViewDidLeave() {
    this.nextArrivals = [];
    this.bipInfo = null;
    this.displayErrors('bip', '', false, true);
    this.displayErrors('stop', '', false, true);
  }

  // Obtiene la información del paradero obteniendo el codigo y nombre desde la base de datos 
  async getStopInfo() {
    this.favoriteStop.code = await this.getInfoFromDB('stop_code');
    this.favoriteStop.name = await this.getInfoFromDB('stop_name');
    if (this.favoriteStop.code !== null) {
      this.stopService.getNextArrivals(this.favoriteStop.code).subscribe(
        response => {
          this.nextArrivals.push(...response.results);
          this.stopSpinner = false;
        },
        error => {
          this.displayErrors('stop', 'Error al cargar información, inténtelo nuevamente.', true, false);
        }
      );
    } else {
      this.displayErrors('stop', '¡Agregue un paradero como favorito!', true, false);
    }
  }

  async getBipInfo() {
    const bipNumber = await this.databaseService.getValueFromDB('bip_card');
    if (bipNumber !== null) {
      this.bipService.getBipInfo(bipNumber).subscribe(
        response => {
          this.bipInfo = response;
          this.displayErrors('bip', '', false, false);
        },
        error => {
          console.log('Error al cargar saldo bip');
          this.displayErrors('bip', 'Error al carga saldo bip', true, false);
          this.bipInfo = null;
        }
      );
    } else {
      this.displayErrors('bip', '¡Agregue el numero de su bip!', true, false);
    }
  }

  doRefresh(event) {
    this.displayErrors('stop', '', false, true);
    this.displayErrors('bip', '', false, true);
    this.nextArrivals = [];
    this.bipInfo = null;
    this.getStopInfo();
    this.getBipInfo();
    event.target.complete();
    this.getInfoFromDB('stop_code');
    this.getInfoFromDB('stop_name');
  }

  // Obtiene el paradero favorito guardado
  async getInfoFromDB(key: string) {
    return await this.databaseService.getValueFromDB(key);
  }

  // Despliega ventana(alert) para setear un nombre custom para el paradero favorito
  async addFavoriteStopName() {
    const startAlert = await this.alertController.create({
      header: 'Nombre personalizado',
      inputs: [
        {
          id: 'stopName',
          name: 'stopName',
          type: 'text',
          placeholder: 'Ej: Casa',
          value: this.favoriteStop.name
        }
      ],
      buttons: [
        {
          text: 'Aceptar',
          role: 'accept',
          handler: (data) => {
            this.setFavoriteStopNameOnDB(data.stopName.trim());
            this.favoriteStop.name = data.stopName.trim();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        }
      ]
    });

    // Setea el maximo largo del input
    await startAlert.present()
    .then(data => {
      document.getElementById('stopName').setAttribute('maxlength', this.STOP_NAME_MAX_LENGTH);
    });
  }

  setFavoriteStopNameOnDB(name: string) {
    this.databaseService.setFavoriteStopName(name);
  }

  async addBipCard(name: string) {
    const bipAlert = await this.alertController.create({
      header: 'Número de tarjeta',
      inputs: [
        {
          id: 'cardNumber',
          name: 'cardNumber',
          type: 'text',
          placeholder: 'Ej: 12345678',
          value: this.bipInfo ? this.bipInfo.id : ''
        }
      ],
      buttons: [
        {
          text: 'Aceptar',
          role: 'accept',
          handler: async (data) => {
            if (data.cardNumber.trim() !== '' && !isNaN(data.cardNumber.trim())) {
              await this.setBipCardOnDB(data.cardNumber.trim());
              this.displayErrors('bip', '', false, true);
              this.getBipInfo();
            }
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        }
      ]
    });

    // Setea el maximo largo del input
    await bipAlert.present()
    .then(data => {
      document.getElementById('cardNumber').setAttribute('maxlength', this.BIP_NUMBER_MAX_LENGTH);
    });
  }

  setBipCardOnDB(bipNumber: number) {
    this.databaseService.setBipCard(bipNumber);
  }

  // Despliega los errores y spinners
  displayErrors(type: string, message: string, present: boolean, spinner: boolean) {
    if (type === 'bip') {
      this.bipErrorPresent = present;
      this.bipErrorMessage = message;
      this.bipSpinner = spinner;
    } else if (type === 'stop') {
      this.stopErrorPresent = present;
      this.stopErrorMessage = message;
      this.stopSpinner = spinner;
    }
  }
}

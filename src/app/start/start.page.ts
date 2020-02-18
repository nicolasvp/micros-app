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

  // Al entrar a la vista carga la información de las proximas micros que llegarán y de la tarjeta bip
  ionViewWillEnter() {
    this.getStopInfo();
    this.getBipInfo();
  }

  /**
   * Vacía la lista de las proximas micros que vendrán
   * Vacía la información de la bip
   * Borra los mensajes de error y muestra los spinners
   */
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

  // Obtiene la informacion de la tarjeta bip desde la base de datos para despues mostrarla en la vista
  async getBipInfo() {
    const bipLastUpdate = await this.databaseService.getValueFromDB('bip_last_update');
    if (bipLastUpdate === null) {
      this.setBipLastUpdateOnDB(this.getCurrentDate());
    }
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

  /**
   * Evento para refrescar la vista cuando se desliza hacia abajo, el cual realiza las siguientes acciones:
   * Quita todos los mensajes de error y spinners
   * Actualiza la información del paradero para mostrar los nuevos tiempos de las micros que llegarán
   * Actualiza la información de la tarjeta bip
   * Actualiza(obtiene) el nombre personalizado del paradero
   * @param event
   */
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
 
  /**
   * Obtiene el paradero favorito guardado
   * @param key: string, nombre de la llave del json con el cual se guardó la información en la base de datos
   */
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

  // Agrega una nueva tarjeta bip através de un alert que contiene un input para ingresar el numero de esta
  async addBipCard() {
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
            /**
             * Quita los espacios en blanco de los costados y valida que sea un numero el ingresado
             * Luego remueve los errores y spinner desplegados(si es que los hay)
             * Obtiene la información de la tarjeta bip ingresada para mostrarla en la vista
             */
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

  /**
   * Guarda en la base de datos el numero de la tarjeta bip
   * @param bipNumber: number, numero de la tarjeta bip que está impreso en el plastico
   */
  setBipCardOnDB(bipNumber: number) {
    this.databaseService.setBipCard(bipNumber);
  }

  /**
   * Guarda en la base de datos la fecha de la ultima actualización en que se consultó el saldo de la tarjeta bip
   * @param lastUpdate: string, fecha de la ultima actualización del saldo de la tarjeta bip
   */
  setBipLastUpdateOnDB(lastUpdate: string) {
    this.databaseService.setBipLastUpdate(lastUpdate);
  }

  /**
   * Guarda en la base de datos el nombre personalizado ingresado para el paradero elegido como favorito
   * @param name: string, nombre personalizado del paradero favorito
   */
  setFavoriteStopNameOnDB(name: string) {
    this.databaseService.setFavoriteStopName(name);
  }


  /**
   * Despliega los errores y spinners
   * @param type: string, tipo de error que se mostrará: bip o stop
   * @param message: string, mensaje que se mostrará en el error
   * @param present: boolean, permite mostrar o no el error, true = mostrar, false = esconder
   * @param spinner: boolean, permite mostrar o no el spinner, true = mostrar, false = esconder
   */
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

  // Obtiene la fecha actual y le da el formato dd/mm/yyyy
  getCurrentDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
  }
}

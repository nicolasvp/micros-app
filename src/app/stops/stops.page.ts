import { Component, ViewChild, ElementRef } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { StopsService } from '../services/stops.service';
import { Stop } from '../interfaces/stop';
import { DatabaseService } from '../services/database.service';
import { StopsPopOverComponent } from '../component/stops-pop-over/stops-pop-over.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stops',
  templateUrl: 'stops.page.html',
  styleUrls: ['stops.page.scss']
})
export class StopsPage {

  stops: Stop[] = [];
  stopsSpinner: boolean = false;
  errorPresent: boolean = false;
  errorMessage: string = '';
  stopCode: string = '';
  subcriber: Subscription = new Subscription();

  @ViewChild('fabGroup', {static: false}) fabGroup;

  constructor(private stopsService: StopsService,
              private alertController: AlertController,
              private databaseService: DatabaseService,
              private popoverController: PopoverController) {
              }

  // Al entrar en la vista de paraderos obtiene los paraderos buscados recientemente.
  ionViewWillEnter() {
    this.getRecentStops();
  }

  /**
   * Se desuscribe de cualquier llamada que esté esperando
   * Cuando se sale de la vista se fuerza a cerrar el fab group(boton '+')
   */
  ionViewDidLeave() {
    this.subcriber.unsubscribe();
    this.fabGroup.close();
  }

  // Obtiene desde la base de datos los paraderos guardados
  async getRecentStops() {
    this.stops = await this.databaseService.getValueFromDB('stops_list');
  }

  /**
   * Agrega el paradero como favorito, guardando en la base de datos el stop_code y removiendo el stop_name
   * Luego cierra el popover
   * @param stopCode: string, codigo del paradero Ej: PI587
   */
  addStopAsFavorite(stopCode: string) {
    this.databaseService.setFavoriteStopCode(stopCode);
    this.databaseService.removeValueFromDB('stop_name');
    this.dismissPopOver();
  }

  /**
   * Despliega una ventana(popover) con opciones para el paradero
   * @param stopCode: string, codigo del paradero Ej: PI587
   */
  async stopOptions(stopCode: any) {
    const stopOptions = await this.popoverController.create({
      component: StopsPopOverComponent,
      event: stopCode,
      translucent: true,
      componentProps: {stopCode, stopFunctions: this}
    });

    return await stopOptions.present();
  }

  // Despliega ventana(alert) con un input para ingresar un nuevo paradero
  async addNewStop() {
    const stopAlert = await this.alertController.create({
      header: 'Ingrese código',
      inputs: [
        {
          id: 'stopCode',
          name: 'stopCode',
          type: 'text',
          placeholder: 'Ej: PI1'
        }
      ],
      buttons: [
        {
          text: 'Aceptar',
          role: 'accept',
          handler: () => {
            console.log('Confirm Ok');
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }
      ]
    });

    // Setea el maximo largo del input para restringir el maximo
    await stopAlert.present()
    .then(data => {
      document.getElementById('stopCode').setAttribute('maxlength', '7');
    });

    // Valida que el input no esté vacío, si lo está no hace nada
    stopAlert.onDidDismiss()
    .then((data) => {
      this.stopCode = typeof(data.data) !== 'undefined' ? data.data.values.stopCode.trim() : null;
      const role = data.role;

      if (role === 'accept' && this.stopCode !== '') {
        this.getStopInfoAndAddToDB(this.stopCode);
      }
    });
  }

  /**
   * Despliega ventana(alert) para eliminar un paradero, realiza una confirmacion
   * @param stopCode: string, codigo del paradero Ej: PI587
   */
  async deleteStop(stopCode: string) {
    const stopAlert = await this.alertController.create({
      header: 'Eliminar paradero',
      message: '¿Desea borrar esta paradero?',
      buttons: [
        {
          text: 'Aceptar',
          handler: async () => {
            await this.databaseService.removeStopFromList(stopCode);
            this.getRecentStops();
            this.dismissPopOver();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }
      ]
    });

    await stopAlert.present();
  }

  /**
   * Evita la duplicidad de los paraderos
   * Válida si el paradero ya está en la lista, si lo está retorna true, sino false
   * @param stopCode: string, codigo del paradero Ej: PI587
   */
  checkStopInList(stopCode: string): boolean {
    let isPresent = false;
    if (this.stops !== null) {
      this.stops.forEach( value => {
        if (value.stop_code === stopCode.toUpperCase()) {
          isPresent = true;
        }
      });
    }
    return isPresent;
  }

  /**
   * Obtiene la información del paradero mediante el codigo del paradero
   * Luego lo agrega a la base de datos
   * Finalmente quita el spinner y mensajes de errores presentes si es que no surge una excepcion
   * @param stopCode: string, codigo del paradero Ej: PI587
   */
  getStopInfoAndAddToDB(stopCode: string) {
    if (!this.checkStopInList(stopCode)) {
      this.stopsSpinner = true;
      this.subcriber = this.stopsService.getStopInfo(stopCode.toUpperCase()).subscribe(
        async response => {
          await this.addStopInfo(response);
          this.getRecentStops();
          this.stopsSpinner = false;
          this.errorPresent = false;
          this.errorMessage = null;
        },
        error => {
          console.log(error);
          if (error.status === 404) {
            this.errorMessage = `Paradero ${stopCode} no encontrado.`;
          } else {
            this.errorMessage = 'Error al cargar información, inténtelo nuevamente.';
          }
          this.errorPresent = true;
          this.stopsSpinner = false;
        }
      );
    }
  }

  /**
   * Guarda la información del paradero en la base de datos
   * @param stopInfo: Stop, información del paradero(stop_name, stop_id, etc)
   */
  async addStopInfo(stopInfo: Stop) {
    await this.databaseService.addStopWithObject(stopInfo);
  }

  // Cierra ventana(popover) con las opciones del paradero
  async dismissPopOver() {
    await this.popoverController.dismiss();
  }
}

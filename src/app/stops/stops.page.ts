import { Component, ViewChild, ElementRef } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { StopsService } from '../services/stops.service';
import { Stop } from '../interfaces/stop';
import { DatabaseService } from '../services/database.service';
import { StopsPopOverComponent } from '../component/stops-pop-over/stops-pop-over.component';

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

  @ViewChild('fabGroup', {static: false}) fabGroup;

  constructor(private stopsService: StopsService,
              private alertController: AlertController,
              private databaseService: DatabaseService,
              private popoverController: PopoverController) {
              }

  ionViewWillEnter() {
    this.getRecentStops();
  }

  ionViewDidLeave() {
    // Cierra el fab group cuando sale de la pagina
    this.fabGroup.close();
  }

  async getRecentStops() {
    this.stops = await this.databaseService.getValueFromDB('stops_list');
  }

  // Agrega el paradero como favorito, seteando el stop_code y removiendo el stop_name
  addStopAsFavorite(stopCode: string) {
    this.databaseService.setFavoriteStopCode(stopCode);
    this.databaseService.removeValueFromDB('stop_name');
    this.dismissPopOver();
  }

  // Despliega una ventana(popover) con opciones para el paradero
  async stopOptions(stopCode: any) {
    const stopOptions = await this.popoverController.create({
      component: StopsPopOverComponent,
      event: stopCode,
      translucent: true,
      componentProps: {stopCode: stopCode, stopFunctions: this}
    });

    return await stopOptions.present();
  }

  // Despliega ventana(alert) para ingresar un nuevo paradero
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

    // Setea el maximo largo del input
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
        this.getStopInfo(this.stopCode);
      }
    });
  }

  // Despliega ventana(alert) para eliminar un paradero
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

  // Obtiene la información del paradero
  getStopInfo(stopCode: string) {
    if (!this.checkStopInList(stopCode)) {
      this.stopInfoCall(stopCode);
    }
  }

  // Válida si el paradero ya está en la lista, si lo está no hace nada
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

  // Realiza la llamada al servicio de Stops para obtener los paraderos
  stopInfoCall(stopCode: string) {
    this.stopsSpinner = true;
    this.stopsService.getStopInfo(stopCode.toUpperCase()).subscribe(
      async response => {
        await this.databaseService.addStopWithObject(response);
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

  // Cierra ventana(popover) con las opciones del paradero
  async dismissPopOver() {
    await this.popoverController.dismiss();
  }
}

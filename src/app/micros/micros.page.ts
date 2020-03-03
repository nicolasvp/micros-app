import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Micro } from '../interfaces/micro';
import { StopsService } from '../services/stops.service';
import { MicrosService } from '../services/micros.service';
import { PopoverController } from '@ionic/angular';
import { MicrosPopOverComponent } from '../component/micros-pop-over/micros-pop-over.component';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../services/database.service';
import { Stop } from '../interfaces/stop';
import { NavController } from '@ionic/angular';
import { Util } from '../utils/util';

@Component({
  selector: 'app-micros',
  templateUrl: 'micros.page.html',
  styleUrls: ['micros.page.scss']
})
export class MicrosPage implements OnInit {

  stopCode: string = '';
  micros: Micro [] = [];
  microsSpinner: boolean = true;
  errorPresent: boolean = true;
  errorMessage: string = '';
  subcriber: Subscription = new Subscription();

  constructor(private activatedRoute: ActivatedRoute,
              private stopService: StopsService,
              private microsService: MicrosService,
              public popoverController: PopoverController,
              private databaseService: DatabaseService,
              public navCtrl: NavController) {}

  // Se mantiene el ultimo paradero cargado para que no se pierda la ultima información
  ngOnInit() {
    this.stopCode = this.activatedRoute.snapshot.paramMap.get('stopCode');
  }

  // Recarga el resultado de las micros que vienen al paradero cuando se vuelve a entrar a la pagina
  ionViewWillEnter() {
    this.stopCode = this.activatedRoute.snapshot.paramMap.get('stopCode');
    this.getMicrosInfo();
    this.addStopToDB();
  }

  /**
   * Se desuscribe de cualquier llamada que esté esperando
   * Se quita el spinner de micros
   * Se vacia la lista de micros
   */
  ionViewDidLeave() {
    this.subcriber.unsubscribe();
    this.microsSpinner = false;
    this.micros = [];
  }

  /**
  * Refresca la pagina cargando nuevamente la informacion de las micros
  * @param event
  */
  doRefresh(event) {
    this.errorPresent = false;
    if (this.stopCode !== '') {
      this.getMicrosInfo();
    }
    event.target.complete();
  }

  /**
   * Obtiene la lista de paraderos de la base de datos y luego valida si el paradero está en la lista
   * Si el paradero no está, entonces lo agrega y si está no lo agrega
   */
  async addStopToDB() {
    let stopsList = [];
    if (this.stopCode !== null) {
      stopsList = await this.getInfoFromDB('stops_list'); // devuelve un array o null
      if (!Util.checkStopInList(stopsList, this.stopCode)) {
        stopsList = await this.addStopWithStopCode(this.stopCode);
      }
    }

    return stopsList;
  }

  /**
   * @param stopCode: string, codigo del paradero, Ej: PI587
   * @return stopsArray: promise, arreglo(Stop[]) de paraderos guardados en la base de datos
   */
  async addStopWithStopCode(stopCode){
    return await this.databaseService.addStopWithStopCode(stopCode);
  }

  /**
   * Obtiene la informacion de la base de datos segun la llave que se le pase
   * @param key: string, llave del json para buscar en la base de datos
   * @return value: puede ser un string o un array
   */
  async getInfoFromDB(key: string) {
    return await this.databaseService.getValueFromDB(key);
  }

  // Obtiene el tiempo en que llegaran las proximas micros
  getMicrosInfo() {
    if (this.stopCode === null) {
      this.microsSpinner = false;
    } else {
      this.microsSpinner = true;
      this.subcriber = this.stopService.getNextArrivals(this.stopCode).subscribe(
        response => {
          this.micros = response.results;
          this.microsSpinner = false;
          this.errorPresent = false;
          this.errorMessage = '';
        },
        error => {
          console.log(error);
          this.errorMessage = error;
          this.microsSpinner = false;
          this.errorPresent = true;
        }
      );
    }
  }

  /**
   * Despliega un popOver con las direcciones a las cuales puede ir la micro seleccionada
   * @param microCode: any, codigo de la micro Ej: PI587
   * @param direction: string, direccion a la que se dirige la micro, puede ser 0 o 1
   */
  async microOptions(microCode: any, direction: string) {
    const microOptions = await this.popoverController.create({
      component: MicrosPopOverComponent,
      event: microCode,
      translucent: true,
      componentProps: {microCode: microCode, microFunctions: this}
    });

    await microOptions.present();
  }

  /**
   * Redirige hacia la vista map
   * @param microCode: string, codigo de la micro Ej: PI587
   * @param direction: string, direccion a la que se dirige la micro, puede ser 0 o 1
   */
  getMicrosDirections(microCode: string, direction: string) {
    this.dismissPopOver();
    this.navCtrl.navigateForward(`/tabs/map/${microCode}/${direction}`);
  }

  // Cierra ventana(popover) con las opciones del paradero
  async dismissPopOver() {
    await this.popoverController.dismiss();
  }
}

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
  subcriber: Subscription = null;

  constructor(private activatedRoute: ActivatedRoute,
              private stopService: StopsService,
              private microsService: MicrosService,
              public popoverController: PopoverController,
              private databaseService: DatabaseService) {}

  // Se mantiene el ultimo paradero cargado para que no se pierda la ultima información
  ngOnInit() {
    this.stopCode = this.activatedRoute.snapshot.paramMap.get('stopCode');
  }

  // Recarga el resultado de las micros que vienen al paradero cuando se vuelve a entrar a la pagina
  ionViewWillEnter() {
    this.stopCode = this.activatedRoute.snapshot.paramMap.get('stopCode');
    this.getMicros();
    this.addStopToDB();
  }

  ionViewDidLeave() {
    if (this.subcriber !== null) {
      this.subcriber.unsubscribe();
    }
    this.microsSpinner = false;
    this.micros = [];
  }

  async addStopToDB() {
    if (this.stopCode !== null) {
      const stopsList = await this.getInfoFromDB('stops_list');
      if (!this.checkStopInList(stopsList)) {
        this.databaseService.addStopWithStopCode(this.stopCode);
      }
    }
  }

  // Válida si el paradero ya está en la lista, si lo está no hace nada
  checkStopInList(stops: Stop[]): boolean {
    let isPresent = false;
    stops.forEach( value => {
      if (value.stop_code === this.stopCode.toUpperCase()) {
        isPresent = true;
      }
    });
    return isPresent;
  }

  async getInfoFromDB(key: string) {
    return await this.databaseService.getValueFromDB(key);
  }

  getMicros() {
    if (this.stopCode !== null) {
      this.getMicrosInfo();
    } else {
      this.microsSpinner = false;
    }
  }

  doRefresh(event) {
    this.errorPresent = false;
    if (this.stopCode !== '') {
      this.getMicrosInfo();
    }
    event.target.complete();
  }

  // Obtiene el tiempo en que llegaran las proximas micros
  getMicrosInfo() {
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

  async microOptions(microCode: any, direction: string) {
    const microOptions = await this.popoverController.create({
      component: MicrosPopOverComponent,
      event: microCode,
      translucent: true,
      componentProps: {microCode: microCode, microFunctions: this}
    });

    await microOptions.present();
  }

  getMicrosDirections(microCode: string, direction: string) {
    console.log('cargando...')
    this.microsService.getMicroRouteByDirection(microCode, direction).subscribe(
      response => {
      console.log(response);
    });
    this.dismissPopOver();
  }

  // Cierra ventana(popover) con las opciones del paradero
  async dismissPopOver() {
    await this.popoverController.dismiss();
  }
}

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
  bipAmount: Bip;
  bipSpinner: boolean = true;
  arrivalsSpinner: boolean = true;
  errorPresent: boolean = false;
  errorMessage: string = '';
  MAX_LENGTH: string = '20';
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
    this.bipAmount = null;
    this.bipSpinner = true;
    this.arrivalsSpinner = true;
    this.errorPresent = false;
  }

  async getStopInfo() {
    this.favoriteStop.code = await this.getInfoFromDB('stop_code');
    this.favoriteStop.name = await this.getInfoFromDB('stop_name');
    this.stopService.getNextArrivals(this.favoriteStop.code).subscribe(
      response => {
        this.nextArrivals.push(...response.results);
        this.arrivalsSpinner = false;
      },
      error => {
        this.errorMessage = 'Error al cargar información, inténtelo nuevamente.';
        this.arrivalsSpinner = false;
        this.errorPresent = true;
      }
    );
  }

  getBipInfo() {
    this.bipService.getBipAmount().subscribe(
      response => {
        this.bipAmount = response;
        this.bipSpinner = false;
      }
    );
  }

  doRefresh(event) {
    this.errorPresent = false;
    this.bipSpinner = true;
    this.arrivalsSpinner = true;
    this.nextArrivals = [];
    this.bipAmount = null;
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
      header: 'Ingrese nombre',
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
      document.getElementById('stopName').setAttribute('maxlength', this.MAX_LENGTH);
    });
  }

  setFavoriteStopNameOnDB(name: string) {
    this.databaseService.setFavoriteStopName(name);
  }
}

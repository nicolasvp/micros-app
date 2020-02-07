import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Micro } from '../interfaces/micro';
import { StopsService } from '../services/stops.service';
import { MicrosService } from '../services/micros.service';
import { PopoverController } from '@ionic/angular';
import { MicrosPopOverComponent } from '../component/micros-pop-over/micros-pop-over.component';

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

  constructor(private activatedRoute: ActivatedRoute,
              private stopService: StopsService,
              private microsService: MicrosService,
              public popoverController: PopoverController) {}

  // Se mantiene el ultimo paradero cargado para que no se pierda la ultima información
  ngOnInit() {
    this.microsService.getMicrosByStopCode('I03', '0').subscribe(
      response => {
      //console.log(response);
    });
    this.stopCode = this.activatedRoute.snapshot.paramMap.get('stopCode');
    this.getMicros();
  }

  getMicros() {
    if (this.stopCode !== '') {
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

  getMicrosInfo() {
    this.microsSpinner = true;
    this.stopService.getNextArrivalsFromStop(this.stopCode).subscribe(
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

  async microOptions(microId: any, direction: string) {

    const microOptions = await this.popoverController.create({
      component: MicrosPopOverComponent,
      event: microId,
      translucent: true,
      componentProps: {microId: microId, microFunctions: this}
    });

    await microOptions.present();
  }
}

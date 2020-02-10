import { Component, OnInit } from '@angular/core';
import { StopsService } from '../services/stops.service';
import { Stop } from '../interfaces/stop';
import { Bip } from '../interfaces/bip';
import { BipService } from '../services/bip.service';

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

  constructor(private stopService: StopsService, private bipService: BipService) {}

  ngOnInit() {
  }

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

  getStopInfo() {
    this.stopService.getNextArrivals('PI587').subscribe(
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
  }
}

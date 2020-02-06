import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { MicrosService } from '../../services/micros.service';

@Component({
  selector: 'app-micros-pop-over',
  templateUrl: './micros-pop-over.component.html'
})
export class MicrosPopOverComponent implements OnInit {

  microId: string = '';
  outbound = {
    direction: '',
    headSign: ''
  };
  inbound = {
    direction: '',
    headSign: ''
  };
  microSpinner = true;

  constructor(private navParams: NavParams, private microsService: MicrosService) {
    this.microId = this.navParams.get('microId');
  }

  ionViewWillEnter() {
    this.microsService.getDirectionsByMicroId(this.microId).subscribe(
      response => {
        this.outbound.headSign = response[0] ? response[0].direction_headsign : '';
        this.outbound.direction = response[0] ? response[0].direction_id : '';
        this.inbound.headSign = response[1] ? response[1].direction_headsign : '';
        this.inbound.direction = response[1] ? response[1].direction_id : '';
        this.microSpinner = false;
      },
      error => {
        console.log(error);
      }
    );
  }

  ngOnInit() {}

  getRoute(microId: string) {
    console.log(microId)
    //this.navParams.data.microFunctions.getRoute(microId);
  }
}

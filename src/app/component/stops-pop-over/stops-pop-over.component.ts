import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-popover',
  templateUrl: './stops-pop-over.component.html',
  styleUrls: ['./stops-pop-over.component.scss'],
})
export class StopsPopOverComponent implements OnInit {

  stopId = null;

  constructor(public navParams: NavParams) {
    this.stopId = this.navParams.get('stopId');
  }

  ngOnInit() {}

  favStop(stopId: string) {
    this.navParams.data.stopFunctions.addAsFavorite(stopId);
  }

  deleteStop(stopId: string) {
    this.navParams.data.stopFunctions.deleteStop(stopId);
  }
}

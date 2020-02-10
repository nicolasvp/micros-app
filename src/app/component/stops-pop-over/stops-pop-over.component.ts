import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-popover',
  templateUrl: './stops-pop-over.component.html',
  styleUrls: ['./stops-pop-over.component.scss'],
})
export class StopsPopOverComponent implements OnInit {

  stopCode = null;

  constructor(public navParams: NavParams) {
    this.stopCode = this.navParams.get('stopCode');
  }

  ngOnInit() {}

  favStop(stopCode: string) {
    this.navParams.data.stopFunctions.addAsFavorite(stopCode);
  }

  deleteStop(stopCode: string) {
    this.navParams.data.stopFunctions.deleteStop(stopCode);
  }
}

import { MapPage } from '../../app/map/map.page';
import { StopsService } from '../../app/services/stops.service';
import { MicrosService } from '../../app/services/micros.service';
import { MapService } from '../../app/services/map.service';
import { DatabaseService } from '../../app/services/database.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/throw';
import { ActivatedRoute } from '@angular/router';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { NgZone } from '@angular/core';
import { NavController } from '@ionic/angular';

declare var google;

describe('Pruebas unitarias para Map Page', () => {

  let mapPage: MapPage;
  let geolocation: Geolocation;
  let mapService: MapService = new MapService(null);
  let stopsService: StopsService = new StopsService(null);
  let ngZone: NgZone;
  let navCtrl: NavController;
  let activatedRoute: ActivatedRoute;
  let microsService: MicrosService = new MicrosService(null);

  beforeEach(() => {
    mapPage = new MapPage(
      geolocation,
      mapService,
      stopsService,
      ngZone,
      navCtrl,
      activatedRoute,
      microsService);
  });

  xit("formatStopName, deberia retornar 'Las Torres / Simon Bolivar'", () => {

    const result = mapPage.formatStopName('PI1-Las Torres / Simon Bolivar');

    const resultExpected = 'Las Torres / Simon Bolivar';

    expect(result).toBe(resultExpected);
  });

  xit("formatStopName, deberia retornar ''", () => {

    const result = mapPage.formatStopName('');

    const resultExpected = '';

    expect(result).toBe(resultExpected);
  });
  
});

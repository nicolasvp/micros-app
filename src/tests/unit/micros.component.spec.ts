import { MicrosPage } from '../../app/micros/micros.page';
import { StopsService } from '../../app/services/stops.service';
import { MicrosService } from '../../app/services/micros.service';
import { DatabaseService } from '../../app/services/database.service';
import { AlertController, PopoverController, NavController } from '@ionic/angular';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/throw';
import { ActivatedRoute } from '@angular/router';


describe('Pruebas unitarias para Micros Page', () => {

  let microsPage: MicrosPage;
  let stopService: StopsService = new StopsService(null);
  let databaseService: DatabaseService = new DatabaseService(null, null);
  let popoverController: PopoverController = new PopoverController(null, null, null);
  let activatedRoute: ActivatedRoute;
  let microsService: MicrosService = new MicrosService(null);
  let navCtrl: NavController;
  const STOPS_MOCK = [
    {
      stop_code: 'PI1'
    },
    {
      stop_code: 'PI587'
    },
    {
      stop_code: 'PB13'
    }
  ];

  beforeEach(() => {
    microsPage = new MicrosPage(
      activatedRoute,
      stopService,
      microsService,
      popoverController,
      databaseService,
      navCtrl);
  });

  it('checkStopInList, deberia retornar true, ya que el elemento buscado si está en la lista', () => {
    microsPage.stopCode = 'PI587';

    const result = microsPage.checkStopInList(STOPS_MOCK);

    const resultExpected = true;

    expect(result).toBe(resultExpected);
  });

  it('checkStopInList, deberia retornar false, ya que el elemento buscado no está en la lista', () => {
    microsPage.stopCode = 'PI600';

    const result = microsPage.checkStopInList(STOPS_MOCK);

    const resultExpected = false;

    expect(result).toBe(resultExpected);
  });

  it('checkStopInList, deberia retornar false, ya que el array de stops es null', () => {
    const result = microsPage.checkStopInList(null);

    const resultExpected = false;

    expect(result).toBe(resultExpected);
  });

});

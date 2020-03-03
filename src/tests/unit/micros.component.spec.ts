import { MicrosPage } from '../../app/micros/micros.page';
import { StopsService } from '../../app/services/stops.service';
import { MicrosService } from '../../app/services/micros.service';
import { DatabaseService } from '../../app/services/database.service';
import { PopoverController, NavController } from '@ionic/angular';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/throw';
import { ActivatedRoute } from '@angular/router';
import { Util } from 'src/app/utils/util';


describe('Pruebas unitarias para Micros Page', () => {

  let microsPage: MicrosPage;
  let stopService: StopsService = new StopsService(null);
  let databaseService: DatabaseService = new DatabaseService(null, null);
  let popoverController: PopoverController = new PopoverController(null, null, null);
  let activatedRoute: ActivatedRoute;
  let microsService: MicrosService = new MicrosService(null);
  let navCtrl: NavController;
  let STOPS_MOCK = [];

  beforeEach(() => {
    microsPage = new MicrosPage(
      activatedRoute,
      stopService,
      microsService,
      popoverController,
      databaseService,
      navCtrl);

    STOPS_MOCK = [
        {stop_code: 'PI1', stop_name: 'Pajaritos'},
        {stop_code: 'PI587', stop_name: 'Simon bolivar'},
        {stop_code: 'PB13', stop_name: 'Las torres'}
      ];
  });

  it('addStopToDB, no deberia agregar nada por que stopCode es null)', async () => {
    microsPage.stopCode = null;

    const result = await microsPage.addStopToDB();
    const resultExpected = 0;

    expect(result.length).toEqual(resultExpected);
  });

  it('addStopToDB, no deberia agregar ningun paradero por que ya está en la lista', async () => {
    microsPage.stopCode = 'PI1';

    spyOn(microsPage, 'getInfoFromDB')
    .withArgs('stops_list').and.returnValue(Promise.resolve(STOPS_MOCK));

    spyOn(Util, 'checkStopInList')
    .and.returnValue(true);

    const result = await microsPage.addStopToDB();
    const resultExpected = 3;

    expect(result.length).toEqual(resultExpected);
  });

  it('addStopToDB, deberia agregar un paradero a lista', async () => {
    microsPage.stopCode = 'PI2';
    STOPS_MOCK.push({stop_name: 'test', stop_code: 'PI2'});

    spyOn(microsPage, 'getInfoFromDB')
    .withArgs('stops_list').and.returnValue(Promise.resolve(STOPS_MOCK));

    spyOn(Util, 'checkStopInList')
    .and.returnValue(false);

    spyOn(microsPage, 'addStopWithStopCode')
    .withArgs(microsPage.stopCode).and.returnValue(Promise.resolve(STOPS_MOCK));

    const result = await microsPage.addStopToDB();
    const resultExpected = 4;

    expect(result.length).toEqual(resultExpected);
  });

  it('getMicrosInfo, deberia setear microsSpinner como false, ya que el stopCode es null', () => {
    microsPage.stopCode = null;
    microsPage.getMicrosInfo();
    expect(microsPage.microsSpinner).toBeFalsy();
  });

  it('getMicrosInfo, deberia setear el array de micros', async () => {
    microsPage.stopCode = 'PI587';

    const MICROS_MOCK = [
      {
        bus_plate_number: 'ASD23',
        route_id: 'I03',
        is_live: true,
        bus_distance: '100'
      }
    ]

    spyOn(stopService, 'getNextArrivals').and.callFake( arg => {
      return Observable.from([MICROS_MOCK]);
    });

    await microsPage.getMicrosInfo();
    const resultExpected = MICROS_MOCK.length;

    expect(microsPage.microsSpinner).toBeFalsy();
    expect(microsPage.errorPresent).toBeFalsy();
    expect(microsPage.errorMessage).toBe('');
  });

  it('getMicrosInfo, no deberia setear el array de micros ya que ocurrió un error en la llamada', async () => {
    microsPage.stopCode = 'PI587';
    const msgExpected = 'Error al obtener la informacion';

    spyOn(stopService, 'getNextArrivals').and.callFake( arg => {
      return Observable.throw(msgExpected);
    });

    await microsPage.getMicrosInfo();

    expect(microsPage.errorMessage).toBe(msgExpected);
    expect(microsPage.microsSpinner).toBeFalsy();
    expect(microsPage.errorPresent).toBeTruthy();
  });

});

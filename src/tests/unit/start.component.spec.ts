import { StartPage } from '../../app/start/start.page';
import { StopsService } from '../../app/services/stops.service';
import { BipService } from '../../app/services/bip.service';
import { DatabaseService } from '../../app/services/database.service';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/throw';

describe('Pruebas unitarias para Start Page', () => {

  let startPage: StartPage;
  let stopService: StopsService = new StopsService(null);
  let bipService: BipService = new BipService(null, null);
  let databaseService: DatabaseService = new DatabaseService(null, null);
  let alertController: AlertController = new AlertController();

  beforeEach(() => {
    startPage = new StartPage(stopService, bipService, databaseService, alertController);
  });
 
  it('getCurrentDate, deberia contener el año 2020', () => {

    const currentDate = startPage.getCurrentDate();
    const expectedDate = '20/02/2020';

    expect(currentDate).toContain('2020');
  });

  it('displayErrors, deberia setear el mensaje de display como vacío', () => {

    startPage.displayErrors('bip', '', false, false);
    expect(startPage.bipErrorMessage).toBe('');

    startPage.displayErrors('stop', '', false, false);
    expect(startPage.stopErrorMessage).toBe('');
  });


  // Con async se indica que se está testeando una función asincrona y que devolverá una promesa
  it('getStopInfo, deberia guardar datos en el arreglo de nextArrivals', async () => {

    // Mock de respuesta del servicio stopService que retorna la llegada de las proximas micros al paradero
    const nextArrivalsMock = {
      'results' : ['arrival1', 'arrival2']
    };

    /**
     * Si se llama getInfoFromDB con el argumento 'stop_code' se devuelve 'PI587'
     * Si se llama con el argumento 'stop_name' se devuelve 'Casa'
     */
    /* Esta es una manera de hacerlo
     spyOn(startPage, 'getInfoFromDB')
    .withArgs('stop_code').and.returnValue(Promise.resolve('PI587'))
    .withArgs('stop_name').and.returnValue(Promise.resolve('Casa'));
    */
    spyOn(startPage, 'getInfoFromDB').and.callFake( arg => {
      if (arg === 'stop_code') {
        return Promise.resolve('PI587');
      }
      if (arg === 'stop_name') {
        return Promise.resolve('Casa');
      }
      return Promise.resolve(arg);
    });

    // Spy para servicio stopService, retorna una respuesta(nextArraivalsMock) similar a la del API
    spyOn(stopService, 'getNextArrivals').and.callFake( arg => {
      return Observable.from([nextArrivalsMock]);
    });

    await startPage.getStopInfo();

    expect(startPage.favoriteStop.code).toBe('PI587');
    expect(startPage.favoriteStop.name).toBe('Casa');
    expect(startPage.nextArrivals.length).toBeGreaterThan(0);
  });


  it("getStopInfo, deberia mostrar el mensaje '¡Agregue un paradero como favorito!'", async () => {

    const msgExpected = '¡Agregue un paradero como favorito!';

    //Si se llama getInfoFromDB con el argumento 'stop_code' y 'stop_name' se devuelve null
    spyOn(startPage, 'getInfoFromDB')
    .withArgs('stop_code').and.returnValue(Promise.resolve(null))
    .withArgs('stop_name').and.returnValue(Promise.resolve(null));

    await startPage.getStopInfo();

    expect(startPage.favoriteStop.code).toBe(null);
    expect(startPage.favoriteStop.name).toBe(null);
    expect(startPage.stopErrorPresent).toBe(true);
    expect(startPage.stopErrorMessage).toBe(msgExpected);
    expect(startPage.stopSpinner).toBe(false);
  });

  it("getStopInfo, deberia mostrar el mensaje de error 'Error al cargar información, inténtelo nuevamente.'", async () => {

    const msgExpected = 'Error al cargar información, inténtelo nuevamente.';

     spyOn(startPage, 'getInfoFromDB')
    .withArgs('stop_code').and.returnValue(Promise.resolve('PI587'))
    .withArgs('stop_name').and.returnValue(Promise.resolve('Casa'));

    // Spy para servicio stopService, retorna una respuesta(nextArraivalsMock) similar a la del API
    spyOn(stopService, 'getNextArrivals').and.callFake( arg => {
      return Observable.throw(msgExpected);
    });

    await startPage.getStopInfo();

    expect(startPage.favoriteStop.code).toBe('PI587');
    expect(startPage.favoriteStop.name).toBe('Casa');
    expect(startPage.stopErrorPresent).toBe(true);
    expect(startPage.stopErrorMessage).toBe(msgExpected);
    expect(startPage.stopSpinner).toBe(false);
  });

  it('getBipInfo, deberia guardar datos de la tarjeta bip', async () => {

    const bipInfoExpected = {
      'id': 1,
      estadoContrato: '123',
      saldoTarjeta: '500',
      fechaSaldo: '21/02/2020'
    };

    spyOn(startPage, 'getInfoFromDB')
    .withArgs('bip_number').and.returnValue(Promise.resolve('12345678'));

    // Spy para servicio bipService, retorna una respuesta(bipInfoExpected) similar a la del API
    spyOn(bipService, 'getBipInfo').and.callFake( arg => {
      return Observable.from([bipInfoExpected]);
    });

    // Spy para metodo setBipInfoOnDB de startPage que no retorna nada
    spyOn(startPage, 'setBipInfoOnDB').and.callFake( arg => {
      return Observable.empty();
    });

    await startPage.getBipInfo();

    expect(startPage.bipInfo).not.toBe(null);
    expect(startPage.bipErrorPresent).toBe(false);
    expect(startPage.bipErrorMessage).toBe('');
    expect(startPage.bipSpinner).toBe(false);
  });

  it("getBipInfo, deberia mostrar el mensaje de error 'Error al cargar saldo bip.'", async () => {

    const msgExpected = 'Error al cargar saldo bip.';

    spyOn(startPage, 'getInfoFromDB')
    .withArgs('bip_number').and.returnValue(Promise.resolve('12345678'));

    // Spy para servicio bipService, retorna una respuesta(bipInfoExpected) similar a la del API
    spyOn(bipService, 'getBipInfo').and.callFake( arg => {
      return Observable.throw(msgExpected);
    });

    await startPage.getBipInfo();

    expect(startPage.bipInfo).toBeNull();
    expect(startPage.bipErrorPresent).toBe(true);
    expect(startPage.bipErrorMessage).toBe(msgExpected);
    expect(startPage.bipSpinner).toBe(false);
  });

  it("getBipInfo, deberia mostrar el mensaje de error '¡Agregue el numero de su bip!'", async () => {

    const msgExpected = '¡Agregue el numero de su bip!';

    spyOn(startPage, 'getInfoFromDB')
    .withArgs('bip_number').and.returnValue(Promise.resolve(null));

    await startPage.getBipInfo();

    expect(startPage.bipErrorPresent).toBe(true);
    expect(startPage.bipErrorMessage).toBe(msgExpected);
    expect(startPage.bipSpinner).toBe(false);
  });

  it("getBipLastUpdate, deberia retornar true ya que las fechas son distintas", async () => {

    spyOn(startPage, 'getInfoFromDB')
    .withArgs('bip_last_update').and.returnValue(Promise.resolve('20/02/2020'));

    spyOn(startPage, 'getCurrentDate').and.returnValue('21/02/2020');

    // Spy para metodo setBipLastUpdateOnDB de startPage que no retorna nada
    spyOn(startPage, 'setBipLastUpdateOnDB').and.callFake( arg => {
      return Observable.empty();
    });

    const result = await startPage.getBipLastUpdate();

    expect(result).toBeTruthy();
  });

  it("getBipLastUpdate, deberia retornar true ya que la fecha de la ultima actualizacion es null", async () => {

    spyOn(startPage, 'getInfoFromDB')
    .withArgs('bip_last_update').and.returnValue(null);

    spyOn(startPage, 'getCurrentDate').and.returnValue('21/02/2020');

    // Spy para metodo setBipLastUpdateOnDB de startPage que no retorna nada
    spyOn(startPage, 'setBipLastUpdateOnDB').and.callFake( arg => {
      return Observable.empty();
    });

    const result = await startPage.getBipLastUpdate();

    expect(result).toBeTruthy();
  });

  it("getBipLastUpdate, deberia retornar false ya que las fechas son iguales", async () => {

    const bipInfoExpected = {
      'id': 1,
      estadoContrato: '123',
      saldoTarjeta: '500',
      fechaSaldo: '21/02/2020'
    };

    spyOn(startPage, 'getInfoFromDB')
    .withArgs('bip_last_update').and.returnValue(Promise.resolve('21/02/2020'))
    .withArgs('bip_info').and.returnValue(Promise.resolve(bipInfoExpected));

    spyOn(startPage, 'getCurrentDate').and.returnValue('21/02/2020');

    // Spy para metodo setBipLastUpdateOnDB de startPage que no retorna nada
    spyOn(startPage, 'setBipLastUpdateOnDB').and.callFake( arg => {
      return Observable.empty();
    });

    const result = await startPage.getBipLastUpdate();

    expect(result).toBeFalsy();
    expect(startPage.bipErrorMessage).toBe('');
    expect(startPage.bipErrorPresent).toBe(false);
    expect(startPage.bipSpinner).toBe(false);
    expect(startPage.bipInfo).not.toBe(null);
  });
});

import { StartPage } from './start.page';
import { StopsService } from '../services/stops.service';
import { BipService } from '../services/bip.service';
import { DatabaseService } from '../services/database.service';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { from } from 'rxjs/add/observable/from';

describe('Pruebas unitarias para Start Page', () => {

  let startPage: StartPage;
  let stopService: StopsService = new StopsService(null);
  let bipService: BipService = new BipService(null, null);
  let databaseService: DatabaseService = new DatabaseService(null, null);
  let alertController: AlertController = new AlertController();

  beforeEach(function() {
    startPage = new StartPage(stopService, bipService, databaseService, alertController);
  });
  
  it('Deberia contener el año 2020', () => {
    
    const currentDate = startPage.getCurrentDate();
    const expectedDate = '20/02/2020';

    expect(currentDate).toContain('2020');
  });

  it('Deberia setear el mensaje de display como vacío', () => {
    
    startPage.displayErrors('bip', '', false, false);

    expect(startPage.bipErrorMessage).toBe('');
  });


  // Con async se indica que se está testeando una función asincrona y que devolverá una promesa
  it('Deberia obtener y setear los valores iniciales para el objeto favoriteStop', async () => {

    /**
     * Si se llama getInfoFromDB con el argumento 'stop_code' se devuelve 'PI587'
     * Si se llama con el argumento 'stop_name' se devuelve 'Casa'
     */
    /* Esta es una manera de hacerlo
     spyOn(startPage, 'getInfoFromDB')
    .withArgs('stop_code').and.returnValue(Promise.resolve('PI587'))
    .withArgs('stop_name').and.returnValue(Promise.resolve('Casa'));
    */
    spyOn(startPage, 'getInfoFromDB').and.callFake(function(arg){
      if(arg === 'stop_code') 
        return Promise.resolve('PI587');
      
      if(arg === 'stop_name') 
        return Promise.resolve('Casa');
      
      return Promise.resolve(arg);
    });

    const result = await startPage.getStopInfo();

    expect(startPage.favoriteStop.code).toBe('PI587');
    expect(startPage.favoriteStop.name).toBe('Casa');

    const nextArrivalsMock = ['micro1', 'micro2'];
    spyOn(stopService, 'getNextArrivals').and.callFake( () => {
      return from([nextArrivalsMock]);
    });

    expect(startPage.nextArrivals).toBeGreaterThan(0);

  });


});

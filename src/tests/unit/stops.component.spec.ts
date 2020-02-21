import { StopsPage } from '../../app/stops/stops.page';
import { StopsService } from '../../app/services/stops.service';
import { DatabaseService } from '../../app/services/database.service';
import { AlertController, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/throw';


describe('Pruebas unitarias para Stops Page', () => {

  let stopsPage: StopsPage;
  let stopService: StopsService = new StopsService(null);
  let databaseService: DatabaseService = new DatabaseService(null, null);
  let alertController: AlertController = new AlertController();
  let popoverController: PopoverController = new PopoverController(null, null, null);

  beforeEach(() => {
    stopsPage = new StopsPage(stopService, alertController, databaseService, popoverController);
    stopsPage.stops = [
        {
            stop_lat: '123.2',
            stop_code: 'PI587',
            stop_lon: '321.1',
            agency_id: 'TD',
            stop_id: '1',
            stop_name: 'Paradero de prueba'
        }
    ];
  });
 
  it('checkStopInList, deberia retornar true, ya que el elemento buscado si está en la lista', () => {

    const result = stopsPage.checkStopInList('PI587');

    const resultExpected = true;
    
    expect(result).toBe(resultExpected);
  });

  it('checkStopInList, deberia retornar false, ya que la lista de paraderos(stops) es null', () => {

    stopsPage.stops = [];

    const result = stopsPage.checkStopInList('PI587');

    const resultExpected = false;

    expect(result).toBe(resultExpected);
  });

  it('checkStopInList, deberia retornar false, ya que el elemento buscado no está en la lista', () => {

    stopsPage.stops = [];
    
    const result = stopsPage.checkStopInList('PF123');

    const resultExpected = false;

    expect(result).toBe(resultExpected);
  });
});

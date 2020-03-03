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
  const STOP_CODE = 'PI587';

  beforeEach(() => {
    stopsPage = new StopsPage(stopService, alertController, databaseService, popoverController);
    stopsPage.stops = [
        {
            stop_lat: '123.2',
            stop_code: STOP_CODE,
            stop_lon: '321.1',
            agency_id: 'TD',
            stop_id: '1',
            stop_name: 'Paradero de prueba'
        }
    ];
  });

});

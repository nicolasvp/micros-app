import { StartPage } from '../../app/start/start.page';
import { StopsService } from '../../app/services/stops.service';
import { BipService } from '../../app/services/bip.service';
import { DatabaseService } from '../../app/services/database.service';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/throw';

describe('Pruebas de integracion para Start Page', () => {

  let startPage: StartPage;
  let stopService: StopsService = new StopsService(null);
  let bipService: BipService = new BipService(null, null);
  let databaseService: DatabaseService = new DatabaseService(null, null);
  let alertController: AlertController = new AlertController();

  beforeEach(() => {
    startPage = new StartPage(stopService, bipService, databaseService, alertController);
  });
 
  it('Deberia contener el año 2020', () => {

    const currentDate = startPage.getCurrentDate();
    const expectedDate = '20/02/2020';

    expect(currentDate).toContain('2020');
  });
});

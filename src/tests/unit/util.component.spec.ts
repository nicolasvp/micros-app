import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/throw';
import { Util } from 'src/app/utils/util';


describe('Pruebas unitarias para Util', () => {

    const STOPS_MOCK = [
        {'stop_code' : 'PI123'},
        {'stop_code' : 'PB322'},
        {'stop_code' : 'PI587'}
    ];
    const STOP_CODE = 'PI587';

    it('checkStopInList, deberia retornar true, ya que el elemento buscado si está en la lista', () => {
        const result = Util.checkStopInList(STOPS_MOCK, STOP_CODE);
        const resultExpected = true;
        expect(result).toBe(resultExpected);
    });

    it('checkStopInList, deberia retornar false, ya que la lista de paraderos(stops) es null', () => {
        const result = Util.checkStopInList([], STOP_CODE);
        const resultExpected = false;
        expect(result).toBe(resultExpected);
    });

    it('checkStopInList, deberia retornar false, ya que el elemento buscado no está en la lista', () => {
        const result = Util.checkStopInList(STOPS_MOCK, 'PA999');
        const resultExpected = false;
        expect(result).toBe(resultExpected);
    });
});

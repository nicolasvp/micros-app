import { Stop } from '../interfaces/stop';

export class Util {

    /**
     * Formatea el nombre del paradero para dejarlo sin el codigo al inicio
     * Ej: PI1-Las Torres / Simon Bolivar => Las Torres / Simon Bolivar
     * @param stopName: string, nombre del paradero
     */
    static formatStopName(stopName: string) {
        const splits = stopName.split('-');
        if (splits.length > 1) {
            length = splits[0].length;
            return stopName.substr(length + 1, stopName.length);
        } else {
            return stopName;
        }
    }

    /**
     * Valida si el paradero ya está en la lista de paradero,
     * si lo está no hace nada devuelve true si está o false si no está
     * @param stops: arreglo de Stop que se recorrerá para determinar si está o no el paradero
     * @return boolean: true o false
     */
    static checkStopInList(stops: Stop[], stopCode: string): boolean {
        let isPresent = false;
        if (stops !== null) {
            stops.forEach( value => {
            // tslint:disable-next-line: curly
            if (value.stop_code === stopCode.toUpperCase())
                isPresent = true;
            });
        }
        return isPresent;
    }

    // Obtiene la fecha actual y le da el formato dd/mm/yyyy
    static getCurrentDate() {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = today.getFullYear();
        return dd + '/' + mm + '/' + yyyy;
    }
}

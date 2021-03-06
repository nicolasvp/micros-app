import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Stop } from '../interfaces/stop';
import { MapService } from '../services/map.service';
import { StopsService } from '../services/stops.service';
import { NgZone } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MicrosService } from '../services/micros.service';

declare var google;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, AfterViewInit {

  map: any;
  latitude: number;
  longitude: number;
  currentPosition: any;
  stopsAround: Stop[] = [];
  stopsAroundPositions: any[] = [];
  stopMarkers: any[] = [];
  infoWindow: any = null;
  customIcon = {
    url: 'assets/icon/favicon.png', // image url
    scaledSize: new google.maps.Size(20, 20), // scaled size
  };
  showSpinner: boolean = true;
  subcriber: Subscription;
  shapesDirections: any[] = [];

  @ViewChild('mapElement', {static: false}) mapElement: ElementRef;

  constructor(public geolocation: Geolocation,
    private mapService: MapService,
    private stopsService: StopsService,
    public ngZone: NgZone,
    public navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private microsService: MicrosService) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  /**
   * Carga los paraderos segun la posición al inicio cuando se va a entrar a la vista
   * Adicionalmente si se pasan los parametros microCode y direction entonces se dibujará el recorrido de la micro
   */
  ionViewWillEnter() {
    const microCode = this.activatedRoute.snapshot.paramMap.get('microCode');
    const direction = this.activatedRoute.snapshot.paramMap.get('direction');

    this.geolocation.getCurrentPosition().then((geoposition: Geoposition) => {
      this.getLatAndLog(geoposition);
      this.setDefaultMap();
      this.setCurrentPositionOnMap();
      this.getStopsAround();
      if (direction !== null && microCode !== null) {
        this.getRouteAndDraw(microCode, parseInt(direction));
      }
    })
    .catch((error) => {
      console.log('Error getting location', error);
    });
  }

  // Setea los arrays como empty para que no se acumulen cuando se vuelvan a cargar al momento de volver a la pagina
  ionViewDidLeave() {
    this.stopsAround = [];
    this.stopsAroundPositions = [];
    this.stopMarkers = [];
    this.showSpinner = true;
    document.getElementById('map').style.display = 'none';
  }

  getLatAndLog(geoposition: Geoposition) {
    this.latitude = geoposition.coords.latitude;
    this.longitude = geoposition.coords.longitude;
  }

  // Setea una posición inicial en el mapa
  setDefaultMap() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: {lat: -33.41271959, lng: -70.6061205}, // parque titanium, las condes
      zoom: 16,
      clickableIcons: false
    });
    this.map.addListener('click', () => {
      this.closeWindowInfo();
    });
  }

  // Setea la posición actual en el mapa
  setCurrentPositionOnMap() {
    this.currentPosition = {
      lat: this.latitude,
      lng: this.longitude
    };
    this.map.setCenter(this.currentPosition);
    const myPositionMarker = new google.maps.Marker({
      position: new google.maps.LatLng(this.latitude, this.longitude),
      map: this.map,
      title: 'AQUI ESTOY!'
    });
  }

  /**
   * Obtiene los puntos(lat y lon) del recorrido de la micro
   * Crea un array con los puntos y luego dibuja en el mapa una linea roja pasando por todos los puntos
   * @param direction: number, direccion del recorrido de la micro, puede ser 0 o 1
   * @param microCode: string, codigo de la micro Ej: I03
   */
  getRouteAndDraw(microCode: string, direction: number) {
    this.microsService.getMicroRouteByDirection(microCode, direction).subscribe(
      response => {
        const points = response.map(shape => {
          return {
            lat: parseFloat(shape.shape_pt_lat),
            lng: parseFloat(shape.shape_pt_lon)
          };
        });
        this.drawRoute(points);
        //const shapesAsPositions = this.setShapesAsPositions(response);
        //this.setShapeMarkers(shapesAsPositions);
        this.showSpinner = false;
        document.getElementById('map').style.display = 'block';
    });
  }

  /**
   * Dibuja con una linea roja la ruta de la micro
   * Se basa en un array con los puntos(latitud, longitud) entregados por la API
   * @param points: any, array con los puntos de la ruta
   */
  drawRoute(points: any[]) {
    const microRoute = new google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    microRoute.setMap(this.map);
  }

/*
  // Crea un arreglo con las posiciones de las direcciones
  setShapesAsPositions(shapes: any[]) {
    const shapesPositions = [];
    shapes.forEach( shape => {
      shapesPositions.push({
        position: new google.maps.LatLng(shape.shape_pt_lat, shape.shape_pt_lon)
      });
    });
    return shapesPositions;
  }

  // Crea un arreglo de markers segun los shapes de la micro
  setShapeMarkers(shapesAsPositions: any[]) {
    const shapesMarkers = [];
    shapesAsPositions.forEach( shape => {
      shapesMarkers.push(new google.maps.Marker({
        position: shape.position,
        //icon: this.customIcon,
        animation: 'DROP',
        map: this.map
      }));
    });
  }
*/

  /* Obtiene todos los paraderos de alrededor segun lat y lon y los guarda en un arreglo
  * Guarda las posiciones de los paraderos en un arreglo
  * Crea los markers para todos los paraderos
  */
  getStopsAround() {
    this.mapService.getStopsAround(this.latitude, this.longitude).subscribe(
      response => {
        this.stopsAround.push(...response.results.stops);
        this.setStopsAsPositions();
        this.setMarkers();
        this.buildInfoWindow();
        this.showSpinner = false;
        document.getElementById('map').style.display = 'block';
      },
      error => {
        console.log(error);
      }
    );
  }

  // Crea un arreglo con las posiciones de cada paradero
  setStopsAsPositions() {
    this.stopsAround.forEach( stop => {
      this.stopsAroundPositions.push({
        position: new google.maps.LatLng(stop.stop_lat, stop.stop_lon)
      });
    });
  }

  // Crea un arreglo de markers segun los paraderos que están alrededor
  setMarkers() {
    this.stopsAroundPositions.forEach( stop => {
      this.stopMarkers.push(new google.maps.Marker({
        position: stop.position,
        icon: this.customIcon,
        map: this.map
      }));
    });
  }

  /*
  * Setea informacion de los paraderos con la lista de micros que paran en él
  * Asigna el evento click a cada marker y cuando se clickea llama al servicio Stops
  * Luego setea la informacion en un cuadro HTML
  */
  buildInfoWindow() {
    this.createInfoWindow();
    this.stopMarkers.forEach( (stop, index) => {
      stop.addListener('click', () => {
        this.setSpinnerOnInfoWindow();
        const currentStop = this.stopsAround[index];
        this.infoWindow.open(this.map, stop);
        this.subcriber = this.stopsService.getMicros(currentStop.stop_id).subscribe(
          response => {
            this.setInfoWindowContent(response, currentStop, stop);
          },
          error => {
            console.log(error);
            this.infoWindow.setContent('Error al carga info');
          }
        );
      });
    });
  }

  /**
   * Crea el objeto de infoWindow con un ancho maximo de 400px
   * Se maneja solo 1 objeto de infoWindow para mantener solo 1 activo a la vez en todo el mapa
   */
  createInfoWindow() {
    this.infoWindow = new google.maps.InfoWindow({
      maxWidth: 400
    });
  }

  // Setea un spinner en el windowInfo mientras se carga la info desde la API
  setSpinnerOnInfoWindow() {
    this.infoWindow.setContent('<ion-spinner name="lines"></ion-spinner>');
  }

  /**
   * Crea el contenido del windowInfo con el evento de click y toda la informacion
   * @param micros: array, arreglo con todas las micros que se dirigen al paradero
   * @param currentStop: objeto stop, paradero actual
   * @param stop: any, objeto de paradero de la api de google
   */
  setInfoWindowContent(micros: any[], currentStop: Stop, stop: any) {
    this.infoWindow.setContent(this.setContentMarker(micros, currentStop));
    this.infoWindow.open(this.map, stop);
    this.infoWindow.addListener('domready', () => {
      const infoWindowContent = document.getElementById(currentStop.stop_id);
      if (infoWindowContent) {
        infoWindowContent.addEventListener('click', () => {
          this.navCtrl.navigateForward(`/tabs/micros/${currentStop.stop_id}`);
        });
      }
    });
    // Cancela la petición cuando se cierra el marker
    this.infoWindow.addListener('closeclick', () => {
      this.subcriber.unsubscribe();
    });
  }


  /**
   * Retorna el HTML en un string con la información que se muestra en el marker
   * @param micros: array, arreglo con todas las micros que se dirigen al paradero
   * @param currentStop: objeto stop, paradero actual
   */
  setContentMarker(micros: any[], currentStop: Stop) {
    let microsBadges: string = '';

    // Crea los badges de las micros en forma de string
    micros.forEach(micro => {
      microsBadges += '<ion-badge style="margin-right: 3px;">' + micro + '</ion-badge>';
    });

    return '<div id="' + currentStop.stop_id + '">' +
              '<ion-label style="font-size: 15px;">' +
                '<strong>' + this.formatStopName(currentStop.stop_name) + '(' + currentStop.stop_id + ')' + '</strong>' +
              '</ion-label>' +
              '<br><br>' +
              '<ion-label style="font-size: 13px;">' + microsBadges + '</ion-label>' +
            '</div>';
  }

  /**
   * Formatea el nombre del paradero para dejarlo sin el codigo al inicio
   * Ej: PI1-Las Torres / Simon Bolivar => Las Torres / Simon Bolivar
   * @param stopName: string, nombre del paradero
   */
  formatStopName(stopName: string) {
    const splits = stopName.split('-');
    if (splits.length > 1) {
      length = splits[0].length;
      return stopName.substr(length + 1, stopName.length);
    } else {
      return stopName;
    }
  }

  // Cierra el infoWindow que está abierto
  closeWindowInfo() {
    if (this.infoWindow) {
      this.infoWindow.close();
    }
  }
}

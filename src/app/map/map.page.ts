import { Component, OnInit, AfterContentInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Stop } from '../interfaces/stop';
import { MapService } from '../services/map.service';
import { StopsService } from '../services/stops.service';
import { NgZone } from '@angular/core';
import { NavController } from '@ionic/angular';
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

  @ViewChild('mapElement', {static: false}) mapElement: ElementRef;

  constructor(public geolocation: Geolocation,
    private mapService: MapService,
    private stopsService: StopsService,
    public ngZone: NgZone,
    public navCtrl: NavController) { }

  ngOnInit(): void {}

  // Carga los paraderos segun la posición al inicio cuando se va a entrar a la vista
  ionViewWillEnter() {
    this.geolocation.getCurrentPosition().then((geoposition: Geoposition) => {
      this.getLatAndLog(geoposition);
      this.setDefaultMap();
      this.setCurrentPositionOnMap();
      this.getStopsAround();
      this.showSpinner = false;
      document.getElementById('map').style.display = 'block';
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
  }

  ngAfterViewInit(): void {}

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
    this.stopMarkers.forEach( (stop, index) => {
      stop.addListener('click', () => {
        this.closeWindowInfo();
        const currentStop = this.stopsAround[index];
        this.stopsService.getMicrosByStopCode(currentStop.stop_id).subscribe(
          response => {
            this.infoWindow = this.setContentToInfoWindow(response, currentStop);
            this.infoWindow.open(this.map, stop);
            this.infoWindow.addListener('domready', () => {
              const element = document.getElementById('info-window-content');
              if (element) {
                element.addEventListener('click', () => {
                  this.navCtrl.navigateForward(`/tabs/micros/${currentStop.stop_id}`);
                });
              }
            });
          },
          error => {
            console.log(error);
          }
        );
      });
    });
  }

  // Setea el ancho y contenido del marker
  setContentToInfoWindow(micros: any[], stop: Stop) {
    return new google.maps.InfoWindow({
      content: this.setContentMarker(micros, stop),
      maxWidth: 400
    });
  }

  // Retorna el HTML con la información que se muestra en el marker
  setContentMarker(micros: any[], stop: Stop) {
    let microsBadges: string = '';

    // Crea los badges de las micros en forma de string
    micros.forEach(micro => {
      microsBadges += '<ion-badge style="margin-right: 3px;">' + micro + '</ion-badge>';
    });

    return '<div id="info-window-content">' +
              '<ion-label style="font-size: 15px;">' +
                '<strong>' + this.formatStopName(stop.stop_name) + '(' + stop.stop_id + ')' + '</strong>' +
              '</ion-label>' +
              '<br><br>' +
              '<ion-label style="font-size: 13px;">' + microsBadges + '</ion-label>' +
            '</div>';
  }

  // Formatea el nombre del paradero para dejarlo sin el codigo al inicio
  // Ej: PI1-Las Torres / Simon Bolivar => Las Torres / Simon Bolivar
  formatStopName(value: string) {
    const splits = value.split('-');
    if (splits.length > 1) {
      length = splits[0].length;
      return value.substr(length + 1, value.length);
    } else {
      return value;
    }
  }

  // Cierra el infoWindow que está abierto para abrir un nuevo(la idea es mantener solo 1 abierto a la vez)
  closeWindowInfo() {
    if (this.infoWindow) {
      this.infoWindow.close();
    }
  }
}

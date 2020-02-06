import { NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SQLite } from '@ionic-native/sqlite/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatabaseService } from './services/database.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { StopsPopOverComponent } from './component/stops-pop-over/stops-pop-over.component';
import { MicrosPopOverComponent } from './component/micros-pop-over/micros-pop-over.component';
import { IonicGestureConfig } from './ionic-gesture-config';

@NgModule({
  declarations: [AppComponent, StopsPopOverComponent, MicrosPopOverComponent],
  entryComponents: [StopsPopOverComponent, MicrosPopOverComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule
    ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLite,
    DatabaseService,
    Geolocation,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: IonicGestureConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

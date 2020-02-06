import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StopsPage } from './stops.page';
import { SplitterPipe } from '../splitter.pipe';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: StopsPage }])
  ],
  declarations: [StopsPage, SplitterPipe]
})
export class StopsPageModule {}

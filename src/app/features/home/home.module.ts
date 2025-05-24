import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { MapModalComponent } from './map-modal/map-modal.component';

@NgModule({
  declarations: [
    HomeComponent,
    SearchbarComponent,
    MapModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: HomeComponent }
    ])
  ]
})
export class HomeModule { } 
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingsComponent } from './bookings.component';

@NgModule({
  declarations: [BookingsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: BookingsComponent }
    ])
  ]
})
export class BookingsModule { } 
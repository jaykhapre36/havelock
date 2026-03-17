import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyBookingsRoutingModule } from './my-bookings-routing.module';
import { MyBookingsComponent } from './my-bookings.component';

@NgModule({
  declarations: [MyBookingsComponent],
  imports: [CommonModule, RouterModule, MyBookingsRoutingModule]
})
export class MyBookingsModule { }

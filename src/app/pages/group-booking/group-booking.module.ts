import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GroupBookingRoutingModule } from './group-booking-routing.module';
import { GroupBookingComponent } from './group-booking.component';

@NgModule({
  declarations: [GroupBookingComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    GroupBookingRoutingModule
  ]
})
export class GroupBookingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { BookingRoutingModule } from './booking-routing.module';
import { BookingStateService } from './booking-state.service';

import { BookingComponent } from './booking.component';
import { Step1Component } from './step1/step1.component';
import { Step2Component } from './step2/step2.component';
import { Step4Component } from './step4/step4.component';

@NgModule({
  declarations: [
    BookingComponent,
    Step1Component,
    Step2Component,
    Step4Component
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BookingRoutingModule
  ],
  providers: [BookingStateService]
})
export class BookingModule { }

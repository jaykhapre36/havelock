import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AvailabilityRoutingModule } from './availability-routing.module';
import { AvailabilityComponent } from './availability.component';

@NgModule({
  declarations: [AvailabilityComponent],
  imports: [CommonModule, RouterModule, FormsModule, AvailabilityRoutingModule]
})
export class AvailabilityModule { }

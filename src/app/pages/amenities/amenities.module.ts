import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AmenitiesRoutingModule } from './amenities-routing.module';
import { AmenitiesComponent } from './amenities.component';

@NgModule({
  declarations: [AmenitiesComponent],
  imports: [CommonModule, RouterModule, AmenitiesRoutingModule]
})
export class AmenitiesModule { }

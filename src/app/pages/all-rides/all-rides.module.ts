import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AllRidesRoutingModule } from './all-rides-routing.module';
import { AllRidesComponent } from './all-rides.component';

@NgModule({
  declarations: [AllRidesComponent],
  imports: [CommonModule, RouterModule, FormsModule, AllRidesRoutingModule]
})
export class AllRidesModule { }

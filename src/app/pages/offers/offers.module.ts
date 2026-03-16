import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OffersRoutingModule } from './offers-routing.module';
import { OffersComponent } from './offers.component';

@NgModule({
  declarations: [OffersComponent],
  imports: [CommonModule, RouterModule, FormsModule, OffersRoutingModule]
})
export class OffersModule { }

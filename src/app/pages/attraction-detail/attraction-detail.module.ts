import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AttractionDetailRoutingModule } from './attraction-detail-routing.module';
import { AttractionDetailComponent } from './attraction-detail.component';

@NgModule({
  declarations: [AttractionDetailComponent],
  imports: [CommonModule, RouterModule, AttractionDetailRoutingModule]
})
export class AttractionDetailModule { }

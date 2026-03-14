import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttractionsRoutingModule } from './attractions-routing.module';
import { AttractionsComponent } from './attractions.component';

@NgModule({
  declarations: [AttractionsComponent],
  imports: [CommonModule, RouterModule, FormsModule, AttractionsRoutingModule]
})
export class AttractionsModule { }

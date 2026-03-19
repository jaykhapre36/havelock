import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyExtrasRoutingModule } from './my-extras-routing.module';
import { MyExtrasComponent } from './my-extras.component';

@NgModule({
  declarations: [MyExtrasComponent],
  imports: [CommonModule, RouterModule, MyExtrasRoutingModule]
})
export class MyExtrasModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupBookingComponent } from './group-booking.component';

const routes: Routes = [
  { path: '', component: GroupBookingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupBookingRoutingModule { }

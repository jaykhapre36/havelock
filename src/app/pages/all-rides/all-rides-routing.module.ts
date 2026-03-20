import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllRidesComponent } from './all-rides.component';

const routes: Routes = [{ path: '', component: AllRidesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllRidesRoutingModule { }

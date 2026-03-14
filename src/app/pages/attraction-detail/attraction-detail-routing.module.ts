import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttractionDetailComponent } from './attraction-detail.component';

const routes: Routes = [
  { path: '', component: AttractionDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttractionDetailRoutingModule { }

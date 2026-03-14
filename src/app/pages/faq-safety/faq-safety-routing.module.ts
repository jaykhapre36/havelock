import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqSafetyComponent } from './faq-safety.component';

const routes: Routes = [
  { path: '', component: FaqSafetyComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FaqSafetyRoutingModule { }

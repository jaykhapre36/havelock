import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyExtrasComponent } from './my-extras.component';

const routes: Routes = [{ path: '', component: MyExtrasComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyExtrasRoutingModule { }

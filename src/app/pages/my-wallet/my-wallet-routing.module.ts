import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyWalletComponent } from './my-wallet.component';

const routes: Routes = [{ path: '', component: MyWalletComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyWalletRoutingModule { }

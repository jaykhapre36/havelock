import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyWalletRoutingModule } from './my-wallet-routing.module';
import { MyWalletComponent } from './my-wallet.component';

@NgModule({
  declarations: [MyWalletComponent],
  imports: [CommonModule, RouterModule, MyWalletRoutingModule]
})
export class MyWalletModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PackagesRoutingModule } from './packages-routing.module';
import { PackagesComponent } from './packages.component';

@NgModule({
  declarations: [PackagesComponent],
  imports: [CommonModule, RouterModule, PackagesRoutingModule]
})
export class PackagesModule { }

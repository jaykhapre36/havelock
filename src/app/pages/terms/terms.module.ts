import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TermsRoutingModule } from './terms-routing.module';
import { TermsComponent } from './terms.component';

@NgModule({
  declarations: [TermsComponent],
  imports: [CommonModule, RouterModule, TermsRoutingModule]
})
export class TermsModule { }

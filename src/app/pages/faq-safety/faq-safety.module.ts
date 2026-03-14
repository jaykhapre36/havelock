import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaqSafetyRoutingModule } from './faq-safety-routing.module';
import { FaqSafetyComponent } from './faq-safety.component';

@NgModule({
  declarations: [FaqSafetyComponent],
  imports: [CommonModule, RouterModule, FormsModule, FaqSafetyRoutingModule]
})
export class FaqSafetyModule { }

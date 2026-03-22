import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdventureRoutingModule } from './adventure-routing.module';
import { AdventureComponent } from './adventure.component';

@NgModule({
  declarations: [AdventureComponent],
  imports: [CommonModule, RouterModule, FormsModule, AdventureRoutingModule]
})
export class AdventureModule { }

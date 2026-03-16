import { Component, OnInit } from '@angular/core';
import { BookingStateService, BookingState } from '../booking-state.service';

@Component({
  standalone: false,
  selector: 'app-bk-step4',
  templateUrl: './step4.component.html',
  styleUrls: ['./step4.component.scss']
})
export class Step4Component implements OnInit {

  state!: BookingState;

  constructor(private stateService: BookingStateService) {}

  ngOnInit(): void {
    this.state = this.stateService.snapshot;
  }

  get activeSelections() {
    return this.state.selections.filter(s => s.qty > 0);
  }
}

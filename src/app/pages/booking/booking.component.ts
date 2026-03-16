import { Component, OnDestroy } from '@angular/core';
import { BookingStateService } from './booking-state.service';

@Component({
  standalone: false,
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnDestroy {

  currentStep: 1 | 2 | 3 | 4 = 1;

  steps = [
    { n: 1, label: 'Tickets' },
    { n: 2, label: 'Details' },
    { n: 3, label: 'Review' },
    { n: 4, label: 'Done' }
  ];

  constructor(private stateService: BookingStateService) {}

  goTo(step: 1 | 2 | 3 | 4): void {
    this.currentStep = step;
  }

  onStep1Next(): void { this.currentStep = 2; }
  onStep2Next(): void { this.currentStep = 3; }
  onStep3Back(): void { this.currentStep = 2; }

  onStep3Confirm(): void {
    const ref = 'HVL-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    this.stateService.patchState({ bookingReference: ref });
    this.currentStep = 4;
  }

  ngOnDestroy(): void {
    this.stateService.reset();
  }
}

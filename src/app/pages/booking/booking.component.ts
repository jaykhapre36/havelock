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

  // Step3 now navigates to /my-bookings directly after payment — this is unused
  onStep3Confirm(): void {}

  ngOnDestroy(): void {
    this.stateService.reset();
  }
}

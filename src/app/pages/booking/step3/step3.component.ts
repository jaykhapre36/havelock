import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BookingStateService, BookingState } from '../booking-state.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-bk-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.scss']
})
export class Step3Component implements OnInit {

  @Output() back    = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  state!: BookingState;
  loading = false;
  error = '';

  constructor(
    private stateService: BookingStateService,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.state = this.stateService.snapshot;
  }

  get activeSelections() {
    return this.state.selections.filter(s => s.qty > 0);
  }

  onBack(): void { this.back.emit(); }

  onConfirm(): void {
    this.error = '';
    const snap = this.stateService.snapshot;
    const user = this.authService.getCurrentUser();
    const selection = snap.selections.find(s => s.qty > 0);

    if (!selection || !snap.slotId || !user) {
      this.error = 'Missing booking details. Please go back and try again.';
      return;
    }

    this.loading = true;
    this.bookingService.bookOnline({
      ticket_type_id: 1,
      slot_id: snap.slotId,
      phone: user.phone,
      count: selection.qty
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          const ref = res.data?.booking_reference
            || (res.data?.booking_id ? `HVL-${res.data.booking_id}` : 'HVL-' + Math.random().toString(36).slice(2, 8).toUpperCase());
          this.stateService.patchState({ bookingReference: ref });
          this.confirm.emit();
        } else {
          this.error = res.message || 'Booking failed. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Booking failed. Please try again.';
      }
    });
  }
}

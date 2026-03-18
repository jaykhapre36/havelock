import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { BookingStateService, BookingState } from '../booking-state.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { PaymentService } from '../../../services/payment.service';

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
    private authService: AuthService,
    private paymentService: PaymentService,
    private router: Router
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

    this.paymentService.openCheckout(
      snap.grandTotal,
      { name: snap.visitor.fullName || user.name, email: snap.visitor.email || user.email, contact: user.phone },
      'Havelock Water Park Entry'
    ).then((payment) => {
      // Payment succeeded — now confirm booking
      this.bookingService.bookOnline({
        ticket_type_id: 1,
        slot_id: snap.slotId!,
        phone: user.phone,
        count: selection.qty,
        is_group: false,
        amount: snap.grandTotal,
        payment_method: 'upi',
        transaction_id: payment.razorpay_payment_id
      }).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.router.navigate(['/my-bookings']);
          } else {
            this.error = res.message || 'Booking failed after payment. Please contact support.';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Booking failed after payment. Please contact support.';
        }
      });
    }).catch((err) => {
      this.loading = false;
      if (err.message !== 'cancelled') {
        this.error = err.message || 'Payment failed. Please try again.';
      }
    });
  }
}

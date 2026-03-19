import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { BookingStateService, BookingState } from '../booking-state.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { PaymentService } from '../../../services/payment.service';
import { BookingSuccessData } from '../../booking-success/booking-success.component';

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
  paymentFailed = false;
  paymentFailedMsg = '';

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

  retryPayment(): void {
    this.paymentFailed = false;
    this.paymentFailedMsg = '';
    this.error = '';
  }

  onConfirm(): void {
    this.error = '';
    this.paymentFailed = false;
    this.paymentFailedMsg = '';

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
      // ✅ Payment succeeded — now save booking
      this.bookingService.bookOnline({
        ticket_type_id: snap.packageId ?? 1,
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
            const ref = res.data?.booking_reference
              || (res.data?.booking_id ? `HVL-${String(res.data.booking_id).padStart(4, '0')}` : '');
            const successData: BookingSuccessData = {
              bookingReference: ref,
              paymentId: payment.razorpay_payment_id,
              visitDate: snap.selectedDate,
              slotStart: snap.slotStart || '10:00:00',
              slotEnd:   snap.slotEnd   || '18:00:00',
              ticketLabel: selection.ticket.label,
              persons: selection.qty,
              totalAmount: snap.grandTotal,
              isGroup: false,
              customerName: snap.visitor.fullName || user.name,
              customerEmail: snap.visitor.email || user.email
            };
            this.router.navigate(['/booking-success'], { state: successData });
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
      // ❌ Payment failed or cancelled — do NOT call book-online
      this.loading = false;
      if (err.message === 'cancelled') {
        // User closed modal — silently reset, let them try again
      } else {
        this.paymentFailed = true;
        this.paymentFailedMsg = err.message || 'Your payment was unsuccessful. Please try again.';
      }
    });
  }
}

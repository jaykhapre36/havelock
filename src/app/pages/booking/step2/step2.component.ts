import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingStateService, BookingState } from '../booking-state.service';
import { AuthService } from '../../../services/auth.service';
import { BookingService } from '../../../services/booking.service';
import { PaymentService } from '../../../services/payment.service';
import { BookingSuccessData } from '../../booking-success/booking-success.component';

@Component({
  standalone: false,
  selector: 'app-bk-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss']
})
export class Step2Component implements OnInit {

  @Output() back = new EventEmitter<void>();

  form!: FormGroup;
  prefilled = false;

  loading = false;
  error = '';
  paymentFailed = false;
  paymentFailedMsg = '';
  agreedToTerms = false;

  constructor(
    private fb: FormBuilder,
    private stateService: BookingStateService,
    private authService: AuthService,
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const saved = this.stateService.snapshot.visitor;
    const user  = this.authService.getCurrentUser();

    const fullName = saved.fullName || user?.name  || '';
    const email    = saved.email    || user?.email || '';
    const phone    = saved.phone    || user?.phone || '';

    this.prefilled = true;

    this.form = this.fb.group({
      fullName: [{ value: fullName, disabled: true }, [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      email:    [{ value: email,    disabled: true }, [Validators.required, Validators.email]],
      phone:    [{ value: phone,    disabled: true }, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]]
    });
  }

  get state(): BookingState {
    return this.stateService.snapshot;
  }

  get activeSelections() {
    return this.state.selections.filter(s => s.qty > 0);
  }

  f(field: string) { return this.form.get(field); }

  isInvalid(field: string): boolean {
    const ctrl = this.f(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onBack(): void {
    this.back.emit();
  }

  retryPayment(): void {
    this.paymentFailed = false;
    this.paymentFailedMsg = '';
    this.error = '';
  }

  onConfirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.stateService.patchState({ visitor: this.form.getRawValue() });
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

    // Check for duplicate booking on same slot before opening payment
    this.bookingService.getMyBookings(user.phone).subscribe({
      next: (res) => {
        const alreadyBooked = (res?.data?.active_bookings ?? []).some(
          b => b.slot_date.slice(0, 10) === snap.selectedDate?.slice(0, 10)
        );
        if (alreadyBooked) {
          this.loading = false;
          this.error = 'You have already booked this slot. Only one booking is allowed per slot.';
          return;
        }
        this.proceedToPayment(snap, user, selection!);
      },
      error: () => {
        // If check fails, proceed anyway — server will reject duplicate
        this.proceedToPayment(snap, user, selection!);
      }
    });
  }

  private proceedToPayment(snap: any, user: any, selection: any): void {
    this.paymentService.openCheckout(
      snap.grandTotal,
      { name: snap.visitor.fullName || user.name, email: snap.visitor.email || user.email, contact: user.phone },
      'Havelock Water Park Entry'
    ).then((payment) => {
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

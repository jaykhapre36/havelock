import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface BookingSuccessData {
  bookingReference: string;   // e.g. "HVL-0042"
  paymentId: string;          // razorpay_payment_id
  visitDate: string;          // 'YYYY-MM-DD'
  slotStart: string;          // '10:00:00'
  slotEnd: string;            // '18:00:00'
  ticketLabel: string;        // 'General Admission'
  persons: number;
  totalAmount: number;
  isGroup: boolean;
  customerName: string;
  customerEmail: string;
}

@Component({
  standalone: false,
  selector: 'app-booking-success',
  templateUrl: './booking-success.component.html',
  styleUrls: ['./booking-success.component.scss']
})
export class BookingSuccessComponent implements OnInit {

  data: BookingSuccessData | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const state = history.state as BookingSuccessData;

    // Guard: if user lands here directly with no data, send them to my-bookings
    if (!state?.bookingReference) {
      this.router.navigate(['/my-bookings']);
      return;
    }

    this.data = state;
  }

  get slotTime(): string {
    if (!this.data) return '';
    const s = this.data.slotStart?.slice(0, 5) || '10:00';
    const e = this.data.slotEnd?.slice(0, 5)   || '18:00';
    return `${s} – ${e}`;
  }

  goToMyBookings(): void {
    this.router.navigate(['/my-bookings']);
  }

  bookAgain(): void {
    this.router.navigate(['/my-bookings']);
  }
}

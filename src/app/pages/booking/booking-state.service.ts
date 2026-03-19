import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Ticket } from '../../models/ticket.model';
import { Offer } from '../../models/offer.model';

export type DayType = 'weekday' | 'sunday';

export interface TicketSelection {
  ticket: Ticket;
  qty: number;
  lineTotal: number;
}

export interface VisitorDetails {
  fullName: string;
  email: string;
  phone: string;
}

export interface BookingState {
  packageId: number | null;
  packagePrice: number;
  bulkDiscount: boolean;
  selectedDate: string;
  dayType: DayType;
  slotId: number | null;
  slotStart: string;
  slotEnd: string;
  selections: TicketSelection[];
  promoCode: string;
  appliedOffer: Offer | null;
  visitor: VisitorDetails;
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  bookingReference: string;
}

const initialState: BookingState = {
  packageId: null,
  packagePrice: 0,
  bulkDiscount: false,
  selectedDate: '',
  dayType: 'weekday',
  slotId: null,
  slotStart: '',
  slotEnd: '',
  selections: [],
  promoCode: '',
  appliedOffer: null,
  visitor: { fullName: '', email: '', phone: '' },
  subtotal: 0,
  discountAmount: 0,
  grandTotal: 0,
  bookingReference: ''
};

@Injectable()
export class BookingStateService {

  private state = new BehaviorSubject<BookingState>({ ...initialState });
  state$ = this.state.asObservable();

  get snapshot(): BookingState {
    return this.state.getValue();
  }

  patchState(partial: Partial<BookingState>): void {
    this.state.next({ ...this.snapshot, ...partial });
    this.recalculate();
  }

  reset(): void {
    this.state.next({ ...initialState });
  }

  private recalculate(): void {
    const s = this.state.getValue();
    const subtotal = s.selections.reduce((sum, sel) => sum + sel.lineTotal, 0);
    let discountAmount = 0;
    if (s.bulkDiscount) {
      discountAmount = Math.round(subtotal * 10 / 100);
    } else if (s.appliedOffer) {
      discountAmount = s.appliedOffer.discountType === 'percentage'
        ? Math.round(subtotal * s.appliedOffer.discount / 100)
        : s.appliedOffer.discount;
    }
    const grandTotal = Math.max(0, subtotal - discountAmount);
    this.state.next({ ...s, subtotal, discountAmount, grandTotal });
  }
}

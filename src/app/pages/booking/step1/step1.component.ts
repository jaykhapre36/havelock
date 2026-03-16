import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketsService } from '../../../services/tickets.service';
import { OffersService } from '../../../services/offers.service';
import { BookingStateService, DayType, TicketSelection } from '../booking-state.service';

const BOOKABLE_TYPES = ['general', 'group'];
const GROUP_MIN_QTY = 10;

@Component({
  standalone: false,
  selector: 'app-bk-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss']
})
export class Step1Component implements OnInit {

  @Output() next = new EventEmitter<void>();

  loading = false;
  selections: TicketSelection[] = [];
  activeDayType: DayType = 'weekday';
  selectedDate = '';
  promoCode = '';
  promoLoading = false;
  promoSuccess = '';
  promoError = '';
  noTicketError = false;

  dayTypes = [
    { key: 'weekday' as DayType, label: 'Mon – Sat' },
    { key: 'sunday'  as DayType, label: 'Sunday'    }
  ];

  private preSelectType = '';

  constructor(
    private route: ActivatedRoute,
    private ticketsService: TicketsService,
    private offersService: OffersService,
    private stateService: BookingStateService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.selectedDate = this.formatDate(today);

    const params = this.route.snapshot.queryParams;
    if (params['dayType'] && ['weekday', 'sunday'].includes(params['dayType'])) {
      this.activeDayType = params['dayType'] as DayType;
    } else {
      this.activeDayType = this.detectDayType(today);
    }
    if (params['type']) {
      this.preSelectType = params['type'];
    }

    // Restore state if returning from step 2
    const snap = this.stateService.snapshot;
    if (snap.selectedDate) this.selectedDate = snap.selectedDate;
    if (snap.dayType)      this.activeDayType = snap.dayType;
    if (snap.promoCode)    this.promoCode = snap.promoCode;

    this.loadTickets();
  }

  setDayType(type: DayType): void {
    this.activeDayType = type;
    this.loadTickets();
  }

  onDateChange(): void {
    const d = new Date(this.selectedDate);
    this.activeDayType = this.detectDayType(d);
    this.loadTickets();
  }

  private loadTickets(): void {
    this.loading = true;
    const prevSelections = this.stateService.snapshot.selections;

    this.ticketsService.getByDayType(this.activeDayType).subscribe(tickets => {
      const bookable = tickets.filter(t => BOOKABLE_TYPES.includes(t.type));

      this.selections = bookable.map(ticket => {
        const prev = prevSelections.find(s => s.ticket.type === ticket.type);
        const qty = prev ? prev.qty : (ticket.type === this.preSelectType ? 1 : 0);
        return { ticket, qty, lineTotal: ticket.price * qty };
      });

      this.loading = false;
      this.syncState();
    });
  }

  increment(type: string): void {
    this.updateQty(type, 1);
  }

  decrement(type: string): void {
    this.updateQty(type, -1);
  }

  private updateQty(type: string, delta: number): void {
    this.selections = this.selections.map(sel => {
      if (sel.ticket.type === type) {
        const min = type === 'group' ? GROUP_MIN_QTY : 0;
        const max = type === 'group' ? 200 : 50;
        let qty = sel.qty + delta;
        // When incrementing from 0 for group, jump straight to minimum
        if (type === 'group' && sel.qty === 0 && delta > 0) qty = GROUP_MIN_QTY;
        qty = Math.max(delta < 0 && qty < min ? 0 : min, Math.min(max, qty));
        return { ...sel, qty, lineTotal: sel.ticket.price * qty };
      }
      return sel;
    });
    this.noTicketError = false;
    this.syncState();
  }

  applyPromo(): void {
    if (!this.promoCode.trim()) return;
    this.promoLoading = true;
    this.promoSuccess = '';
    this.promoError = '';

    this.offersService.validatePromoCode(this.promoCode.trim()).subscribe(offer => {
      this.promoLoading = false;
      if (offer) {
        this.promoSuccess = `${offer.title} applied!`;
        this.stateService.patchState({ appliedOffer: offer, promoCode: this.promoCode.trim() });
      } else {
        this.promoError = 'Invalid or expired promo code.';
        this.stateService.patchState({ appliedOffer: null, promoCode: '' });
      }
    });
  }

  removePromo(): void {
    this.promoCode = '';
    this.promoSuccess = '';
    this.promoError = '';
    this.stateService.patchState({ appliedOffer: null, promoCode: '' });
  }

  onNext(): void {
    const hasTicket = this.selections.some(s => s.qty > 0);
    if (!hasTicket) {
      this.noTicketError = true;
      return;
    }
    this.next.emit();
  }

  getSubtotal(): number {
    return this.stateService.snapshot.subtotal;
  }

  getDiscount(): number {
    return this.stateService.snapshot.discountAmount;
  }

  getTotal(): number {
    return this.stateService.snapshot.grandTotal;
  }

  get hasAppliedOffer(): boolean {
    return !!this.stateService.snapshot.appliedOffer;
  }

  getTodayDate(): string {
    return this.formatDate(new Date());
  }

  private syncState(): void {
    this.stateService.patchState({
      selectedDate: this.selectedDate,
      dayType: this.activeDayType,
      selections: this.selections
    });
  }

  private detectDayType(date: Date): DayType {
    const day = date.getDay();
    return day === 0 ? 'sunday' : 'weekday';
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
}

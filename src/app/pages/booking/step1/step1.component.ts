import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BookingService, Slot } from '../../../services/booking.service';
import { BookingStateService, DayType } from '../booking-state.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-bk-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss']
})
export class Step1Component implements OnInit {

  @Output() next = new EventEmitter<void>();

  loading      = false;
  slotsLoading = true;
  slotsError   = false;

  packagePrice = 0;
  selectedDate = '';
  activeDayType: DayType = 'weekday';

  slots: Slot[] = [];
  availableDates = new Set<string>();
  fullDates      = new Set<string>();
  bookedDates    = new Set<string>();
  dateError      = '';

  qty      = 1;
  qtyError = '';

  // Month navigation
  monthGroups: { key: string; label: string; slots: Slot[] }[] = [];
  activeMonthIndex = 0;

  constructor(
    private bookingService: BookingService,
    private stateService: BookingStateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const snap = this.stateService.snapshot;
    this.packagePrice = snap.packagePrice;
    if (snap.dayType) this.activeDayType = snap.dayType;

    this.loadSlots();
  }

  loadSlots(): void {
    this.slotsLoading = true;
    this.slotsError   = false;

    const phone = this.authService.getCurrentUser()?.phone ?? '';

    const slots$ = this.bookingService.getSlots();
    const booked$ = phone
      ? this.bookingService.getBookedDates(phone).pipe(catchError(() => of(new Set<string>())))
      : of(new Set<string>());

    forkJoin({ slots: slots$, booked: booked$ }).subscribe({
      next: ({ slots, booked }) => {
        this.bookedDates = booked;

        this.slots = slots.data.slots.map(s => ({
          ...s,
          slot_date: s.slot_date.slice(0, 10)
        }));

        this.availableDates = new Set(
          this.slots
            .filter(s => s.remaining > 0 && !this.bookedDates.has(s.slot_date))
            .map(s => s.slot_date)
        );
        this.fullDates = new Set(
          this.slots.filter(s => s.remaining === 0).map(s => s.slot_date)
        );

        const snap = this.stateService.snapshot;
        const sortedAvailable = [...this.availableDates].sort();
        if (snap.selectedDate && this.availableDates.has(snap.selectedDate)) {
          this.selectedDate = snap.selectedDate;
        } else {
          this.selectedDate = sortedAvailable[0] ?? '';
        }

        this.qty = 1;
        this.qtyError = '';

        this.buildMonthGroups();

        const selMonth = this.selectedDate.slice(0, 7);
        const idx = this.monthGroups.findIndex(g => g.key === selMonth);
        this.activeMonthIndex = idx >= 0 ? idx : 0;

        this.slotsLoading = false;
        this.syncState();
      },
      error: () => {
        this.slotsLoading = false;
        this.slotsError   = true;
      }
    });
  }

  isBooked(slot: Slot): boolean {
    return this.bookedDates.has(slot.slot_date);
  }

  isDisabled(slot: Slot): boolean {
    return slot.remaining === 0 || this.isBooked(slot);
  }

  private buildMonthGroups(): void {
    const map = new Map<string, Slot[]>();
    for (const slot of this.slots) {
      const key = slot.slot_date.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(slot);
    }
    this.monthGroups = Array.from(map.entries()).map(([key, slots]) => {
      const [y, m] = key.split('-');
      const label = new Date(+y, +m - 1, 1)
        .toLocaleString('default', { month: 'long', year: 'numeric' });
      return { key, label, slots };
    });
  }

  get activeMonthSlots(): Slot[] {
    return this.monthGroups[this.activeMonthIndex]?.slots ?? [];
  }

  get activeMonthLabel(): string {
    return this.monthGroups[this.activeMonthIndex]?.label ?? '';
  }

  get canGoPrev(): boolean { return this.activeMonthIndex > 0; }
  get canGoNext(): boolean { return this.activeMonthIndex < this.monthGroups.length - 1; }

  prevMonth(): void { if (this.canGoPrev) this.activeMonthIndex--; }
  nextMonth(): void { if (this.canGoNext) this.activeMonthIndex++; }

  selectDate(slot: Slot): void {
    if (this.isDisabled(slot)) return;
    this.dateError = '';
    this.selectedDate = slot.slot_date;
    if (this.qty > slot.remaining) {
      this.qty = slot.remaining;
    }
    this.qtyError = '';
    const parts = slot.slot_date.split('-');
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    this.activeDayType = d.getDay() === 0 ? 'sunday' : 'weekday';
    this.syncState();
  }

  get selectedSlot(): Slot | undefined {
    return this.slots.find(s => s.slot_date === this.selectedDate);
  }

  get maxQty(): number {
    return this.selectedSlot?.remaining ?? 1;
  }

  changeQty(delta: number): void {
    const next = this.qty + delta;
    if (next < 1) return;
    if (next > this.maxQty) {
      this.qtyError = `Only ${this.maxQty} spots available for this date.`;
      return;
    }
    this.qty = next;
    this.qtyError = '';
    this.syncState();
  }

  onQtyInput(val: string): void {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 1) { this.qty = 1; this.qtyError = ''; }
    else if (n > this.maxQty) {
      this.qty = this.maxQty;
      this.qtyError = `Only ${this.maxQty} spots available for this date.`;
    } else {
      this.qty = n;
      this.qtyError = '';
    }
    this.syncState();
  }

  readonly SUNDAY_SURCHARGE = 100;

  get isSunday(): boolean {
    return this.activeDayType === 'sunday';
  }

  // Effective price per person — base + Sunday surcharge if applicable
  get effectivePrice(): number {
    return this.packagePrice + (this.isSunday ? this.SUNDAY_SURCHARGE : 0);
  }

  get bulkDiscountApplied(): boolean {
    return this.qty >= 10;
  }

  get subtotalPrice(): number {
    return this.effectivePrice * this.qty;
  }

  get discountAmount(): number {
    return this.bulkDiscountApplied ? Math.round(this.subtotalPrice * 10 / 100) : 0;
  }

  get totalPrice(): number {
    return this.subtotalPrice - this.discountAmount;
  }

  onNext(): void {
    if (!this.selectedDate || !this.selectedSlot) {
      this.dateError = 'Please select a visit date.';
      return;
    }
    if (this.qty < 1 || this.qty > this.maxQty) return;
    this.syncState();
    this.next.emit();
  }

  private syncState(): void {
    const slot = this.selectedSlot;
    // Use a synthetic ticket object to satisfy the existing TicketSelection shape
    const syntheticTicket: any = {
      id: this.stateService.snapshot.packageId ?? 1,
      label: 'General Admission',
      price: this.effectivePrice
    };
    this.stateService.patchState({
      selectedDate: this.selectedDate,
      dayType:      this.activeDayType,
      slotId:       slot?.id ?? null,
      slotStart:    slot?.slot_start ?? '',
      slotEnd:      slot?.slot_end ?? '',
      bulkDiscount: this.bulkDiscountApplied,
      selections: [{
        ticket: syntheticTicket,
        qty: this.qty,
        lineTotal: this.subtotalPrice
      }]
    });
  }
}

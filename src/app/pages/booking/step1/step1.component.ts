import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TicketsService } from '../../../services/tickets.service';
import { BookingService, Slot } from '../../../services/booking.service';
import { BookingStateService, DayType } from '../booking-state.service';
import { AuthService } from '../../../services/auth.service';
import { Ticket } from '../../../models/ticket.model';

@Component({
  standalone: false,
  selector: 'app-bk-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss']
})
export class Step1Component implements OnInit {

  @Output() next = new EventEmitter<void>();

  loading      = true;   // overall page skeleton
  slotsLoading = true;   // date chips loading state
  slotsError   = false;  // date chips error state

  selectedTicket: Ticket | null = null;
  selectedDate = '';
  activeDayType: DayType = 'weekday';

  slots: Slot[] = [];
  availableDates  = new Set<string>();
  fullDates       = new Set<string>();
  bookedDates     = new Set<string>();   // dates user has already booked
  dateError       = '';

  // Month navigation
  monthGroups: { key: string; label: string; slots: Slot[] }[] = [];
  activeMonthIndex = 0;

  private ticketType = 'general';

  constructor(
    private route: ActivatedRoute,
    private ticketsService: TicketsService,
    private bookingService: BookingService,
    private stateService: BookingStateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.ticketType = params['type'] || 'general';

    if (params['dayType'] && ['weekday', 'sunday'].includes(params['dayType'])) {
      this.activeDayType = params['dayType'] as DayType;
    }

    const snap = this.stateService.snapshot;
    if (snap.dayType) this.activeDayType = snap.dayType;

    this.ticketsService.getByDayType(this.activeDayType).subscribe(tickets => {
      this.selectedTicket = tickets.find(t => t.type === this.ticketType) || tickets[0];
      this.loading = false;
    });

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
          this.slots.filter(s => s.remaining > 0 && !this.bookedDates.has(s.slot_date.slice(0, 10))).map(s => s.slot_date)
        );
        this.fullDates = new Set(
          this.slots.filter(s => s.remaining === 0).map(s => s.slot_date)
        );

        // Set initial selected date — skip already-booked ones
        const snap = this.stateService.snapshot;
        const sortedAvailable = [...this.availableDates].sort();
        if (snap.selectedDate && this.availableDates.has(snap.selectedDate)) {
          this.selectedDate = snap.selectedDate;
        } else {
          this.selectedDate = sortedAvailable[0] ?? '';
        }

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
      const key = slot.slot_date.slice(0, 7); // 'YYYY-MM'
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

  get canGoPrev(): boolean { return this.activeMonthIndex > 0; }
  get canGoNext(): boolean { return this.activeMonthIndex < this.monthGroups.length - 1; }

  prevMonth(): void { if (this.canGoPrev) this.activeMonthIndex--; }
  nextMonth(): void { if (this.canGoNext) this.activeMonthIndex++; }

  selectDate(slot: Slot): void {
    if (this.isDisabled(slot)) return;
    this.dateError    = '';
    this.selectedDate = slot.slot_date;
    const parts = slot.slot_date.split('-');
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    this.activeDayType = this.detectDayType(d);
    this.syncState();
  }

  get selectedSlot(): Slot | undefined {
    return this.slots.find(s => s.slot_date === this.selectedDate);
  }

  get totalPrice(): number {
    return this.selectedTicket?.price ?? 0;
  }

  onNext(): void {
    if (!this.selectedDate || !this.selectedSlot) {
      this.dateError = 'Please select a visit date.';
      return;
    }
    this.syncState();
    this.next.emit();
  }

  private syncState(): void {
    if (!this.selectedTicket) return;
    const slot = this.selectedSlot;
    const qty  = 1;
    this.stateService.patchState({
      selectedDate: this.selectedDate,
      dayType:      this.activeDayType,
      slotId:       slot?.id ?? null,
      selections:   [{ ticket: this.selectedTicket, qty, lineTotal: this.selectedTicket.price * qty }]
    });
  }

  private detectDayType(date: Date): DayType {
    return date.getDay() === 0 ? 'sunday' : 'weekday';
  }
}

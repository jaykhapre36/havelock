import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BookingService, Slot } from '../../services/booking.service';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { Ticket } from '../../models/ticket.model';

interface MonthGroup {
  key: string;
  label: string;
  slots: Slot[];
}

@Component({
  standalone: false,
  selector: 'app-group-booking',
  templateUrl: './group-booking.component.html',
  styleUrls: ['./group-booking.component.scss']
})
export class GroupBookingComponent implements OnInit {

  currentStep: 1 | 2 | 3 | 4 = 1;

  // Step 1 — Date & group size
  slots: Slot[] = [];
  slotsLoading = true;
  slotsError = false;

  bookedDates    = new Set<string>();
  fullDates      = new Set<string>();
  availableDates = new Set<string>();

  monthGroups: MonthGroup[] = [];
  activeMonthIndex = 0;

  selectedSlot: Slot | null = null;
  groupSize = 10;
  groupSizeError = '';

  baseTicket: Ticket | null = null;
  ticketsLoading = true;

  // Step 2 — Contact details
  form!: FormGroup;
  prefilled = false;

  // Step 3 — Review & confirm
  loading = false;
  error = '';
  bookingReference = '';

  readonly MIN_GROUP = 10;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private ticketsService: TicketsService,
    private authService: AuthService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    const hasFull = !!(user?.name && user?.email && user?.phone);

    this.prefilled = hasFull;

    this.form = this.fb.group({
      fullName: [
        { value: user?.name  ?? '', disabled: hasFull },
        [Validators.required, Validators.minLength(2), Validators.maxLength(60)]
      ],
      email: [
        { value: user?.email ?? '', disabled: hasFull },
        [Validators.required, Validators.email]
      ],
      phone: [
        { value: user?.phone ?? '', disabled: hasFull },
        [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]
      ]
    });

    this.loadSlots();
    this.loadBaseTicket();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  loadSlots(): void {
    this.slotsLoading = true;
    this.slotsError   = false;

    const phone = this.authService.getCurrentUser()?.phone ?? '';
    const slots$  = this.bookingService.getSlots();
    const booked$ = phone
      ? this.bookingService.getBookedDates(phone).pipe(catchError(() => of(new Set<string>())))
      : of(new Set<string>());

    forkJoin({ slots: slots$, booked: booked$ }).subscribe({
      next: ({ slots, booked }) => {
        this.bookedDates = booked;

        // Keep ALL slots so full ones render as disabled chips
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

        this.buildMonthGroups();

        // Auto-select first available slot (skip full/booked)
        const firstAvail = this.slots.find(s => this.availableDates.has(s.slot_date)) ?? null;
        this.selectedSlot = firstAvail;

        if (firstAvail) {
          const selMonth = firstAvail.slot_date.slice(0, 7);
          const idx = this.monthGroups.findIndex(g => g.key === selMonth);
          this.activeMonthIndex = idx >= 0 ? idx : 0;
        }

        this.slotsLoading = false;
      },
      error: () => {
        this.slotsLoading = false;
        this.slotsError = true;
      }
    });
  }

  isBooked(slot: Slot): boolean {
    return this.bookedDates.has(slot.slot_date);
  }

  isDisabled(slot: Slot): boolean {
    return slot.remaining === 0 || this.isBooked(slot);
  }

  loadBaseTicket(): void {
    this.ticketsLoading = true;
    this.ticketsService.getByDayType('weekday').subscribe(tickets => {
      this.baseTicket = tickets.find(t => t.type === 'general') || tickets[0] || null;
      this.ticketsLoading = false;
    });
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

  // ── Month navigation ──────────────────────────────────────────────────────

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

  // ── Step 1 actions ────────────────────────────────────────────────────────

  get maxGroupSize(): number {
    return this.selectedSlot?.remaining ?? this.MIN_GROUP;
  }

  selectSlot(slot: Slot): void {
    if (this.isDisabled(slot)) return;
    this.selectedSlot = slot;
    // Clamp group size to slot's remaining capacity
    if (this.groupSize > slot.remaining) {
      this.groupSize = slot.remaining;
    }
    this.validateGroupSize();
  }

  onGroupSizeChange(val: string): void {
    const n = parseInt(val, 10);
    this.groupSize = isNaN(n) ? this.MIN_GROUP : n;
    this.validateGroupSize();
  }

  private validateGroupSize(): void {
    if (this.groupSize < this.MIN_GROUP) {
      this.groupSizeError = `Minimum group size is ${this.MIN_GROUP} persons.`;
    } else if (this.selectedSlot && this.groupSize > this.selectedSlot.remaining) {
      this.groupSize = this.selectedSlot.remaining;
      this.groupSizeError = `Only ${this.selectedSlot.remaining} spots available for this date.`;
    } else {
      this.groupSizeError = '';
    }
  }

  onStep1Next(): void {
    if (!this.selectedSlot) return;
    this.validateGroupSize();
    if (this.groupSizeError) return;
    this.currentStep = 2;
  }

  // ── Step 2 actions ────────────────────────────────────────────────────────

  f(field: string) { return this.form.get(field); }

  isInvalid(field: string): boolean {
    const ctrl = this.f(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onStep2Next(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.currentStep = 3;
  }

  get formValue() { return this.form.getRawValue(); }

  // ── Step 3 — Confirm ─────────────────────────────────────────────────────

  onConfirm(): void {
    if (!this.selectedSlot || !this.baseTicket) return;

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/group-booking' } });
      return;
    }

    this.loading = true;
    this.error = '';

    const fv = this.form.getRawValue();

    this.paymentService.openCheckout(
      this.grandTotal,
      { name: fv.fullName, email: fv.email, contact: fv.phone },
      'Havelock Water Park — Group Booking'
    ).then((payment) => {
      this.bookingService.bookOnline({
        ticket_type_id: 1,
        slot_id: this.selectedSlot!.id,
        phone: fv.phone,
        count: this.groupSize,
        is_group: true,
        amount: this.grandTotal,
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

  // ── Pricing helpers ───────────────────────────────────────────────────────

  get pricePerPerson(): number {
    return this.baseTicket?.price ?? 0;
  }

  get discountPercent(): number {
    return 10;
  }

  get subtotal(): number {
    return this.pricePerPerson * this.groupSize;
  }

  get discountAmount(): number {
    return Math.round(this.subtotal * this.discountPercent / 100);
  }

  get grandTotal(): number {
    return this.subtotal - this.discountAmount;
  }

  // ── Navigation helpers ────────────────────────────────────────────────────

  goHome(): void {
    this.router.navigate(['/']);
  }

  newBooking(): void {
    this.currentStep = 1;
    this.selectedSlot = null;
    this.groupSize = 10;
    this.groupSizeError = '';
    this.error = '';
    this.bookingReference = '';
    const user = this.authService.getCurrentUser();
    this.form.reset({
      fullName: user?.name  ?? '',
      email:    user?.email ?? '',
      phone:    user?.phone ?? ''
    });
  }
}

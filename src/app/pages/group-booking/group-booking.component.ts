import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import { BookingService, Slot } from '../../services/booking.service';
import { PackageService } from '../../services/package.service';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { BookingSuccessData } from '../booking-success/booking-success.component';

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
export class GroupBookingComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
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

  packagePrice = 0;
  packageTicketTypeId = 1;
  packageLoading = true;

  // Step 2 — Contact details
  form!: FormGroup;
  prefilled = false;

  // Step 3 — Review & confirm
  loading = false;
  error = '';
  bookingReference = '';
  paymentFailed = false;
  paymentFailedMsg = '';
  agreedToTerms = false;

  readonly MIN_GROUP = 10;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private packageService: PackageService,
    private authService: AuthService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Real-time session guard: if user logs out or token expires mid-booking, redirect immediately
    this.authService.currentUser$
      .pipe(
        filter(user => user === null),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: '/packages' }
        });
      });

    const user = this.authService.getCurrentUser();

    // Fields are always read-only — auth guard ensures only logged-in users reach this page
    this.prefilled = true;

    this.form = this.fb.group({
      fullName: [
        { value: user?.name  ?? '', disabled: true },
        [Validators.required, Validators.minLength(2), Validators.maxLength(60)]
      ],
      email: [
        { value: user?.email ?? '', disabled: true },
        [Validators.required, Validators.email]
      ],
      phone: [
        { value: user?.phone ?? '', disabled: true },
        [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]
      ]
    });

    this.loadSlots();
    this.loadPackagePrice();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  loadPackagePrice(): void {
    this.packageLoading = true;
    const packageId = parseInt(this.route.snapshot.queryParams['packageId'], 10);
    this.packageService.getPackages().subscribe({
      next: (res) => {
        const pkg = packageId
          ? res.data.find(p => p.id === packageId)
          : res.data[0];
        this.packagePrice = pkg ? parseFloat(pkg.price) : 0;
        this.packageTicketTypeId = pkg ? pkg.id : 1;
        this.packageLoading = false;
        history.replaceState({ bookingStep: 1 }, '');
      },
      error: () => { this.packageLoading = false; }
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

  @HostListener('window:popstate')
  onPopState(): void {
    if (this.currentStep > 1) {
      this.currentStep = (this.currentStep - 1) as 1 | 2 | 3 | 4;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.pushState({ bookingStep: this.currentStep }, '');
    }
  }

  private advanceStep(step: 1 | 2 | 3 | 4): void {
    history.pushState({ bookingStep: step }, '');
    this.currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onStep1Next(): void {
    if (!this.selectedSlot) return;
    this.validateGroupSize();
    if (this.groupSizeError) return;
    this.advanceStep(2);
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
    this.onConfirm();
  }

  get formValue() { return this.form.getRawValue(); }

  // ── Step 3 — Confirm ─────────────────────────────────────────────────────

  retryPayment(): void {
    this.paymentFailed = false;
    this.paymentFailedMsg = '';
    this.error = '';
  }

  onConfirm(): void {
    if (!this.selectedSlot || !this.packagePrice) return;

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/packages' } });
      return;
    }

    this.loading = true;
    this.error = '';
    this.paymentFailed = false;
    this.paymentFailedMsg = '';

    const fv = this.form.getRawValue();
    const slotDate = this.selectedSlot!.slot_date.slice(0, 10);

    // Check for duplicate booking on same slot before opening payment
    this.bookingService.getMyBookings(fv.phone).subscribe({
      next: (res) => {
        const alreadyBooked = (res?.data?.active_bookings ?? []).some(
          b => b.slot_date.slice(0, 10) === slotDate
        );
        if (alreadyBooked) {
          this.loading = false;
          this.error = 'You have already booked this slot. Only one booking is allowed per slot.';
          return;
        }
        this.proceedToPayment(fv);
      },
      error: () => {
        // If check fails, proceed anyway — server will reject duplicate
        this.proceedToPayment(fv);
      }
    });
  }

  private proceedToPayment(fv: any): void {
    this.paymentService.openCheckout(
      this.grandTotal,
      { name: fv.fullName, email: fv.email, contact: fv.phone },
      'Havelock Water Park — Group Booking'
    ).then((payment) => {
      this.bookingService.bookOnline({
        ticket_type_id: this.packageTicketTypeId,
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
            const ref = res.data?.booking_reference
              || (res.data?.booking_id ? `HVL-${String(res.data.booking_id).padStart(4, '0')}` : '');
            const successData: BookingSuccessData = {
              bookingReference: ref,
              paymentId: payment.razorpay_payment_id,
              visitDate: this.selectedSlot!.slot_date,
              slotStart: this.selectedSlot!.slot_start,
              slotEnd: this.selectedSlot!.slot_end,
              ticketLabel: 'General Admission',
              persons: this.groupSize,
              totalAmount: this.grandTotal,
              isGroup: true,
              customerName: fv.fullName,
              customerEmail: fv.email
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

  // ── Pricing helpers ───────────────────────────────────────────────────────

  get pricePerPerson(): number {
    return this.packagePrice;
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

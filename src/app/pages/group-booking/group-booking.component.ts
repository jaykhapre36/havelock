import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService, Slot } from '../../services/booking.service';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service';
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

  monthGroups: MonthGroup[] = [];
  activeMonthIndex = 0;

  selectedSlot: Slot | null = null;
  groupSize = 10;
  groupSizeError = '';

  baseTicket: Ticket | null = null;
  ticketsLoading = true;

  // Step 2 — Contact details
  form!: FormGroup;

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName:    ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      email:       ['', [Validators.required, Validators.email]],
      phone:       ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      orgName:     ['', [Validators.maxLength(80)]],
      specialNote: ['', [Validators.maxLength(300)]]
    });

    // Pre-fill phone from logged-in user if available
    const user = this.authService.getCurrentUser();
    if (user?.phone) {
      this.form.patchValue({ phone: user.phone });
    }

    this.loadSlots();
    this.loadBaseTicket();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  loadSlots(): void {
    this.slotsLoading = true;
    this.slotsError = false;
    this.bookingService.getSlots().subscribe({
      next: (res) => {
        this.slots = res.data.slots
          .filter(s => s.remaining > 0)
          .map(s => ({ ...s, slot_date: s.slot_date.slice(0, 10) }));

        this.buildMonthGroups();

        // Auto-select first available
        if (this.slots.length > 0 && !this.selectedSlot) {
          this.selectedSlot = this.slots[0];
          const selMonth = this.selectedSlot.slot_date.slice(0, 7);
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

  get canGoPrev(): boolean { return this.activeMonthIndex > 0; }
  get canGoNext(): boolean { return this.activeMonthIndex < this.monthGroups.length - 1; }

  prevMonth(): void { if (this.canGoPrev) this.activeMonthIndex--; }
  nextMonth(): void { if (this.canGoNext) this.activeMonthIndex++; }

  // ── Step 1 actions ────────────────────────────────────────────────────────

  selectSlot(slot: Slot): void {
    this.selectedSlot = slot;
  }

  onGroupSizeChange(val: string): void {
    const n = parseInt(val, 10);
    this.groupSize = isNaN(n) ? this.MIN_GROUP : n;
    this.groupSizeError = this.groupSize < this.MIN_GROUP
      ? `Minimum group size is ${this.MIN_GROUP} persons.`
      : '';
  }

  onStep1Next(): void {
    if (!this.selectedSlot) return;
    if (this.groupSize < this.MIN_GROUP) {
      this.groupSizeError = `Minimum group size is ${this.MIN_GROUP} persons.`;
      return;
    }
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

  // ── Step 3 — Confirm ─────────────────────────────────────────────────────

  onConfirm(): void {
    if (!this.selectedSlot || !this.baseTicket) return;
    this.loading = true;
    this.error = '';

    this.bookingService.bookOnline({
      ticket_type_id: 1,
      slot_id: this.selectedSlot.id,
      phone: this.form.value.phone,
      count: this.groupSize
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.bookingReference = res.data?.booking_reference
            || (res.data?.booking_id ? `HVL-G${res.data.booking_id}` : 'HVL-G' + Math.random().toString(36).slice(2, 8).toUpperCase());
          this.currentStep = 4;
        } else {
          this.error = res.message || 'Booking failed. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Booking failed. Please try again.';
      }
    });
  }

  // ── Pricing helpers ───────────────────────────────────────────────────────

  get pricePerPerson(): number {
    return this.baseTicket?.price ?? 0;
  }

  get discountPercent(): number {
    if (this.groupSize >= 50) return 10;
    if (this.groupSize >= 20) return 5;
    return 0;
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
    this.form.reset();
    const user = this.authService.getCurrentUser();
    if (user?.phone) this.form.patchValue({ phone: user.phone });
  }
}

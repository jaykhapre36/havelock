import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService, MyBooking } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

type TabKey = 'active' | 'past';

@Component({
  standalone: false,
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {

  activeTab: TabKey = 'active';

  loading = true;
  error   = '';

  activeBookings: MyBooking[] = [];
  pastBookings:   MyBooking[] = [];

  customerName = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.phone) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/my-bookings' } });
      return;
    }
    this.customerName = user.name ?? '';
    this.load(user.phone);
  }

  load(phone: string): void {
    this.loading = true;
    this.error   = '';
    this.bookingService.getMyBookings(phone).subscribe({
      next: (res) => {
        this.loading        = false;
        this.activeBookings = res.data?.active_bookings ?? [];
        this.pastBookings   = res.data?.past_bookings   ?? [];
      },
      error: () => {
        this.loading = false;
        this.error   = 'Could not load your bookings. Please try again.';
      }
    });
  }

  get currentList(): MyBooking[] {
    return this.activeTab === 'active' ? this.activeBookings : this.pastBookings;
  }

  setTab(tab: TabKey): void {
    this.activeTab = tab;
  }

  bookNow(): void {
    this.router.navigate(['/packages']);
  }

  retry(): void {
    const phone = this.authService.getCurrentUser()?.phone ?? '';
    if (phone) this.load(phone);
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatTime(t: string): string {
    return t.slice(0, 5);
  }

  formatAmount(amount: string): string {
    return Number(amount).toLocaleString('en-IN');
  }

  bookingId(b: MyBooking): string {
    return `HVL-${b.id.toString().padStart(4, '0')}`;
  }
}

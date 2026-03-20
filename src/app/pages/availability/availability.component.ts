import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AvailabilityService } from '../../services/availability.service';
import { AvailabilityData, AvailabilitySlot } from '../../models/availability.model';

@Component({
  standalone: false,
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnInit {

  selectedDate = this.getTodayDate();
  loading = false;
  error = '';
  result: AvailabilityData | null = null;
  checked = false;
  availableDates: Set<string> = new Set();
  minDate = '';
  maxDate = '';

  constructor(
    private availabilityService: AvailabilityService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.availabilityService.getSlots().subscribe(res => {
      const available = res.data.slots.filter(s => s.remaining > 0);
      this.availableDates = new Set(available.map(s => s.slot_date));
      if (available.length) {
        this.minDate = available[0].slot_date;
        this.maxDate = available[available.length - 1].slot_date;
      }

      const dateParam = this.route.snapshot.queryParamMap.get('date');
      if (dateParam) {
        this.selectedDate = dateParam;
        this.checkAvailability();
      } else if (available.length && !this.availableDates.has(this.selectedDate)) {
        this.selectedDate = available[0].slot_date;
      }
    });
  }

  checkAvailability(): void {
    if (!this.selectedDate) return;
    this.loading = true;
    this.error = '';
    this.result = null;
    this.checked = false;

    this.availabilityService.checkAvailability(this.selectedDate).subscribe({
      next: (res) => {
        this.result = res.data;
        this.checked = true;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to check availability. Please try again.';
        this.loading = false;
      }
    });
  }

  getOccupancyPct(slot: AvailabilitySlot): number {
    if (slot.total_capacity === 0) return 0;
    return Math.round((slot.booked_count / slot.total_capacity) * 100);
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }

  bookTickets(): void {
    this.router.navigate(['/packages']);
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AvailabilityService } from '../../services/availability.service';
import { AvailabilityResponse, TimeSlot } from '../../models/availability.model';

@Component({
  standalone: false,
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnInit {

  data: AvailabilityResponse | null = null;
  loading = true;

  selectedDate  = this.getTodayDate();
  selectedSlot: TimeSlot | null = null;
  adults   = 2;
  children = 1;

  constructor(
    private availabilityService: AvailabilityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.availabilityService.getAvailability().subscribe(res => {
      this.data = res;
      this.loading = false;
    });
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.status === 'full') return;
    this.selectedSlot = slot;
  }

  increment(type: 'adults' | 'children'): void {
    if (type === 'adults'   && this.adults   < 10) this.adults++;
    if (type === 'children' && this.children < 10) this.children++;
  }

  decrement(type: 'adults' | 'children'): void {
    if (type === 'adults'   && this.adults   > 1) this.adults--;
    if (type === 'children' && this.children > 0) this.children--;
  }

  get totalGuests(): number { return this.adults + this.children; }

  getOccupancyPct(): number {
    if (!this.data) return 0;
    return Math.round((this.data.parkInfo.currentOccupancy / this.data.parkInfo.maxCapacity) * 100);
  }

  getSlotPct(slot: TimeSlot): number {
    return Math.round(((slot.totalSeats - slot.availableSeats) / slot.totalSeats) * 100);
  }

  proceedToTickets(): void {
    if (!this.selectedSlot) return;
    this.router.navigate(['/tickets']);
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getMinDate(): string { return this.getTodayDate(); }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Slot {
  id: number;
  slot_date: string;       // 'YYYY-MM-DD'
  slot_start: string;
  slot_end: string;
  total_capacity: number;
  booked_count: number;
  remaining: number;
}

export interface BookOnlineRequest {
  ticket_type_id: number;
  slot_id: number;
  phone: string;
  count: number;
}

export interface BookOnlineResponse {
  success: boolean;
  message: string;
  data?: {
    booking_id?: number;
    booking_reference?: string;
  };
}

export interface MyBooking {
  id: number;
  slot_id: number;
  slot_date: string;
  slot_start: string;
  slot_end: string;
  count: number;
  total_amount: string;
  payment_status: string;
  booking_status: string;
  is_group: boolean;
  package_name: string;
}

export interface MyBookingsResponse {
  success: boolean;
  message: string;
  data: {
    customer: { id: number; name: string; phone: string; email: string };
    active_bookings: MyBooking[];
    past_bookings: MyBooking[];
  };
}

@Injectable({ providedIn: 'root' })
export class BookingService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSlots(): Observable<{ success: boolean; data: { total: number; slots: Slot[] } }> {
    return this.http.post<any>(`${this.apiUrl}/bookings/get-slots`, {});
  }

  bookOnline(payload: BookOnlineRequest): Observable<BookOnlineResponse> {
    return this.http.post<BookOnlineResponse>(`${this.apiUrl}/bookings/book-online`, payload);
  }

  getMyBookings(phone: string): Observable<MyBookingsResponse> {
    return this.http.post<MyBookingsResponse>(`${this.apiUrl}/bookings/by-phone`, { phone });
  }

  /** Returns a Set of 'YYYY-MM-DD' dates the user has already booked (active only). */
  getBookedDates(phone: string): Observable<Set<string>> {
    return this.getMyBookings(phone).pipe(
      map(res => new Set(
        (res?.data?.active_bookings ?? []).map(b => b.slot_date.slice(0, 10))
      )),
      catchError(() => of(new Set<string>()))
    );
  }
}

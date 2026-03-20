import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AvailabilityApiResponse, SlotsApiResponse } from '../models/availability.model';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSlots(): Observable<SlotsApiResponse> {
    return this.http.post<SlotsApiResponse>(`${this.apiUrl}/bookings/get-slots`, {});
  }

  checkAvailability(date: string): Observable<AvailabilityApiResponse> {
    return this.http.post<AvailabilityApiResponse>(
      `${this.apiUrl}/bookings/check-tickets-availability`,
      { date }
    );
  }
}

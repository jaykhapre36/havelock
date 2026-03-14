import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AvailabilityResponse } from '../models/availability.model';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  private mockPath = environment.mockDataPath;

  constructor(private http: HttpClient) {}

  getAvailability(): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(`${this.mockPath}/availability.json`);
  }
}

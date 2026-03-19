import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TicketPackage {
  id: number;
  package_name: string;
  category_name: string;
  description: string;
  price: string;
  created_at: string;
}

interface PackagesResponse {
  success: boolean;
  message: string;
  data: TicketPackage[];
}

@Injectable({
  providedIn: 'root'
})
export class PackageService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPackages(): Observable<PackagesResponse> {
    return this.http.get<PackagesResponse>(`${this.apiUrl}/bookings/ticket-types`);
  }
}

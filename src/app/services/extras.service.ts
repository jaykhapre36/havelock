import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  booking_id: number;
  reference_type_id: number;
  transaction_type: string;
  amount: string;
  balance_after: string;
  created_at: string;
  reference_type_name: string;
  reference_type_description: string;
}

export interface WalletData {
  wallet: { id: number; booking_id: number; balance: string; created_at: string } | null;
  transactions: WalletTransaction[];
}

export interface Allocation {
  id: number;
  type?: string;
  size?: string;
  locker_number?: string;
  status: string;
  created_at: string;
}

export interface AllocationsData {
  total: number;
  allocations: Allocation[];
}

@Injectable({ providedIn: 'root' })
export class ExtrasService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getWallet(): Observable<{ success: boolean; message: string; data: WalletData }> {
    return this.http.get<any>(`${this.apiUrl}/bookings/my-wallet`);
  }

  getCostumes(): Observable<{ success: boolean; message: string; data: AllocationsData }> {
    return this.http.get<any>(`${this.apiUrl}/bookings/my-costumes`);
  }

  getLockers(): Observable<{ success: boolean; message: string; data: AllocationsData }> {
    return this.http.get<any>(`${this.apiUrl}/bookings/my-lockers`);
  }
}

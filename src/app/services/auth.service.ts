import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private storage: StorageService) {
    // Initialize from encrypted storage
    this.currentUserSubject.next(this.storage.get<User>('user'));
  }

  // ── Check if customer exists ────────────────────────────────────────────────
  checkCustomer(phone: string): Observable<{ success: boolean; message: string; data: { exists: boolean } }> {
    return this.http.post<any>(`${this.apiUrl}/auth/check-customer`, { phone });
  }

  // ── Send OTP ────────────────────────────────────────────────────────────────
  sendOtp(phone: string, otpType: 'login' | 'registration' | 'verification' | 'password_reset' = 'login'): Observable<{ success: boolean; message: string; data: { otp_id: number; phone: string } }> {
    return this.http.post<any>(`${this.apiUrl}/auth/send-otp`, { phone, otp_type: otpType });
  }

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  verifyOtp(otpId: number, otpCode: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<any>(`${this.apiUrl}/auth/verify-otp`, { id: otpId, otp_code: otpCode });
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  login(phone: string): Observable<{ success: boolean; message: string; data: { customer: User; token: string } }> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { phone }).pipe(
      tap(res => {
        if (res.success) {
          this.storage.set('token', res.data.token);
          this.storage.set('user', res.data.customer);
          this.currentUserSubject.next(res.data.customer);
        }
      })
    );
  }

  // ── Register ─────────────────────────────────────────────────────────────────
  register(data: {
    name: string; phone: string; email: string;
    age: number; gender: boolean; otp: string;
  }): Observable<{ success: boolean; message: string; data: { customer: User } }> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data);
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  clearSession(): void {
    this.storage.remove('token');
    this.storage.remove('user');
    this.currentUserSubject.next(null);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  isLoggedIn(): boolean {
    const token = this.storage.get<string>('token');
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  getToken(): string | null {
    return this.storage.get<string>('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}

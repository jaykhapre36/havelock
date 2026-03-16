import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ── Send OTP ────────────────────────────────────────────────────────────────
  sendOtp(phone: string, otpType: 'login' | 'register' = 'login'): Observable<{ success: boolean; message: string; data: { otp_id: number; phone: string } }> {
    return this.http.post<any>(`${this.apiUrl}/auth/send-otp`, {
      phone,
      otp_type: otpType
    });
  }

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  verifyOtp(otpId: number, otpCode: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<any>(`${this.apiUrl}/auth/verify-otp`, { id: otpId, otp_code: otpCode });
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  login(phone: string): Observable<{ success: boolean; token: string; user: User }> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { phone }).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  // ── Register ─────────────────────────────────────────────────────────────────
  register(data: {
    name: string;
    phone: string;
    email: string;
    age: number;
    gender: boolean;
    otp: string;
  }): Observable<{ success: boolean; token: string; user: User }> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  // ── Check login (also validates token expiry) ────────────────────────────────
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
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
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getUserFromStorage(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }
}

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  @ViewChild('otpInput') otpInput!: ElementRef<HTMLInputElement>;

  stage: 'phone' | 'otp' = 'phone';

  // Stage 1
  phone = '';
  phoneError = '';

  // Stage 2
  otpDigits: string[] = ['', '', '', ''];
  otpId = 0;

  loading = false;
  error   = '';
  successMessage = '';
  sessionExpiredMsg = '';
  resendCountdown = 0;

  private countdownRef?: ReturnType<typeof setInterval>;
  private returnUrl = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
    const params = this.route.snapshot.queryParams;
    this.returnUrl = params['returnUrl'] || '/';
    if (params['reason'] === 'session_expired') {
      this.sessionExpiredMsg = 'Your session has expired. Please log in again to continue.';
    }
  }

  ngOnDestroy(): void {
    if (this.countdownRef) clearInterval(this.countdownRef);
  }

  get phoneValue(): string { return this.phone.replace(/\D/g, ''); }
  get otpValue(): string   { return this.otpDigits.join(''); }

  focusOtp(): void {
    this.otpInput?.nativeElement.focus();
  }

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  onSendOtp(): void {
    this.phoneError = '';
    this.error = '';
    if (!/^[6-9]\d{9}$/.test(this.phoneValue)) {
      this.phoneError = 'Enter a valid 10-digit WhatsApp number.';
      return;
    }
    this.loading = true;
    this.authService.sendOtp(this.phoneValue, 'login').subscribe({
      next: (res) => {
        this.loading = false;
        this.otpId = res.data.otp_id;
        this.stage = 'otp';
        this.startCountdown();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to send OTP. Please try again.';
      }
    });
  }

  // ── Step 2: Verify OTP → Login ──────────────────────────────────────────────
  onVerify(): void {
    this.error = '';
    if (this.otpValue.length < 4) {
      this.error = 'Please enter the complete 4-digit OTP.';
      return;
    }
    this.loading = true;
    const phone = this.phoneValue;
    const otp   = this.otpValue;

    this.authService.verifyOtp(this.otpId, otp).subscribe({
      next: () => {
        this.authService.login(phone).subscribe({
          next: (res) => {
            this.loading = false;
            this.successMessage = res.message || 'Login successful!';
            setTimeout(() => this.router.navigateByUrl(this.returnUrl), 1000);
          },
          error: (err) => {
            this.loading = false;
            this.error = err?.error?.message || 'Login failed. Please try again.';
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Invalid OTP. Please try again.';
      }
    });
  }

  // ── Single hidden input handler ──────────────────────────────────────────────
  onOtpChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4);
    (event.target as HTMLInputElement).value = val;
    for (let i = 0; i < 4; i++) {
      this.otpDigits[i] = val[i] || '';
    }
  }

  // ── Resend ──────────────────────────────────────────────────────────────────
  resendOtp(): void {
    if (this.resendCountdown > 0) return;
    this.loading = true;
    this.error = '';
    this.authService.sendOtp(this.phoneValue, 'login').subscribe({
      next: (res) => {
        this.loading = false;
        this.otpId = res.data.otp_id;
        this.otpDigits = ['', '', '', ''];
        if (this.otpInput) this.otpInput.nativeElement.value = '';
        this.startCountdown();
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to resend OTP. Please try again.';
      }
    });
  }

  goBack(): void {
    this.stage = 'phone';
    this.otpDigits = ['', '', '', ''];
    this.error = '';
    if (this.countdownRef) clearInterval(this.countdownRef);
    this.resendCountdown = 0;
  }

  private startCountdown(): void {
    if (this.countdownRef) clearInterval(this.countdownRef);
    this.resendCountdown = 30;
    this.countdownRef = setInterval(() => {
      if (--this.resendCountdown <= 0) clearInterval(this.countdownRef);
    }, 1000);
  }
}

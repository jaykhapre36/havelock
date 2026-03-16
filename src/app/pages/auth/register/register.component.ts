import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  @ViewChild('otpInput') otpInput!: ElementRef<HTMLInputElement>;

  stage: 'details' | 'otp' = 'details';

  // Stage 1 — details
  name   = '';
  phone  = '';
  email  = '';
  age: number | null = null;
  gender: boolean | null = null;

  // Validation errors
  nameError   = '';
  phoneError  = '';
  ageError    = '';
  genderError = '';

  // Stage 2 — OTP
  otpDigits: string[] = ['', '', '', ''];
  otpId = 0;

  loading = false;
  error   = '';
  resendCountdown = 0;

  private countdownRef?: ReturnType<typeof setInterval>;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
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

  // ── Step 1: validate then send OTP ─────────────────────────────────────────
  onSendOtp(): void {
    this.error = '';
    if (!this.validateDetails()) return;

    this.loading = true;
    this.authService.sendOtp(this.phoneValue, 'registration').subscribe({
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

  // ── Step 2: Verify OTP → Register ───────────────────────────────────────────
  onCreateAccount(): void {
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
        this.authService.register({
          name:   this.name.trim(),
          phone,
          email:  this.email.trim(),
          age:    this.age!,
          gender: this.gender!,
          otp
        }).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.loading = false;
            this.error = err?.error?.message || 'Registration failed. Please try again.';
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
    this.authService.sendOtp(this.phoneValue, 'registration').subscribe({
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
    this.stage = 'details';
    this.otpDigits = ['', '', '', ''];
    this.error = '';
    if (this.countdownRef) clearInterval(this.countdownRef);
    this.resendCountdown = 0;
  }

  private validateDetails(): boolean {
    this.nameError = this.phoneError = this.ageError = this.genderError = '';
    let valid = true;

    if (!this.name.trim() || this.name.trim().length < 2) {
      this.nameError = 'Name must be at least 2 characters.';
      valid = false;
    }
    if (!/^[6-9]\d{9}$/.test(this.phoneValue)) {
      this.phoneError = 'Enter a valid 10-digit WhatsApp number.';
      valid = false;
    }
    if (!this.age || this.age < 1 || this.age > 120) {
      this.ageError = 'Enter a valid age (1–120).';
      valid = false;
    }
    if (this.gender === null) {
      this.genderError = 'Please select a gender.';
      valid = false;
    }
    return valid;
  }

  private startCountdown(): void {
    if (this.countdownRef) clearInterval(this.countdownRef);
    this.resendCountdown = 30;
    this.countdownRef = setInterval(() => {
      if (--this.resendCountdown <= 0) clearInterval(this.countdownRef);
    }, 1000);
  }
}

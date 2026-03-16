import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  stage: 'details' | 'otp' = 'details';

  // Stage 1 — details
  name   = '';
  phone  = '';
  email  = '';
  age: number | null = null;
  gender = '';

  // Validation errors
  nameError   = '';
  phoneError  = '';
  ageError    = '';
  genderError = '';

  // Stage 2 — OTP
  otpDigits = ['', '', '', '', '', ''];

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

  // ── Step 1: validate then send OTP ─────────────────────────────────────────
  onSendOtp(): void {
    this.error = '';
    if (!this.validateDetails()) return;

    this.loading = true;
    this.authService.sendOtp(this.phoneValue, 'login').subscribe({
      next: () => {
        this.loading = false;
        this.stage = 'otp';
        this.startCountdown();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to send OTP. Please try again.';
      }
    });
  }

  // ── Step 2: verify OTP → register ──────────────────────────────────────────
  onCreateAccount(): void {
    this.error = '';
    if (this.otpValue.length < 6) {
      this.error = 'Please enter the complete 6-digit OTP.';
      return;
    }
    this.loading = true;
    const phone = this.phoneValue;
    const otp   = this.otpValue;

    this.authService.verifyOtp(phone, otp).subscribe({
      next: () => {
        this.authService.register({
          name:   this.name.trim(),
          phone,
          email:  this.email.trim(),
          age:    this.age!,
          gender: this.gender,
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

  // ── OTP box interactions ────────────────────────────────────────────────────
  onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    this.otpDigits[index] = val;
    input.value = val;
    if (val && index < 5) {
      this.otpBoxes.toArray()[index + 1].nativeElement.focus();
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      this.otpDigits[index - 1] = '';
      this.otpBoxes.toArray()[index - 1].nativeElement.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    pasted.split('').forEach((c, i) => this.otpDigits[i] = c);
    const focusIdx = Math.min(pasted.length, 5);
    setTimeout(() => this.otpBoxes.toArray()[focusIdx]?.nativeElement.focus());
  }

  // ── Resend ──────────────────────────────────────────────────────────────────
  resendOtp(): void {
    if (this.resendCountdown > 0) return;
    this.loading = true;
    this.error = '';
    this.authService.sendOtp(this.phoneValue, 'login').subscribe({
      next: () => {
        this.loading = false;
        this.otpDigits = ['', '', '', '', '', ''];
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
    this.otpDigits = ['', '', '', '', '', ''];
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
    if (!this.gender) {
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

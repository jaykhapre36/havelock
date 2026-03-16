import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  stage: 'phone' | 'otp' = 'phone';

  // Stage 1
  phone = '';
  phoneError = '';

  // Stage 2
  otpDigits = ['', '', '', '', '', ''];

  loading = false;
  error = '';
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
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnDestroy(): void {
    if (this.countdownRef) clearInterval(this.countdownRef);
  }

  get phoneValue(): string { return this.phone.replace(/\D/g, ''); }
  get otpValue(): string   { return this.otpDigits.join(''); }

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

  // ── Step 2: Verify OTP → Login ──────────────────────────────────────────────
  onVerify(): void {
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
        this.authService.login(phone, otp).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigateByUrl(this.returnUrl);
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
    this.stage = 'phone';
    this.otpDigits = ['', '', '', '', '', ''];
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

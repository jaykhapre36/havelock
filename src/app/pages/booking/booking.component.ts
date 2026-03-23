import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { BookingStateService } from './booking-state.service';
import { AuthService } from '../../services/auth.service';
import { PackageService } from '../../services/package.service';

@Component({
  standalone: false,
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  currentStep: 1 | 2 | 3 | 4 = 1;
  packageLoading = true;

  steps = [
    { n: 1, label: 'Tickets' },
    { n: 2, label: 'Details & Pay' },
  ];

  constructor(
    private stateService: BookingStateService,
    private authService: AuthService,
    private packageService: PackageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Real-time session guard
    this.authService.currentUser$
      .pipe(filter(user => user === null), takeUntil(this.destroy$))
      .subscribe(() => {
        this.stateService.reset();
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/packages' } });
      });

    // Only packageId in URL — price always fetched from server (never trusted from client)
    const packageId = parseInt(this.route.snapshot.queryParams['packageId'], 10);
    if (!packageId) {
      this.router.navigate(['/packages']);
      return;
    }

    this.packageService.getPackages().subscribe({
      next: res => {
        const pkg = res.data.find(p => p.id === packageId);
        if (!pkg) { this.router.navigate(['/packages']); return; }
        this.stateService.patchState({ packageId: pkg.id, packagePrice: parseFloat(pkg.price) });
        this.packageLoading = false;
        // Push an initial history entry so back from step 1 goes to /packages
        history.replaceState({ bookingStep: 1 }, '');
      },
      error: () => this.router.navigate(['/packages'])
    });
  }

  // Intercept browser/mobile back button
  @HostListener('window:popstate', ['$event'])
  onPopState(): void {
    if (this.currentStep > 1) {
      this.currentStep = (this.currentStep - 1) as 1 | 2 | 3 | 4;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Re-push so the next back press is also intercepted
      history.pushState({ bookingStep: this.currentStep }, '');
    }
    // If on step 1, let the browser navigate back naturally (to /packages)
  }

  private advanceStep(step: 1 | 2 | 3 | 4): void {
    history.pushState({ bookingStep: step }, '');
    this.currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goTo(step: 1 | 2 | 3 | 4): void { this.advanceStep(step); }

  onStep1Next(): void { this.advanceStep(2); }

  ngOnDestroy(): void {
    this.stateService.reset();
    this.destroy$.next();
    this.destroy$.complete();
  }
}

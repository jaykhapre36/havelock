import { Component, OnInit, OnDestroy } from '@angular/core';
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
    { n: 2, label: 'Details' },
    { n: 3, label: 'Review' },
    { n: 4, label: 'Done' }
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
      },
      error: () => this.router.navigate(['/packages'])
    });
  }

  goTo(step: 1 | 2 | 3 | 4): void { this.currentStep = step; window.scrollTo({ top: 0, behavior: 'smooth' }); }

  onStep1Next(): void { this.currentStep = 2; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  onStep2Next(): void { this.currentStep = 3; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  onStep3Back(): void { this.currentStep = 2; window.scrollTo({ top: 0, behavior: 'smooth' }); }

  // Step3 navigates to /booking-success directly after payment
  onStep3Confirm(): void {}

  ngOnDestroy(): void {
    this.stateService.reset();
    this.destroy$.next();
    this.destroy$.complete();
  }
}

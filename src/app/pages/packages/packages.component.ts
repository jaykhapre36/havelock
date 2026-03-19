import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PackageService, TicketPackage } from '../../services/package.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss']
})
export class PackagesComponent implements OnInit {

  packages: TicketPackage[] = [];
  loading = true;
  error = '';

  constructor(
    private packageService: PackageService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.packageService.getPackages().subscribe({
      next: (res) => {
        this.packages = res.data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load packages. Please try again.';
        this.loading = false;
      }
    });
  }

  selectIndividual(pkg: TicketPackage): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/packages' } });
      return;
    }
    this.router.navigate(['/booking'], { queryParams: { packageId: pkg.id } });
  }

  selectGroup(pkg: TicketPackage): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/packages' } });
      return;
    }
    this.router.navigate(['/group-booking'], { queryParams: { packageId: pkg.id } });
  }

  getPrice(pkg: TicketPackage): number {
    return parseFloat(pkg.price);
  }
}

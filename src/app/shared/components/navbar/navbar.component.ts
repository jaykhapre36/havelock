import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

interface NavLink {
  label: string;
  route: string;
  exact: boolean;
}

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  navLinks: NavLink[] = [
    { label: 'Home',               route: '/',                   exact: true  },
    { label: 'Attractions',        route: '/attractions',         exact: false },
    { label: 'Restaurants',        route: '/restaurants',         exact: false },
    { label: 'Individual Booking', route: '/tickets',             exact: false },
    { label: 'Group Booking',      route: '/group-booking',       exact: false },
    { label: 'Map',                route: '/map',                 exact: false },
    { label: 'Inquiry',            route: '/contact',             exact: false }
  ];

  isMenuOpen = false;
  isScrolled   = false;
  currentUser: User | null = null;

  private subs = new Subscription();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.subs.add(
      this.authService.currentUser$.subscribe(user => this.currentUser = user)
    );
    // Close mobile menu on route change
    this.subs.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => this.isMenuOpen = false)
    );
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        // Even if API fails, clear session and redirect
        this.authService.clearSession();
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

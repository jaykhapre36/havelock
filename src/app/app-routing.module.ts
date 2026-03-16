import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'attractions',
    loadChildren: () => import('./pages/attractions/attractions.module').then(m => m.AttractionsModule)
  },
  {
    path: 'attractions/:id',
    loadChildren: () => import('./pages/attraction-detail/attraction-detail.module').then(m => m.AttractionDetailModule)
  },
  {
    path: 'tickets',
    loadChildren: () => import('./pages/tickets/tickets.module').then(m => m.TicketsModule)
  },
  {
    path: 'availability',
    loadChildren: () => import('./pages/availability/availability.module').then(m => m.AvailabilityModule)
  },
  {
    path: 'map',
    loadChildren: () => import('./pages/map/map.module').then(m => m.MapModule)
  },
  {
    path: 'faq-safety',
    loadChildren: () => import('./pages/faq-safety/faq-safety.module').then(m => m.FaqSafetyModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('./pages/contact/contact.module').then(m => m.ContactModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'offers',
    loadChildren: () => import('./pages/offers/offers.module').then(m => m.OffersModule)
  },
  {
    path: 'booking',
    loadChildren: () => import('./pages/booking/booking.module').then(m => m.BookingModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    loadChildren: () => import('./pages/not-found/not-found.module').then(m => m.NotFoundModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

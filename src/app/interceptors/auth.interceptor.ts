import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private storage: StorageService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Attach Bearer token if present
    const token = this.storage.get<string>('token');
    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          error.status === 401 &&
          !req.url.includes('/auth/')   // skip login/OTP endpoints → prevents redirect loops
        ) {
          // Session expired — wipe local state
          this.authService.clearSession();

          // Preserve the page they were on so we can return after re-login
          const returnUrl = this.router.url;

          this.router.navigate(['/auth/login'], {
            queryParams: {
              reason: 'session_expired',
              returnUrl: returnUrl !== '/auth/login' ? returnUrl : '/'
            }
          });
        }

        return throwError(() => error);
      })
    );
  }
}

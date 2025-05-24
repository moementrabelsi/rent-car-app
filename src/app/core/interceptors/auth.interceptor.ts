import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get the auth token
  const token = authService.getToken();
  
  // Only add the authorization header if the token exists
  if (token) {
    console.log(`Adding auth token to ${req.url}`);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.warn(`No auth token available for request to ${req.url}`);
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        console.log('Authentication error - redirecting to login');
        // Clear auth state and redirect to login
        authService.signOut();
        router.navigate(['/signin']);
      }
      return throwError(() => error);
    })
  );
};

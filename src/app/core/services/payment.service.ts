import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PaymentIntent {
  clientSecret: string;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Create a payment intent for a booking
   * @param bookingId The ID of the booking
   * @param amount Amount to charge in cents
   */
  createPaymentIntent(bookingId: string, amount: number): Observable<PaymentIntent> {
    return this.http.post<any>(`${this.apiUrl}/create-payment-intent`, {
      bookingId,
      amount
    }).pipe(
      map(response => {
        console.log('Payment intent created:', response);
        return {
          clientSecret: response.clientSecret,
          id: response.id
        };
      }),
      catchError(error => {
        console.error('Error creating payment intent:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to create payment intent'));
      })
    );
  }

  /**
   * Confirm a successful payment
   * @param bookingId The ID of the booking
   * @param paymentIntentId The payment intent ID
   */
  confirmPayment(bookingId: string, paymentIntentId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/confirm-payment`, {
      bookingId,
      paymentIntentId
    }).pipe(
      catchError(error => {
        console.error('Error confirming payment:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to confirm payment'));
      })
    );
  }
}

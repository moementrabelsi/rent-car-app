import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Review } from '../interfaces/review.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getReviews(): Observable<Review[]> {
    return this.http.get<{ status: string, data: { reviews: Review[] } }>(`${this.apiUrl}`)
      .pipe(
        map(response => response.data.reviews),
        catchError(error => {
          console.error('Error fetching reviews', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load reviews'));
        })
      );
  }

  getReviewById(id: string): Observable<Review> {
    return this.http.get<{ status: string, data: { review: Review } }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data.review),
        catchError(error => {
          console.error('Error fetching review', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load review'));
        })
      );
  }

  getReviewsByCarId(carId: string): Observable<Review[]> {
    return this.http.get<{ status: string, data: { reviews: Review[] } }>(`${this.apiUrl}/car/${carId}`)
      .pipe(
        map(response => response.data.reviews),
        catchError(error => {
          console.error('Error fetching car reviews', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load car reviews'));
        })
      );
  }

  getReviewsByUserId(userId: string): Observable<Review[]> {
    return this.http.get<{ status: string, data: { reviews: Review[] } }>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        map(response => response.data.reviews),
        catchError(error => {
          console.error('Error fetching user reviews', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load user reviews'));
        })
      );
  }

  createReview(review: Omit<Review, 'id' | 'userName' | 'date' | 'createdAt' | 'updatedAt'>): Observable<Review> {
    return this.http.post<{ status: string, data: { review: Review } }>(`${this.apiUrl}`, review)
      .pipe(
        map(response => response.data.review),
        catchError(error => {
          console.error('Error creating review', error);
          return throwError(() => new Error(error.error?.message || 'Failed to create review'));
        })
      );
  }

  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    return this.http.put<{ status: string, data: { review: Review } }>(`${this.apiUrl}/${id}`, review)
      .pipe(
        map(response => response.data.review),
        catchError(error => {
          console.error('Error updating review', error);
          return throwError(() => new Error(error.error?.message || 'Failed to update review'));
        })
      );
  }

  deleteReview(id: string): Observable<boolean> {
    return this.http.delete<{ status: string }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.status === 'success'),
        catchError(error => {
          console.error('Error deleting review', error);
          return throwError(() => new Error(error.error?.message || 'Failed to delete review'));
        })
      );
  }
}

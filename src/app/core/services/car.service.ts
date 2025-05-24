import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Car, CarCategory } from '../models/car.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = `${environment.apiUrl}/cars`;

  constructor(private http: HttpClient) { }

  getCars(): Observable<Car[]> {
    return this.http.get<{ status: string, data: { cars: any[] } }>(`${this.apiUrl}`)
      .pipe(
        map(response => {
          // Map the backend response to our frontend model, ensuring photos are properly set
          return response.data.cars.map(carData => {
            // Create a proper Car object with both id and _id values
            const car: Car = {
              ...carData,
              // Preserve MongoDB _id and also set as frontend id if not present
              _id: carData._id,
              id: carData.id || carData._id
            };
            
            // If the API returns 'images' but not 'photos', or vice versa, make sure both are set
            if (car.images && !car.photos) {
              car.photos = car.images;
            } else if (car.photos && !car.images) {
              car.images = car.photos;
            }
            
            // Ensure numeric values are properly typed
            if (car.pricePerDay) {
              car.pricePerDay = Number(car.pricePerDay);
            }
            if (car.mileage) {
              car.mileage = Number(car.mileage);
            }
            
            // Ensure review data is properly set
            console.log(`Car ${car.model} review data:`, { 
              reviewCount: car.reviewCount, 
              numberOfReviews: car.numberOfReviews 
            });
            
            // The backend uses numberOfReviews but might be sending it differently
            if (car.reviewCount !== undefined && car.numberOfReviews === undefined) {
              car.numberOfReviews = Number(car.reviewCount);
            } else if (car.numberOfReviews !== undefined && car.reviewCount === undefined) {
              car.reviewCount = Number(car.numberOfReviews);
            } else if (!car.reviewCount && !car.numberOfReviews) {
              // If neither exists, set both to 0
              car.reviewCount = 0;
              car.numberOfReviews = 0;
            }
            
            // Make sure rating is a number
            if (car.rating) {
              car.rating = Number(car.rating);
            } else {
              car.rating = 0;
            }
            
            return car;
          });
        }),
        catchError(error => {
          console.error('Error fetching cars', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load cars'));
        })
      );
  }

  getCarById(id: string): Observable<Car | undefined> {
    return this.http.get<{ status: string, data: { car: any } }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          const carData = response.data.car;
          
          // Transform the backend car model to our frontend Car model
          // Make sure _id is mapped to id
          if (carData) {
            const car: Car = {
              ...carData,
              id: carData._id || carData.id, // Map MongoDB _id to id for frontend
            };
            
            // If the API returns 'images' but not 'photos', or vice versa, make sure both are set
            if (car.images && !car.photos) {
              car.photos = car.images;
            } else if (car.photos && !car.images) {
              car.images = car.photos;
            }
            
            // Ensure numeric values are properly typed
            if (car.pricePerDay) {
              car.pricePerDay = Number(car.pricePerDay);
            }
            if (car.mileage) {
              car.mileage = Number(car.mileage);
            }
            
            // Ensure review data is properly set
            console.log(`Car ${car.model} detail review data:`, { 
              reviewCount: car.reviewCount, 
              numberOfReviews: car.numberOfReviews 
            });
            
            // The backend uses numberOfReviews but might be sending it differently
            if (car.reviewCount !== undefined && car.numberOfReviews === undefined) {
              car.numberOfReviews = Number(car.reviewCount);
            } else if (car.numberOfReviews !== undefined && car.reviewCount === undefined) {
              car.reviewCount = Number(car.numberOfReviews);
            } else if (!car.reviewCount && !car.numberOfReviews) {
              // If neither exists, set both to 0
              car.reviewCount = 0;
              car.numberOfReviews = 0;
            }
            
            // Make sure rating is a number
            if (car.rating) {
              car.rating = Number(car.rating);
            } else {
              car.rating = 0;
            }
            
            console.log('Transformed car data:', car);
            return car;
          }
          return undefined;
        }),
        catchError(error => {
          console.error('Error fetching car details', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load car details'));
        })
      );
  }

  getCarsByCategory(category: CarCategory): Observable<Car[]> {
    return this.http.get<{ status: string, data: { cars: Car[] } }>(`${this.apiUrl}?category=${category}`)
      .pipe(
        map(response => response.data.cars),
        catchError(error => {
          console.error('Error fetching cars by category', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load cars by category'));
        })
      );
  }

  searchCars(query: string): Observable<Car[]> {
    return this.http.get<{ status: string, data: { cars: Car[] } }>(`${this.apiUrl}/search?q=${query}`)
      .pipe(
        map(response => response.data.cars),
        catchError(error => {
          console.error('Error searching cars', error);
          return throwError(() => new Error(error.error?.message || 'Failed to search cars'));
        })
      );
  }

  addCar(car: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Observable<Car> {
    // Create FormData for handling files/images
    const formData = new FormData();
    
    // Add all car properties to formData
    Object.keys(car).forEach(key => {
      if (key === 'images' && Array.isArray(car[key as keyof typeof car])) {
        // Add each image file
        (car[key as keyof typeof car] as any[]).forEach((file, index) => {
          formData.append('photos', file);
        });
      } else if (typeof car[key as keyof typeof car] === 'object' && car[key as keyof typeof car] !== null) {
        // For objects like availability, convert to JSON string
        formData.append(key, JSON.stringify(car[key as keyof typeof car]));
      } else {
        formData.append(key, car[key as keyof typeof car] as string);
      }
    });
    
    return this.http.post<{ status: string, data: { car: Car } }>(`${this.apiUrl}`, formData)
      .pipe(
        map(response => response.data.car),
        catchError(error => {
          console.error('Error adding car', error);
          return throwError(() => new Error(error.error?.message || 'Failed to add car'));
        })
      );
  }

  updateCar(id: string, car: Partial<Car>): Observable<Car | undefined> {
    // Similar to addCar, create FormData for handling files
    const formData = new FormData();
    
    // Add all car properties to formData
    Object.keys(car).forEach(key => {
      if (key === 'images' && Array.isArray(car[key as keyof typeof car])) {
        // Add each image file if new images are provided
        (car[key as keyof typeof car] as any[]).forEach((file, index) => {
          // Only append if it's a File object (new upload) not a string URL
          if (!(typeof file === 'string')) {
            formData.append('photos', file);
          }
        });
      } else if (typeof car[key as keyof typeof car] === 'object' && car[key as keyof typeof car] !== null) {
        formData.append(key, JSON.stringify(car[key as keyof typeof car]));
      } else {
        formData.append(key, car[key as keyof typeof car] as string);
      }
    });
    
    return this.http.put<{ status: string, data: { car: Car } }>(`${this.apiUrl}/${id}`, formData)
      .pipe(
        map(response => response.data.car),
        catchError(error => {
          console.error('Error updating car', error);
          return throwError(() => new Error(error.error?.message || 'Failed to update car'));
        })
      );
  }

  deleteCar(id: string): Observable<boolean> {
    return this.http.delete<{ status: string }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.status === 'success'),
        catchError(error => {
          console.error('Error deleting car', error);
          return throwError(() => new Error(error.error?.message || 'Failed to delete car'));
        })
      );
  }

  getCarCategories(): Observable<CarCategory[]> {
    // Since the /categories endpoint is causing issues with MongoDB ObjectId casting,
    // let's provide a hardcoded set of categories that matches our backend enum
    // This avoids the API call that's failing
    const defaultCategories: CarCategory[] = [
      'economy',
      'compact',
      'midsize',
      'luxury',
      'suv',
      'van',
      'sports'
    ];
    
    // Return the hardcoded categories as an observable
    return new Observable<CarCategory[]>(observer => {
      observer.next(defaultCategories);
      observer.complete();
    });
  }
}
import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  private googleMapsLoaded = new Subject<boolean>();
  private readonly apiKey = 'AIzaSyD5lofcHqSpw1BEmfwdZ0X2NQfNHQc4b4o';
  
  constructor() {
    this.loadGoogleMapsScript();
  }

  private loadGoogleMapsScript(): void {
    // Check if Google Maps API is already loaded
    if (window && (window as any).google && (window as any).google.maps) {
      this.googleMapsLoaded.next(true);
      return;
    }

    // If script is already in the DOM but not loaded
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      // Wait for it to load
      const checkGoogleExists = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          clearInterval(checkGoogleExists);
          this.googleMapsLoaded.next(true);
        }
      }, 100);
      
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.googleMapsLoaded.next(true);
    };

    script.onerror = () => {
      console.error('Could not load Google Maps API');
      this.googleMapsLoaded.next(false);
    };

    document.head.appendChild(script);
  }

  public getMapsLoadedObservable(): Observable<boolean> {
    // If maps is already loaded, return immediately
    if ((window as any).google && (window as any).google.maps) {
      return of(true);
    }
    
    return this.googleMapsLoaded.asObservable();
  }
}

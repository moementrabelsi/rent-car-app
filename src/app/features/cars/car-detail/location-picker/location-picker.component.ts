import { Component, EventEmitter, Output, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapsService } from '../../../../core/services/maps.service';

@Component({
  selector: 'app-booking-location-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="location-picker">
      <div class="map-container">
        <div #mapContainer style="height: 300px; width: 100%;"></div>
      </div>
      <div class="selected-location" *ngIf="selectedAddress">
        Selected Location: {{ selectedAddress }}
      </div>
    </div>
  `,

  styles: [`
    .location-picker { 
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 15px;
    }
    .map-container { 
      height: 300px; 
      width: 100%; 
    }
    .selected-location {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(255, 255, 255, 0.8);
      padding: 8px;
      font-size: 12px;
      text-align: center;
    }
  `]
})
export class BookingLocationPickerComponent implements AfterViewInit {
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number; address: string }>();
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  selectedLocation: { lat: number; lng: number } | null = null;
  selectedAddress: string = '';
  map: any = null;
  marker: any = null;
  geocoder: any = null;
  apiKey = 'AIzaSyD5lofcHqSpw1BEmfwdZ0X2NQfNHQc4b4o';
  
  constructor(private ngZone: NgZone, private mapsService: MapsService) {}

  ngAfterViewInit() {
    this.loadGoogleMapsScript();
  }

  loadGoogleMapsScript() {
    // Use our Maps service to ensure Google Maps is loaded
    this.mapsService.getMapsLoadedObservable().subscribe(loaded => {
      if (loaded) {
        this.initMap();
      } else {
        console.error('Google Maps API failed to load.');
      }
    });
  }

  initMap() {
    const mapOptions: any = {
      center: { lat: 47.1625, lng: 19.5033 },
      zoom: 7,
      mapTypeId: (window as any).google.maps.MapTypeId.ROADMAP,
      streetViewControl: false
    };

    this.map = new (window as any).google.maps.Map(this.mapContainer.nativeElement, mapOptions);
    this.geocoder = new (window as any).google.maps.Geocoder();

    this.map.addListener('click', (event: any) => {
      this.ngZone.run(() => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          this.getAddressFromLatLng({ lat, lng });
        }
      });
    });
    
    // Make sure the map is visible
    setTimeout(() => {
      if (this.map) {
        (window as any).google.maps.event.trigger(this.map, 'resize');
      }
    }, 300);
  }

  getAddressFromLatLng(location: { lat: number; lng: number }) {
    this.geocoder.geocode({ 'location': location }, (results: any, status: any) => {
      this.ngZone.run(() => {
        if (status === (window as any).google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            this.selectedAddress = results[0].formatted_address;
            this.placeMarker(location, results[0].formatted_address);
          } else {
            this.selectedAddress = 'Address not found';
            this.placeMarker(location, 'Address not found');
          }
        } else {
          this.selectedAddress = 'Geocoder failed: ' + status;
          this.placeMarker(location, 'Address not found');
        }
      });
    });
  }

  placeMarker(location: { lat: number; lng: number }, address: string = '') {
    if (this.marker) {
      this.marker.setMap(null);
    }

    this.marker = new (window as any).google.maps.Marker({
      position: location,
      map: this.map,
      animation: (window as any).google.maps.Animation.DROP
    });

    if (this.map) {
      this.map.panTo(location);
    }
    
    this.selectedLocation = location;
    this.selectedAddress = address;
    this.locationSelected.emit({ ...location, address });
  }
}

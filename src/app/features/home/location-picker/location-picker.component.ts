import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { icon, latLng, marker, tileLayer } from 'leaflet';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, LeafletModule],
  template: `
    <div class="location-picker">
      <div class="map-container">
        <div 
          leaflet 
          [leafletOptions]="mapOptions"
          (leafletMapReady)="onMapReady($event)"
          (leafletClick)="onMapClick($event)"
          style="height: 400px; width: 100%;"
        ></div>
      </div>
      <div class="selected-location" *ngIf="selectedLocation">
        Selected Location: {{ selectedLocation.lat }}, {{ selectedLocation.lng }}
      </div>
    </div>
  `,
  styles: [`
    .map-container { 
      height: 400px; 
      width: 100%; 
    }
    .map-container > div[leaflet] {
      height: 400px;
      width: 100%;
    }
  `]
})
export class LocationPickerComponent {
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  selectedLocation: { lat: number; lng: number } | null = null;
  mapInstance: any;

  mapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        maxZoom: 18, 
        attribution: '© OpenStreetMap contributors' 
      })
    ],
    zoom: 7, // Zoom in to Hungary
    center: latLng(47.1625, 19.5033) // Center of Hungary
  };

  onMapReady(map: any) {
    this.mapInstance = map;
  }

  onMapClick(event: any) {
    const { lat, lng } = event.latlng;
    // Hungary bounding box
    const minLat = 45.7, maxLat = 48.6, minLng = 16.0, maxLng = 22.9;
    if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) {
      alert('Please select a location within Hungary.');
      return;
    }
    if (this.mapInstance) {
      this.mapInstance.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          this.mapInstance.removeLayer(layer);
        }
      });
      marker([lat, lng], {
        icon: icon({
          iconSize: [25, 41],
          iconAnchor: [13, 41],
          iconUrl: 'assets/leaflet/marker-icon.png',
          shadowUrl: 'assets/leaflet/marker-shadow.png'
        })
      }).addTo(this.mapInstance);
      this.selectedLocation = { lat, lng };
      this.locationSelected.emit(this.selectedLocation);
    }
  }
}



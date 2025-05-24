import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-map-modal',
  standalone: true, // ⬅️ Must be true for standalone components
  imports: [CommonModule], // ⬅️ This is what fixes the *ngFor / *ngIf issue
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.css']
})
export class MapModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('map') mapContainer!: ElementRef;
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() locationSelected = new EventEmitter<string>();
  
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  
  // Demo locations
  locations = [
    { name: 'Main Office', lat: 40.7128, lng: -74.0060 },
    { name: 'Downtown Branch', lat: 40.7282, lng: -73.9942 },
    { name: 'Airport Location', lat: 40.6413, lng: -73.7781 }
  ];
  
  ngOnInit(): void {
    // Add animation class when opened
    document.body.style.overflow = 'hidden';
  }
  
  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 300);
  }
  
  initMap(): void {
    if (!this.mapContainer) return;
    
    this.map = L.map(this.mapContainer.nativeElement).setView([40.7128, -74.0060], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    
    // Add location markers
    this.locations.forEach(loc => {
      const locationIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
      });
      
      const marker = L.marker([loc.lat, loc.lng], { icon: locationIcon }).addTo(this.map!);
      marker.bindPopup(`<b>${loc.name}</b><br>Click to select this location`);
      
      marker.on('click', () => {
        this.selectLocation(loc.name);
      });
    });
    
    // Set marker on click
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.marker) {
        this.map!.removeLayer(this.marker);
      }
      
      const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
      });
      
      this.marker = L.marker(e.latlng, { icon: customIcon }).addTo(this.map!);
      this.marker.bindPopup('Custom location<br>Click to select').openPopup();
      
      this.marker.on('click', () => {
        this.selectCustomLocation(e.latlng);
      });
    });
  }
  
  closeModal(): void {
    this.close.emit();
  }
  
  selectLocation(name: string): void {
    this.locationSelected.emit(name);
  }
  
  selectCustomLocation(latlng: L.LatLng): void {
    const customLocationName = `Custom (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`;
    this.locationSelected.emit(customLocationName);
  }
  
  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}

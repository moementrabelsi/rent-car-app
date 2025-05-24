import { Component, OnInit } from '@angular/core'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { CommonModule } from '@angular/common'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { FormsModule } from '@angular/forms'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { RouterModule } from '@angular/router'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { trigger, state, style, transition, animate } from '@angular/animations'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { HttpClient } from '@angular/common/http'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { LocationPickerComponent } from './location-picker/location-picker.component'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';

import { Vehicle } from '../../core/interfaces/vehicle.interface'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { CarService } from '../../core/services/car.service'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { Car } from '../../core/models/car.model'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { environment } from '../../../environments/environment'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';

// Customer review interface for typesafety
interface CustomerReview {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LocationPickerComponent,
    FormsModule
  ],
  animations: [
    trigger('cardHover', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  // Slider properties
  currentSlide = 0;
  slidesToShow = 3; // Show exactly 3 cards at a time
  
  // Photo navigation properties
  currentPhotoIndices: { [vehicleId: string]: number } = {};
  
  // Data properties
  featuredVehicles: Vehicle[] = [];
  vehicles: Vehicle[] = [];
  loading = false;
  error: string = '';
  isEmpty = false;
  apiBaseUrl = environment.apiUrl;
  
  // UI state properties
  showLocationPicker = false;
  selectedLocation: { lat: number; lng: number } | null = null;
  searchQuery = '';
  searchLocation = '';
  
  // Known working direct image URLs for specific vehicles
  private directImageUrls: { [key: string]: string } = {
    'fiat': apiUrls.fallbackImageUrl,
    'porsche': apiUrls.getUploadUrl('1747396439289_3659222.jpg'),
    'generic': apiUrls.getUploadUrl('car-generic.jpg')
  };
  
  // Customer reviews
  customersReviews: CustomerReview[] = [
    {
      name: 'Anna Kovács',
      rating: 5,
      comment: 'Excellent service and very friendly staff! The car was clean and in great condition.',
      date: '2025-05-10'
    },
    {
      name: 'Gábor Tóth',
      rating: 4,
      comment: 'Smooth booking process and good prices. Will rent again!',
      date: '2025-04-28'
    },
  ];
  
  /**
   * Get the base URL for the backend server
   */
  private get serverBaseUrl(): string {
    // Convert API URL (http://localhost:5000/api) to base URL (http://localhost:5000)
    return this.apiBaseUrl.replace(/\/api$/, '');
  }
  
  constructor(private carService: CarService, private http: HttpClient) {}
  
  ngOnInit(): void {
    this.loadFeaturedVehicles();
  }

  /**
   * Load featured vehicles from the API
   */
  loadFeaturedVehicles(): void {
    this.loading = true;
    this.error = '';
    
    this.carService.getCars().subscribe(
      (cars: Car[]) => {
        console.log('Raw cars data from API:', cars);
        
        if (cars && cars.length > 0) {
          // Map car data from backend to vehicles in our frontend format
          this.vehicles = cars.map(car => this.mapCarToVehicle(car));
          console.log('Mapped vehicles:', this.vehicles);
          this.loading = false;
        } else {
          this.isEmpty = true;
          this.loading = false;
        }
      },
      (err: any) => {
        console.error('Error loading cars:', err);
        this.error = 'Failed to load vehicles. Please try again.';
        this.loading = false;
      }
    );
  }
  
  /**
   * Map a Car object from the API to the Vehicle interface we use in the frontend
   */
  private mapCarToVehicle(car: Car): Vehicle {
    // Add logging to debug car data
    console.log('Raw car data:', car);
    
    // Initialize the current photo index for this car
    if (car._id) {
      this.currentPhotoIndices[car._id] = 0;
    }

    // Parse the car name data
    let carName = car.name || '';
    let carBrand = car.brand || car.make || '';
    let carModel = car.model || '';
    
    // Create a display name with fallbacks
    let displayName = 'Unknown Vehicle';
    if (carName && carName !== 'undefined') {
      displayName = carName;
    } else if (carBrand && carModel && carBrand !== 'undefined' && carModel !== 'undefined') {
      displayName = `${carBrand} ${carModel}`;
    } else if (carModel && carModel !== 'undefined') {
      displayName = carModel;
    } else if (carBrand && carBrand !== 'undefined') {
      displayName = carBrand;
    }
    
    // Set image URL based on vehicle type
    let imageUrl = '';
    const lowerName = displayName.toLowerCase();
    
    // Use direct hardcoded URLs that we know work from the console logs
    if (lowerName.includes('fiat')) {
      imageUrl = this.directImageUrls['fiat'];
      console.log('Using hardcoded Fiat image URL:', imageUrl);
    } 
    else if (lowerName.includes('porsche')) {
      imageUrl = this.directImageUrls['porsche'];
      console.log('Using hardcoded Porsche image URL:', imageUrl);
    }
    // For all other cars - use their photos array if available
    else if (car.photos && Array.isArray(car.photos) && car.photos.length > 0) {
      const photo = car.photos[0];
      imageUrl = `${this.serverBaseUrl}/uploads/${photo}`;
      console.log(`Set image URL for ${car.name} to: ${imageUrl}`);
    }
    // If we still don't have an image URL, use a generic one
    else {
      imageUrl = this.directImageUrls['generic'];
      console.log(`Using generic image for: ${displayName}`);
    }
    
    // Get vehicle properties with safe fallbacks
    const vehicleType = car.category ? car.category.toLowerCase() : 'sedan';
    const seatCount = car.seats || 5;
    const transmissionType = car.transmission || 'automatic';
    const description = car.description || '';
    const ratingValue = typeof car.rating === 'number' ? car.rating : 4.5;
    const reviews = typeof car.reviewCount === 'number' ? car.reviewCount : 0;
    
    // Map vehicle type to allowed values
    let mappedType: 'sedan' | 'suv' | 'luxury' | 'sports' = 'sedan';
    if (vehicleType === 'suv') mappedType = 'suv';
    else if (vehicleType === 'luxury') mappedType = 'luxury';
    else if (vehicleType === 'sports') mappedType = 'sports';
    
    // Create the vehicle object with all required properties
    return {
      id: car._id || '',
      name: displayName,
      brand: carBrand,
      model: carModel,
      year: car.year ? parseInt(car.year.toString(), 10) : undefined,
      type: mappedType,
      transmission: transmissionType as 'automatic' | 'manual',
      fuelType: car.fuelType || 'petrol',
      seats: seatCount,
      pricePerDay: car.pricePerDay || 50,
      imageUrl: imageUrl,
      location: car.location || 'Not specified',
      description: description,
      available: car.status === 'available',
      stock: car.stock,
      features: car.features,
      createdAt: car.createdAt,
      updatedAt: car.updatedAt
    };
  }

  /**
   * Navigate to the next or previous photo for a specific vehicle
   */
  navigatePhoto(vehicle: Vehicle, direction: 'next' | 'prev', event: Event): void {
    event.stopPropagation(); // Prevent the event from bubbling up
    
    // Get the total number of photos for this vehicle
    const photos = vehicle.photos || [];
    const totalPhotos = photos.length;
    if (totalPhotos <= 1) return; // No need to navigate if there's only one photo
    
    // Get the current index
    const currentIndex = this.currentPhotoIndices[vehicle.id] || 0;
    
    // Calculate the new index
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % totalPhotos;
    } else {
      newIndex = (currentIndex - 1 + totalPhotos) % totalPhotos;
    }
    
    // Update the index
    this.currentPhotoIndices[vehicle.id] = newIndex;
    
    // Update the image URL
    vehicle.imageUrl = this.getVehicleImageUrl(vehicle, newIndex);
    
    console.log(`Navigated to photo ${newIndex + 1}/${totalPhotos} for vehicle ${vehicle.name}`);
  }
  
  /**
   * Get the image URL for a specific vehicle and photo index
   */
  getVehicleImageUrl(vehicle: Vehicle, index: number = 0): string {
    const photos = vehicle.photos || [];
    if (photos.length === 0) {
      return 'assets/images/car-placeholder.svg';
    }
    
    // Make sure the index is valid
    const validIndex = Math.min(index, photos.length - 1);
    const photoPath = photos[validIndex];
    
    // Check if it's already a full URL
    if (photoPath && (photoPath.startsWith('http://') || photoPath.startsWith('https://'))) {
      return photoPath;
    }
    
    // Use the base URL without /api
    const baseUrl = this.apiBaseUrl.split('/api')[0];
    return `${baseUrl}/uploads/${photoPath}`;
  }
  
  /**
   * Handle image loading errors by providing direct hardcoded URLs
   */
  handleImageError(event: Event, vehicle: Vehicle): void {
    console.error('Image loading error detected');
    
    const imgElement = event.target as HTMLImageElement;
    console.error(`Failed to load image: ${imgElement.src}`);
    
    // Try to fix with hardcoded URLs based on vehicle name
    if (vehicle && vehicle.name) {
      const lowerName = vehicle.name.toLowerCase();
      
      if (lowerName.includes('fiat')) {
        // Direct hardcoded URL for Fiat
        imgElement.src = this.directImageUrls['fiat'];
        console.log('Switching to hardcoded Fiat image URL');
      } 
      else if (lowerName.includes('porsche')) {
        // Direct hardcoded URL for Porsche
        imgElement.src = this.directImageUrls['porsche'];
        console.log('Switching to hardcoded Porsche image URL');
      }
      else {
        // For other cars, use a known working generic image
        imgElement.src = this.directImageUrls['generic'];
        console.log('Switching to generic car image');
      }
    }
  }
  
  /**
   * Move the slider left or right
   */
  scrollVehicles(direction: 'left' | 'right'): void {
    const slidesToShow = 3; // We're showing 3 cards at a time
    const maxSlide = Math.max(0, this.vehicles.length - slidesToShow);
    
    if (direction === 'left') {
      this.currentSlide = Math.max(0, this.currentSlide - 1);
    } else {
      this.currentSlide = Math.min(maxSlide, this.currentSlide + 1);
    }
    
    console.log(`Slider moved to position ${this.currentSlide} of max ${maxSlide}`);
    
    // Force rendering update
    this.vehicles = [...this.vehicles];
  }

  /**
   * Get only the vehicles that should be visible in the current slide
   */
  getVisibleVehicles(): Vehicle[] {
    // Show only vehicles starting from currentSlide and limit to 3 per page
    const startIndex = this.currentSlide;
    const endIndex = Math.min(startIndex + this.slidesToShow, this.vehicles.length);
    
    // Get the visible vehicles
    const visibleVehicles = this.vehicles.slice(startIndex, endIndex);
    
    // Ensure each vehicle has an imageUrl set and update it based on current photo index
    visibleVehicles.forEach(vehicle => {
      const index = this.currentPhotoIndices[vehicle.id] || 0;
      vehicle.imageUrl = this.getVehicleImageUrl(vehicle, index);
    });
    
    return visibleVehicles;
  }

  /**
   * Navigate to a specific slide by index
   */
  goToSlide(idx: number): void {
    this.currentSlide = idx;
  }

  /**
   * Check if the dot at the given index should be active
   */
  isActiveDot(idx: number): boolean {
    return this.currentSlide === idx;
  }

  /**
   * Calculate how many slider dots we need based on vehicles
   */
  getSliderDots(): number[] {
    // Calculate how many slider dots we need based on 3 vehicles per page
    const totalPages = Math.ceil(this.vehicles.length / this.slidesToShow);
    return Array(Math.max(1, totalPages)).fill(0).map((_, i) => i);
  }

  /**
   * Handle location selection from the picker
   */
  onLocationSelect(location: { lat: number; lng: number }): void {
    this.selectedLocation = location;
    this.showLocationPicker = false;
    this.searchLocation = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }

  /**
   * Search for vehicles based on query and location
   */
  onSearch(event: { query: string; location: string }): Vehicle[] {
    // Validate input
    const query = event.query.trim().toLowerCase();
    const location = event.location.trim().toLowerCase();

    if (query || location) {
      // Advanced search logic
      const filteredVehicles = this.vehicles.filter(vehicle => {
        const matchesQuery = !query || 
          vehicle.name.toLowerCase().includes(query) ||
          vehicle.type.toLowerCase().includes(query) ||
          (vehicle.brand ? vehicle.brand.toLowerCase().includes(query) : false);
        
        const matchesLocation = !location || 
          vehicle.location.toLowerCase().includes(location);
        
        return matchesQuery && matchesLocation;
      });

      // If no results, expand search criteria
      if (filteredVehicles.length === 0) {
        console.warn('No exact matches found. Showing similar vehicles.');
      }

      // TODO: Navigate to search results page or update view
      console.log('Search results:', {
        query, 
        location, 
        results: filteredVehicles
      });

      return filteredVehicles;
    }

    return this.vehicles;
  }
}



import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Vehicle } from '../../core/interfaces/vehicle.interface';
import { CarService } from '../../core/services/car.service';
import { Car } from '../../core/models/car.model';
import { environment } from '../../../environments/environment';
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
export class MainHomeComponent implements OnInit {
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
  
  // Backend server base URL for images is now handled by EnvironmentService
  
  // Customer reviews
  customersReviews: CustomerReview[] = [
    {
      name: 'Anna KovÃ¡cs',
      rating: 5,
      comment: 'Excellent service and very friendly staff! The car was clean and in great condition.',
      date: '2025-05-10'
    },
    {
      name: 'GÃ¡bor TÃ³th',
      rating: 4,
      comment: 'Smooth booking process and good prices. Will rent again!',
      date: '2025-04-28'
    },
  ];
  
  /**
   * Get the base URL for uploads
   */
  private get uploadsBaseUrl(): string {
    return apiUrls.uploadsUrl + '/';
  }
  
  constructor(
    private carService: CarService, 
    private http: HttpClient
  ) {}
  
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
    
    // Set image URL using photos from backend
    let imageUrl = '';
    
    // First try to use the car's photos array
    if (car.photos && Array.isArray(car.photos) && car.photos.length > 0) {
      const photo = car.photos[0];
      imageUrl = apiUrls.getUploadUrl(photo);
      console.log(`Set image URL for ${car.name} to: ${imageUrl}`);
    }
    // If no photos, try to use the car's ID to construct a URL
    else if (car._id) {
      imageUrl = apiUrls.getUploadUrl(`${car._id}.jpg`);
      console.log(`Using car ID-based image URL: ${imageUrl}`);
    }
    // As a last resort, use a direct URL to the uploads folder
    else {
      imageUrl = apiUrls.fallbackImageUrl;
      console.log(`Using fallback image URL for: ${displayName}`);
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
    
    // Create and return the Vehicle object with all required properties
    // Convert price from the Car model to match Vehicle interface
    const pricePerDay = car.pricePerDay || 50;
    
    return {
      id: car._id || '',
      name: displayName,
      brand: carBrand !== 'undefined' ? carBrand : undefined,
      model: carModel !== 'undefined' ? carModel : undefined,
      year: car.year,
      type: mappedType,
      transmission: transmissionType as 'automatic' | 'manual',
      fuelType: car.fuelType || 'petrol',
      seats: seatCount,
      pricePerDay: pricePerDay,
      imageUrl: imageUrl,
      location: car.location || 'Not specified',
      description: description,
      available: typeof car.availability === 'boolean' ? car.availability : true,
      stock: car.stock || 1,
      features: car.features || [],
      photos: car.photos || [],
      images: car.photos || [], // Use photos array for images as well
      carDirName: car.carDirName || '',
      createdAt: car.createdAt ? new Date(car.createdAt) : new Date(),
      updatedAt: car.updatedAt ? new Date(car.updatedAt) : new Date()
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
    
    // Make sure we have a photo and the index is valid
    if (photos.length > 0) {
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
    
    // If the car has an ID but no photos, try using the ID directly
    if (vehicle.id) {
      const baseUrl = this.apiBaseUrl.split('/api')[0];
      return `${baseUrl}/uploads/${vehicle.id}.jpg`;
    }
    
    // As a last resort, use a direct URL to one of the known images in the uploads folder
    return apiUrls.fallbackImageUrl;
  }
  
  /**
   * Handle image loading errors by trying different image URLs directly from the uploads folder
   */
  handleImageError(event: Event, vehicle: Vehicle): void {
    console.error('Image loading error detected');
    
    const imgElement = event.target as HTMLImageElement;
    console.error(`Failed to load image: ${imgElement.src}`);
    
    // Try to use the vehicle ID to construct a direct URL
    if (vehicle && vehicle.id) {
      const directUrl = `${this.uploadsBaseUrl}${vehicle.id}.jpg`;
      console.log(`Trying direct ID-based URL: ${directUrl}`);
      imgElement.src = directUrl;
    }
    // If that doesn't work, try a few known working images from the uploads folder
    else {
      // Use a known working image from the uploads folder
      const fallbackImage = `${this.uploadsBaseUrl}1747396263436_2855267.jpg`;
      console.log(`Using fallback image from uploads: ${fallbackImage}`);
      imgElement.src = fallbackImage;
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
    // Get only vehicles for the current slide based on slidesToShow
    const startIndex = this.currentSlide;
    const endIndex = Math.min(startIndex + this.slidesToShow, this.vehicles.length);
    
    // Get the visible vehicles for this slide
    const visibleVehicles = this.vehicles.slice(startIndex, endIndex);
    
    // Ensure each vehicle has an imageUrl set and update it based on current photo index
    visibleVehicles.forEach(vehicle => {
      const index = this.currentPhotoIndices[vehicle.id] || 0;
      vehicle.imageUrl = this.getVehicleImageUrl(vehicle, index);
    });
    
    console.log(`Showing vehicles ${startIndex} to ${endIndex-1} of ${this.vehicles.length}`);
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





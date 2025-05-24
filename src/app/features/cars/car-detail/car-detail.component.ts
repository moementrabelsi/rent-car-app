import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { ActivatedRoute, Router } from '@angular/router'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { CommonModule } from '@angular/common'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { environment } from '../../../../environments/environment'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { ReviewService } from '../../../core/services/review.service'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { Review } from '../../../core/interfaces/review.interface'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { BookingLocationPickerComponent } from './location-picker/location-picker.component'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { AuthService } from '../../../core/services/auth.service'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { User } from '../../../core/models/user.model'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { BookingService } from '../../../core/services/booking.service'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { Booking } from '../../../core/interfaces/booking.interface'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { MapsService } from '../../../core/services/maps.service'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { FileUploadService } from '../../../core/services/file-upload.service'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, BookingLocationPickerComponent]
})
export class CarDetailComponent implements OnInit, AfterViewInit {
  isBookingLoading = false;
  car: any = null;
  loading = true;
  apiUrl = environment.apiUrl || apiUrls.baseUrl;
  Math = Math; // Make Math available to the template
  
  // Image slider properties
  currentImageIndex = 0;
  thumbnailError: boolean[] = [];
  allImagesError = false;
  
  // Review form properties
  newReview = {
    rating: 0,
    comment: ''
  };
  hoverRating = 0;
  reviewSubmitted = false;
  
  // Booking form properties
  bookingResources = {
    driver: true,
    gps: false,
    ac: true,
    bluetooth: false,
    babySeat: false
  };
  bookingSubmitted = false;
  
  resourcePrices = {
    driver: 10,
    gps: 5,
    ac: 8,
    bluetooth: 3,
    babySeat: 50
  };

  // Current authenticated user
  currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private reviewService: ReviewService,
    private authService: AuthService,
    private bookingService: BookingService,
    private mapsService: MapsService,
    private fileUploadService: FileUploadService
  ) {
    // Get the current user from the auth service
    this.currentUser = this.authService.currentUserValue;
    console.log('Current user:', this.currentUser);
  }

  ngOnInit(): void {
    // Get the car ID from the route parameters
    this.route.paramMap.subscribe(params => {
      const carId = params.get('id');
      if (carId) {
        this.fetchCarDetails(carId);
      }
    });
    
    // Initialize Google Maps using our service
    this.mapsService.getMapsLoadedObservable().subscribe(loaded => {
      if (loaded) {
        this.googleMapsLoaded = true;
        this.initAutocomplete();
      }
    });
  }

  ngAfterViewInit() {
    // Load Google Maps API if it's not already loaded
    this.loadGoogleMapsScript();
  }

  loadGoogleMapsScript() {
    if ((window as any).google && (window as any).google.maps) {
      this.googleMapsLoaded = true;
      this.initAutocomplete();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    (window as any).initGoogleMaps = () => {
      this.googleMapsLoaded = true;
      setTimeout(() => {
        this.initAutocomplete();
      }, 500);
    };
    
    document.head.appendChild(script);
  }

  initAutocomplete() {
    if (!this.googleMapsLoaded) return;
    
    try {
      // Initialize pickup autocomplete
      if (this.pickupInputRef && this.pickupInputRef.nativeElement) {
        this.pickupAutocomplete = new (window as any).google.maps.places.Autocomplete(
          this.pickupInputRef.nativeElement,
          { types: ['geocode'] }
        );
        
        this.pickupAutocomplete.addListener('place_changed', () => {
          const place = this.pickupAutocomplete.getPlace();
          if (!place.geometry) return;
          
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address
          };
          
          this.onLocationSelect(location, 'pickup');
        });
      }
      
      // Initialize dropoff autocomplete
      if (this.dropoffInputRef && this.dropoffInputRef.nativeElement) {
        this.dropoffAutocomplete = new (window as any).google.maps.places.Autocomplete(
          this.dropoffInputRef.nativeElement,
          { types: ['geocode'] }
        );
        
        this.dropoffAutocomplete.addListener('place_changed', () => {
          const place = this.dropoffAutocomplete.getPlace();
          if (!place.geometry) return;
          
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address
          };
          
          this.onLocationSelect(location, 'dropoff');
        });
      }
      
      console.log('Autocomplete initialized successfully');
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  }

  fetchCarDetails(carId: string): void {
    this.loading = true;
    
    // Use the correct API URL format
    // The backend API is at /api/cars/:id without the /api prefix in the base URL
    let url = `${this.apiUrl}/cars/${carId}`;
    console.log('Fetching car details from:', url);
    
    this.http.get(url)
      .subscribe({
        next: (response: any) => {
          console.log('Car details response:', response);
          
          // Handle different response structures
          if (response && response.data && response.data.car) {
            // API returns { status, data: { car } } structure
            this.car = response.data.car;
          } else if (response && response.car) {
            // API returns { car } structure
            this.car = response.car;
          } else if (response && !response.status) {
            // API returns car object directly
            this.car = response;
          } else {
            console.error('Unexpected API response structure:', response);
            this.car = null;
          }
          
          // Always fetch reviews after getting car details
          if (this.car) {
            this.fetchCarReviews(this.car._id || this.car.id);
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching car details with ID:', error);
          
          // If the car wasn't found with the provided ID, it might be because
          // we're using the frontend 'id' but the backend expects MongoDB '_id'
          // Let's try fetching cars and finding the one with matching 'id'
          this.fetchAllCarsAndFindById(carId);
        }
      });
  }
  
  fetchAllCarsAndFindById(carId: string): void {
    console.log('Trying to find car by fetching all cars and matching ID:', carId);
    
    this.http.get(`${this.apiUrl}/cars`)
      .subscribe({
        next: (response: any) => {
          console.log('All cars response:', response);
          
          let cars = [];
          
          // Extract cars array from the response based on its structure
          if (response && response.data && response.data.cars) {
            cars = response.data.cars;
          } else if (response && response.cars) {
            cars = response.cars;
          } else if (Array.isArray(response)) {
            cars = response;
          }
          
          // Find the car with matching id or _id
          const foundCar = cars.find((car: any) => 
            car.id === carId || car._id === carId
          );
          
          if (foundCar) {
            console.log('Found car by ID in all cars:', foundCar);
            this.car = foundCar;
            
            // Fetch reviews for this car
            this.fetchCarReviews(carId);
          } else {
            console.error('Car not found in any of the cars');
            this.car = null;
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching all cars:', error);
          console.log('Status:', error.status, 'Message:', error.message);
          this.loading = false;
        }
      });
  }

  // Image slider navigation methods
  nextImage(): void {
    const maxIndex = this.getMaxImageIndex();
    if (this.currentImageIndex < maxIndex) {
      this.currentImageIndex++;
    }
  }

  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  setCurrentImage(index: number): void {
    this.currentImageIndex = index;
  }

  getMaxImageIndex(): number {
    if (this.car?.photos?.length > 0) {
      return this.car.photos.length - 1;
    } else if (this.car?.images?.length > 0) {
      return this.car.images.length - 1;
    }
    return 0;
  }

  handleImageError(index: number): void {
    console.log(`Error loading image at index ${index}`);
    if (!this.thumbnailError[index]) {
      this.thumbnailError[index] = true;
    }
    
    // Check if all images have errors
    const photos = this.car?.photos || [];
    const images = this.car?.images || [];
    const totalImages = photos.length > 0 ? photos.length : images.length;
    
    let errorCount = 0;
    for (let i = 0; i < totalImages; i++) {
      if (this.thumbnailError[i]) {
        errorCount++;
      }
    }
    
    if (errorCount === totalImages) {
      this.allImagesError = true;
    }
  }
  
  /**
   * Get the proper URL for a user profile image
   * @param imagePath The path or filename of the profile image
   * @returns The full URL to the profile image
   */
  getProfileImageUrl(imagePath: string): string {
    return this.fileUploadService.getUserProfileImageUrl(imagePath);
  }
  
  handleReviewerImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iI2RkZCIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjEwMCIgcj0iNjAiIGZpbGw9IiNhYWEiLz48cGF0aCBkPSJNMjEzLjIsMjEzLjJjMC01My0zOC4zLTg1LjMtODUuMy04NS4zcy04NS4zLDMyLjMtODUuMyw4NS4zIiBmaWxsPSIjYWFhIi8+PC9zdmc+'; // Default avatar SVG
  }

  fetchCarReviews(carId: string): void {
    console.log('Fetching reviews for car:', carId);
    
    // Use the correct URL format for the API
    // The backend API is at /api/reviews/car/:carId
    const url = `${this.apiUrl}/reviews/car/${carId}`;
    
    console.log('Fetching reviews from:', url);
    
    this.http.get(url)
      .subscribe({
        next: (response: any) => {
          console.log('Reviews response:', response);
          
          // Handle different response structures
          let reviews = [];
          
          if (response && response.data && response.data.reviews) {
            reviews = response.data.reviews;
          } else if (response && response.reviews) {
            reviews = response.reviews;
          } else if (Array.isArray(response)) {
            reviews = response;
          }
          
          // Assign reviews to the car object
          this.car.reviews = reviews;
          
          // Update the review count
          this.car.numberOfReviews = reviews.length;
          
          console.log('Car reviews updated:', this.car.reviews);
        },
        error: (error) => {
          console.error('Error fetching reviews:', error);
          // Initialize empty reviews array if error
          this.car.reviews = [];
          this.car.numberOfReviews = 0;
        }
      });
  }
  
  // Review form methods
  setRating(rating: number): void {
    this.newReview.rating = rating;
  }
  
  submitReview(): void {
    // Validate review data
    if (!this.newReview.rating || !this.newReview.comment) {
      return;
    }
    
    // Check if user is authenticated
    if (!this.currentUser) {
      alert('Please log in to submit a review');
      return;
    }
    
    // Prepare the review data
    const reviewData = {
      userId: this.currentUser.id,
      userName: this.currentUser.name || `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      userImage: this.currentUser.profileImage || null,
      carId: this.car._id || this.car.id,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    };
    
    console.log('Submitting review with user:', this.currentUser.name || `${this.currentUser.firstName} ${this.currentUser.lastName}`); 
    console.log('User profile image:', this.currentUser.profileImage);
    
    console.log('Submitting review:', reviewData);
    
    // Send the review directly to the backend API
    // The backend API is at /api/reviews
    const url = `${this.apiUrl}/reviews`;
    console.log('Posting review to:', url);
    
    this.http.post(url, reviewData)
      .subscribe({
        next: (response: any) => {
          console.log('Review submitted successfully:', response);
          
          // Extract the review from the response
          let review;
          if (response && response.data && response.data.review) {
            review = response.data.review;
          } else if (response && response.review) {
            review = response.review;
          } else {
            review = response;
          }
          
          // Add the new review to the car's reviews array
          // Initialize reviews array if it doesn't exist
          if (!this.car.reviews) {
            this.car.reviews = [];
          }
          
          // Add the new review to the beginning of the array
          this.car.reviews.unshift(review);
          
          // Update the review count
          this.car.numberOfReviews = this.car.reviews.length;
          
          // Show success message
          this.reviewSubmitted = true;
          
          // Reset the form
          this.resetReviewForm();
          
          // Refresh reviews from the server to ensure we have the latest data
          setTimeout(() => {
            this.fetchCarReviews(this.car._id || this.car.id);
          }, 1000);
        },
        error: (error) => {
          console.error('Error submitting review:', error);
          
          // For demo purposes, we'll still add the review to the UI
          // even if the API call fails
          const newReview = {
            id: new Date().getTime().toString(),
            userId: this.currentUser?.id || 'guest-user',
            userName: this.currentUser ? (this.currentUser.name || `${this.currentUser.firstName} ${this.currentUser.lastName}`) : 'Guest User',
            userImage: this.currentUser?.profileImage || null,
            carId: this.car._id || this.car.id,
            rating: this.newReview.rating,
            comment: this.newReview.comment,
            date: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Initialize reviews array if it doesn't exist
          if (!this.car.reviews) {
            this.car.reviews = [];
          }
          
          // Add the new review to the beginning of the array
          this.car.reviews.unshift(newReview as any);
          
          // Update the review count
          this.car.numberOfReviews = this.car.reviews.length;
          
          // Show success message
          this.reviewSubmitted = true;
          
          // Reset the form
          this.resetReviewForm();
        }
      });
  }
  
  resetReviewForm(): void {
    this.newReview = {
      rating: 0,
      comment: ''
    };
    this.reviewSubmitted = false;
  }
  
  // Booking form methods
  toggleResource(resource: string): void {
    // Toggle the resource selection
    this.bookingResources[resource as keyof typeof this.bookingResources] = 
      !this.bookingResources[resource as keyof typeof this.bookingResources];
    
    console.log(`Resource ${resource} toggled:`, this.bookingResources[resource as keyof typeof this.bookingResources]);
    console.log('Updated resources:', this.bookingResources);
    console.log('Extras price:', this.calculateExtrasPrice());
    console.log('Total price:', this.calculateTotalPrice());
  }
  
  calculateExtrasPrice(): number {
    // Calculate just the extras price without the car's base price
    let extrasPrice = 0;
    
    // Add prices for selected resources
    for (const [resource, selected] of Object.entries(this.bookingResources)) {
      if (selected) {
        extrasPrice += this.resourcePrices[resource as keyof typeof this.resourcePrices];
      }
    }
    
    return extrasPrice;
  }
  
  calculateTotalPrice(): number {
    // Base price is the car's price per day
    const basePrice = this.car?.pricePerDay || 0;
    
    // Add the extras price
    const dailyRate = basePrice + this.calculateExtrasPrice();
    
    // Calculate the number of days between pickup and dropoff dates
    const days = this.calculateNumberOfDays();
    
    // Multiply the daily rate by the number of days
    const totalPrice = dailyRate * days;
    
    console.log(`Total price calculation: ${dailyRate} per day × ${days} days = ${totalPrice}`);
    
    return totalPrice;
  }
  
  calculateNumberOfDays(): number {
    if (!this.bookingData.pickupDate || !this.bookingData.dropoffDate) {
      return 1; // Default to 1 day if dates are not set
    }
    
    const pickupDate = new Date(this.bookingData.pickupDate);
    const dropoffDate = new Date(this.bookingData.dropoffDate);
    
    // Calculate the time difference in milliseconds
    const timeDiff = Math.abs(dropoffDate.getTime() - pickupDate.getTime());
    
    // Convert to days and round up to the nearest day
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Ensure at least 1 day
    return Math.max(1, days);
  }
  
  // Location picker properties
  showLocationPicker = false;
  selectedLocation: { lat: number; lng: number } | null = null;
  activeLocationField: 'pickup' | 'dropoff' | null = null;
  
  @ViewChild('pickupInput') pickupInputRef!: ElementRef;
  @ViewChild('dropoffInput') dropoffInputRef!: ElementRef;
  
  pickupAutocomplete: any = null;
  dropoffAutocomplete: any = null;
  googleMapsLoaded = false;
  googleMapsApiKey = 'AIzaSyD5lofcHqSpw1BEmfwdZ0X2NQfNHQc4b4o';
  
  // Booking form submission
  bookingData = {
    pickupLocation: {
      address: '',
      coordinates: { lat: 0, lng: 0 }
    },
    dropoffLocation: {
      address: '',
      coordinates: { lat: 0, lng: 0 }
    },
    pickupDate: null as Date | null,
    dropoffDate: null as Date | null,
    resources: this.bookingResources
  };
  
  submitBooking(): void {
    // Validate booking data
    if (!this.bookingData.pickupLocation.address || !this.bookingData.dropoffLocation.address || !this.bookingData.pickupDate || !this.bookingData.dropoffDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate pickup location coordinates are valid
    if (this.bookingData.pickupLocation.coordinates.lat === 0 && this.bookingData.pickupLocation.coordinates.lng === 0) {
      alert('Please select a pickup location on the map');
      this.toggleLocationPicker('pickup');
      return;
    }
    
    // Validate dropoff location coordinates are valid
    if (this.bookingData.dropoffLocation.coordinates.lat === 0 && this.bookingData.dropoffLocation.coordinates.lng === 0) {
      alert('Please select a drop-off location on the map');
      this.toggleLocationPicker('dropoff');
      return;
    }
    
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      alert('Please log in to make a booking');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    // Get current user ID
    const userId = this.authService.currentUserValue?.id || localStorage.getItem('userId');
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    // Parse dates to ensure they're in the correct format
    const startDate = new Date(this.bookingData.pickupDate);
    const endDate = new Date(this.bookingData.dropoffDate);

    // Create booking object
    const bookingData: Partial<Booking> = {
      vehicleId: this.car._id || this.car.id,
      userId: userId,
      pickupLocation: this.bookingData.pickupLocation,
      dropoffLocation: this.bookingData.dropoffLocation,
      startDate: startDate,
      endDate: endDate,
      pickupCoordinates: {
        lat: this.bookingData.pickupLocation.coordinates.lat,
        lng: this.bookingData.pickupLocation.coordinates.lng
      },
      dropoffCoordinates: {
        lat: this.bookingData.dropoffLocation.coordinates.lat,
        lng: this.bookingData.dropoffLocation.coordinates.lng
      },
      extras: {
        driver: this.bookingResources.driver,
        gps: this.bookingResources.gps,
        airConditioning: this.bookingResources.ac,
        bluetooth: this.bookingResources.bluetooth,
        babySeat: this.bookingResources.babySeat
      },
      totalAmount: this.calculateTotalPrice(),
      status: 'pending',
      paymentStatus: 'pending'
    };
    
    console.log('Submitting booking:', bookingData);
    
    // Show loading state
    this.isBookingLoading = true;
    
    // Send the booking to the backend API
    this.bookingService.createBooking(bookingData as any).subscribe({
      next: (response) => {
        console.log('Booking created successfully:', response);
        this.bookingSubmitted = true;
        this.isBookingLoading = false;
        
        // Reset form after 3 seconds
        setTimeout(() => {
          this.resetBookingForm();
          // Optionally redirect to bookings page
          // this.router.navigate(['/bookings']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        alert('There was an error creating your booking. Please try again.');
        this.isBookingLoading = false;
      }
    });
  }
  
  resetBookingForm(): void {
    this.bookingData = {
      pickupLocation: {
        address: '',
        coordinates: { lat: 0, lng: 0 }
      },
      dropoffLocation: {
        address: '',
        coordinates: { lat: 0, lng: 0 }
      },
      pickupDate: null,
      dropoffDate: null,
      resources: this.bookingResources
    };
    this.bookingSubmitted = false;
    this.selectedLocation = null;
    this.showLocationPicker = false;
    this.activeLocationField = null;
  }
  
  // Location picker methods
  toggleLocationPicker(fieldType: 'pickup' | 'dropoff' | null = null): void {
    if (fieldType) {
      this.activeLocationField = fieldType;
      this.showLocationPicker = true;
    } else {
      this.showLocationPicker = !this.showLocationPicker;
      if (!this.showLocationPicker) {
        this.activeLocationField = null;
      }
    }
  }
  
  onLocationSelect(location: { lat: number; lng: number; address: string }, fieldType: 'pickup' | 'dropoff'): void {
    console.log(`${fieldType} location selected:`, location);
    
    if (fieldType === 'pickup') {
      // Store the coordinates in the format expected by MongoDB
      this.bookingData.pickupLocation = {
        address: location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        }
      };
    } else if (fieldType === 'dropoff') {
      // Store the coordinates in the format expected by MongoDB
      this.bookingData.dropoffLocation = {
        address: location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        }
      };
    }
    
    // Hide the map after selection
    this.toggleLocationPicker(null);
  }

  // Helper method to get image URL without /api in the path
  getImageUrl(car: any, photoPath?: string): string {
    if (!car) {
      return apiUrls.fallbackImageUrl;
    }
    
    // If specific photo is provided, use it
    if (photoPath) {
      if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
        return photoPath;
      }
      return this.fileUploadService.getCarImageUrl(photoPath);
    }
    
    // Try photos array first
    if (car.photos && car.photos.length > 0) {
      const photo = car.photos[0];
      if (photo) {
        if (photo.startsWith('http://') || photo.startsWith('https://')) {
          return photo;
        }
        return this.fileUploadService.getCarImageUrl(photo);
      }
    }
    
    // Then try images array
    if (car.images && car.images.length > 0) {
      const image = car.images[0];
      if (image) {
        if (image.startsWith('http://') || image.startsWith('https://')) {
          return image;
        }
        return this.fileUploadService.getCarImageUrl(image);
      }
    }
    
    // If car has a directory name but no photos, try to use that
    if (car.carDirName) {
      return this.fileUploadService.getCarImageUrl(`${car.carDirName}/photo-default.jpg`);
    }
    
    // If car has an ID, use it directly
    if (car._id || car.id) {
      const carId = car._id || car.id;
      const baseUrl = environment.apiUrl.split('/api')[0];
      return `${baseUrl}/uploads/${carId}.jpg`;
    }
    
    // Last resort: use a known image from the uploads directory
    return apiUrls.fallbackImageUrl;
  }
}



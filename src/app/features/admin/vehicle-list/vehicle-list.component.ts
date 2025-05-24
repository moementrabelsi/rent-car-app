import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Car } from '../../../core/models/car.model';
import { VehicleService } from '../../../core/services/vehicle.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEdit, faTrash, faSort, faSortUp, faSortDown, faSyncAlt, faSearch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule]
})
export class VehicleListComponent implements OnInit {
  // Icon properties
  faEye = faEye;
  faEdit = faEdit;
  faTrash = faTrash;
  faSort = faSort;
  faSortUp = faSortUp;
  faSortDown = faSortDown;
  faSyncAlt = faSyncAlt;
  faSearch = faSearch;
  faExclamationTriangle = faExclamationTriangle;

  // Data properties
  vehicles: Car[] = [];
  filteredVehicles: Car[] = [];
  searchTerm = '';
  searchQuery = ''; // Adding to fix template binding
  sortField = 'name'; // Updated to use name field from database
  sortReverse = false;
  categoryFilter = 'All Categories';
  stockFilter = 'All Stock';
  availabilityFilter = ''; // Adding to fix template binding
  selectedImageIndex = 0;
  selectedVehicle: Car | null = null;
  showDetailsModal = false;
  vehicleToDelete: Car | null = null;
  showDeleteConfirmation = false;
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // UI state properties
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // Photo navigation properties
  currentPhotoIndices: { [vehicleId: string]: number } = {};

  constructor(private vehicleService: VehicleService, private fileUploadService: FileUploadService) { }

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading = true;
    this.errorMessage = null;

    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        this.filterVehicles();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = `Failed to load vehicles: ${error.message}`;
        this.loading = false;
      }
    });
  }

  filterVehicles(): void {
    let result = this.vehicles;

    // Apply search filter
    if (this.searchTerm || this.searchQuery) {
      const searchTermLower = (this.searchTerm || this.searchQuery).toLowerCase();
      result = result.filter(vehicle =>
        vehicle.name?.toLowerCase().includes(searchTermLower) ||
        vehicle.brand?.toLowerCase().includes(searchTermLower) ||
        vehicle.model?.toLowerCase().includes(searchTermLower) ||
        vehicle.category?.toLowerCase().includes(searchTermLower)
      );
    }

    // Apply category filter
    if (this.categoryFilter !== 'All Categories') {
      result = result.filter(vehicle => vehicle.category === this.categoryFilter.toLowerCase());
    }

    // Apply stock filter
    if (this.stockFilter !== 'All Stock') {
      if (this.stockFilter === 'In Stock') {
        result = result.filter(vehicle => vehicle.stock !== undefined && vehicle.stock > 0);
      } else if (this.stockFilter === 'Out of Stock') {
        result = result.filter(vehicle => vehicle.stock !== undefined && vehicle.stock === 0);
      } else if (this.stockFilter === 'Low Stock') {
        result = result.filter(vehicle => vehicle.stock !== undefined && vehicle.stock > 0 && vehicle.stock <= 2);
      }
    }

    // Apply sorting
    result = this.sortVehicles(result, this.sortField, this.sortReverse);

    // Update filtered vehicles and pagination
    this.filteredVehicles = result;
    this.totalPages = Math.ceil(this.filteredVehicles.length / this.itemsPerPage);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  sortVehicles(vehicles: Car[], field: string, reverse: boolean): Car[] {
    return [...vehicles].sort((a, b) => {
      // Get values safely
      const valueA = a[field as keyof Car];
      const valueB = b[field as keyof Car];

      // Handle undefined or null values
      if (valueA === undefined && valueB === undefined) return 0;
      if (valueA === undefined) return reverse ? 1 : -1;
      if (valueB === undefined) return reverse ? -1 : 1;
      
      // Compare based on types
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const strA = valueA.toLowerCase();
        const strB = valueB.toLowerCase();
        return reverse 
          ? strB.localeCompare(strA)
          : strA.localeCompare(strB);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return reverse 
          ? valueB - valueA 
          : valueA - valueB;
      } else if (valueA instanceof Date && valueB instanceof Date) {
        return reverse 
          ? valueB.getTime() - valueA.getTime() 
          : valueA.getTime() - valueB.getTime();
      } else {
        // For other types, convert to string and compare
        const strA = String(valueA);
        const strB = String(valueB);
        return reverse 
          ? strB.localeCompare(strA)
          : strA.localeCompare(strB);
      }
    });
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortReverse = !this.sortReverse;
    } else {
      this.sortField = field;
      this.sortReverse = false;
    }
    this.filterVehicles();
  }

  viewVehicleDetails(vehicle: Car): void {
    this.selectedVehicle = vehicle;
    this.selectedImageIndex = 0;
    
    // Get a valid ID (use either _id or id)
    const vehicleId = vehicle._id || vehicle.id;
    
    // Initialize the current photo index for this vehicle if it doesn't exist
    if (vehicleId && !this.currentPhotoIndices[vehicleId]) {
      this.currentPhotoIndices[vehicleId] = 0;
    }
    
    this.showDetailsModal = true;
    
    // Ensure the vehicle has a photos array
    if (!vehicle.photos || !Array.isArray(vehicle.photos)) {
      vehicle.photos = [];
      // Try to generate photo URLs based on vehicle ID
      if (vehicleId) {
        // Add at least 3 potential photos to check
        for (let i = 0; i < 3; i++) {
          vehicle.photos.push(`${vehicleId}_${i}.jpg`);
        }
      }
    }
  }
  
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.error(`Failed to load image: ${imgElement.src}`);
    
    // Try to load a direct image from uploads folder
    const fallbackImage = 'http://localhost:5000/uploads/1747396263436_2855267.jpg';
    console.log(`Using fallback image from uploads: ${fallbackImage}`);
    imgElement.src = fallbackImage;
    
    // Don't hide the image
    imgElement.style.display = 'block';
    imgElement.classList.add('placeholder-image');
  }

  /**
   * Navigate to the next or previous photo for the selected vehicle
   */
  navigatePhoto(direction: 'next' | 'prev', event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent the event from bubbling up
    }
    
    if (!this.selectedVehicle) return;
    
    // Get the vehicle ID to use as a key (use id if _id is not available)
    const vehicleId = this.selectedVehicle._id || this.selectedVehicle.id;
    if (!vehicleId) return; // Exit if we don't have any ID
    
    // Ensure photos array exists
    if (!this.selectedVehicle.photos) {
      this.selectedVehicle.photos = [];
    }
    
    // If no photos and vehicle has ID, create potential photo paths
    if (this.selectedVehicle.photos.length === 0) {
      for (let i = 0; i < 3; i++) {
        this.selectedVehicle.photos.push(`${vehicleId}_${i}.jpg`);
      }
    }
    
    // Get the total number of photos for this vehicle
    const totalPhotos = this.selectedVehicle.photos.length || 1;
    if (totalPhotos <= 1) return; // No need to navigate if there's only one photo
    
    // Get the current index
    const currentIndex = this.currentPhotoIndices[vehicleId] || 0;
    
    // Calculate the new index
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % totalPhotos;
    } else {
      newIndex = (currentIndex - 1 + totalPhotos) % totalPhotos;
    }
    
    // Update both indices
    this.currentPhotoIndices[vehicleId] = newIndex;
    this.selectedImageIndex = newIndex;
    
    console.log(`Navigated to photo ${newIndex + 1}/${totalPhotos} for vehicle ${this.selectedVehicle.name}`);
  }
  
  selectImage(index: number): void {
    this.selectedImageIndex = index;
    
    // Also update the current photo index for the selected vehicle
    if (this.selectedVehicle) {
      const vehicleId = this.selectedVehicle._id || this.selectedVehicle.id;
      if (vehicleId) {
        this.currentPhotoIndices[vehicleId] = index;
      }
    }
  }

  closeVehicleDetails(): void {
    this.selectedVehicle = null;
    this.showDetailsModal = false;
  }
  deleteVehicle(vehicle: Car): void {
    this.vehicleToDelete = vehicle;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.vehicleToDelete = null;
    this.showDeleteConfirmation = false;
  }

  confirmDelete(): void {
    if (!this.vehicleToDelete) return;

    // Use MongoDB _id instead of id
    const vehicleId = this.vehicleToDelete._id || '';
    if (!vehicleId) {
      this.errorMessage = 'Invalid vehicle ID';
      this.showDeleteConfirmation = false;
      this.vehicleToDelete = null;
      return;
    }
    this.loading = true;

    this.vehicleService.deleteVehicle(vehicleId).subscribe({
      next: (success) => {
        if (success) {
          this.vehicles = this.vehicles.filter(v => v._id !== vehicleId);
          this.filterVehicles();
          this.successMessage = 'Vehicle deleted successfully!';
          
          // Clear success message after a delay
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        }
        this.loading = false;
        this.showDeleteConfirmation = false;
        this.vehicleToDelete = null;
      },
      error: (error) => {
        this.errorMessage = `Failed to delete vehicle: ${error.message}`;
        this.loading = false;
        this.showDeleteConfirmation = false;
        this.vehicleToDelete = null;
      }
    });
  }

  /**
   * Get the proper URL for a car image
   * @param car The car object containing photos information
   * @returns The full URL to the car image directly from backend uploads
   */
  /**
   * Get the image URL for a specific vehicle and photo index
   */
  getImageUrl(car: Car, index?: number): string {
    if (!car) {
      return 'http://localhost:5000/uploads/1747396263436_2855267.jpg';
    }
    
    // Get a valid vehicle ID, using either _id or id
    const vehicleId = car._id || car.id;
    
    // If index is provided, use it (for photo gallery)
    // Otherwise use the stored index for this vehicle or default to 0
    const photoIndex = index !== undefined ? index : 
                      (vehicleId && this.currentPhotoIndices[vehicleId]) || 0;
    
    // Try to get photos array
    const photos = car.photos || car.images || [];
    
    // If photos exist, use the specified index
    if (photos.length > 0) {
      // Make sure the index is valid
      const validIndex = Math.min(photoIndex, photos.length - 1);
      const photoPath = photos[validIndex];
      
      // Check if it's already a full URL (starts with http or https)
      if (photoPath && (photoPath.startsWith('http://') || photoPath.startsWith('https://'))) {
        return photoPath;
      }
      
      // If we have a photo path, use the FileUploadService to get the proper URL
      if (photoPath) {
        return this.fileUploadService.getCarImageUrl(photoPath);
      }
    }
    
    // If car has a directory name but no photos, try to use that
    if (car.carDirName) {
      return this.fileUploadService.getCarImageUrl(`${car.carDirName}/photo-default.jpg`);
    }
    
    // If car has an ID, use that directly in the URL with the correct index
    if (vehicleId) {
      const baseUrl = environment.apiUrl.split('/api')[0];
      return `${baseUrl}/uploads/${vehicleId}_${photoIndex}.jpg`;
    }
    
    // Last resort fallback to a known image in the uploads folder
    console.log('Car photo fallback to known image for car:', vehicleId || 'unknown');
    return 'http://localhost:5000/uploads/1747396263436_2855267.jpg';
  }
}

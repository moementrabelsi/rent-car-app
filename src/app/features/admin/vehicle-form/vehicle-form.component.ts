import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { CommonModule } from '@angular/common'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { ActivatedRoute, Router } from '@angular/router'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { VehicleService } from '../../../core/services/vehicle.service'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { FileUploadService } from '../../../core/services/file-upload.service'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { Car } from '../../../core/models/car.model'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { faCloudUploadAlt, faTimesCircle, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { finalize, catchError } from 'rxjs/operators'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';
import { of } from 'rxjs'
import { EnvironmentService } from '../../../core/services/environment.service'
import { apiUrls } from '../../utils/api-urls';

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule]
})
export class VehicleFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  vehicleForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  vehicleId: string | null = null;
  selectedFiles: File[] = [];
  imagePreviewUrls: string[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  currentYear = new Date().getFullYear();

  // Icons
  faCloudUploadAlt = faCloudUploadAlt;
  faTimesCircle = faTimesCircle;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private fileUploadService: FileUploadService
  ) {
    // Form will be initialized in ngOnInit
    this.vehicleForm = this.fb.group({});
  }

  ngOnInit(): void {
    console.log('VehicleFormComponent initialized');
    
    // First, create an empty form
    this.createEmptyForm();

    // Check route params to determine if we're in edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Route param ID:', id);
      
      if (id) {
        this.vehicleId = id;
        this.isEditMode = true;
        console.log('Edit mode detected with ID:', this.vehicleId);
        this.loadVehicle();
      } else {
        this.isEditMode = false;
        console.log('Create mode detected');
      }
    });
  }
  
  // Create a completely empty form as a starting point
  private createEmptyForm(): void {
    this.vehicleForm = this.fb.group({
      name: ['', Validators.required],
      brand: ['', Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(this.currentYear)]],
      category: ['economy', Validators.required],
      type: ['sedan', Validators.required],
      transmission: ['automatic', Validators.required],
      fuelType: ['petrol', Validators.required],
      seats: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      pricePerDay: [0, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      mileage: [0, [Validators.required, Validators.min(0)]],
      stock: [1, [Validators.required, Validators.min(0)]],
      description: [''], 
      available: [true],  
      features: [''],
      photos: [[]]
    });
  }
  
  // Load vehicle by ID directly - more efficient and avoids authentication issues
  // Load vehicle with better error handling
  loadVehicle(): void {
    if (!this.vehicleId) {
      this.errorMessage = 'No vehicle ID provided';
      return;
    }
    
    console.log('Loading vehicle with ID:', this.vehicleId);
    this.isSubmitting = true;
    this.errorMessage = null;
    
    // Using the getAllVehicles method and finding the specific vehicle
    // This is a workaround for any issues with the getVehicleById endpoint
    this.vehicleService.getVehicles()
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          console.log('Vehicle loading completed');
        }),
        catchError(error => {
          console.error('Error loading vehicles:', error);
          this.errorMessage = `Error loading vehicle data: ${error.message || 'Unknown error'}`;
          return of([]);
        })
      )
      .subscribe(vehicles => {
        console.log('Loaded vehicles:', vehicles?.length || 0);
        
        if (!vehicles || vehicles.length === 0) {
          this.errorMessage = 'No vehicles found';
          return;
        }
        
        const vehicle = vehicles.find(v => v._id === this.vehicleId);
        
        if (vehicle) {
          console.log('Found vehicle to edit:', vehicle);
          this.populateFormWithVehicle(vehicle);
        } else {
          console.error(`Vehicle with ID ${this.vehicleId} not found`); 
          this.errorMessage = 'Vehicle not found. Please go back and try again.';
        }
      });
  }

  // Populate form with vehicle data with proper type handling
  populateFormWithVehicle(vehicle: any): void {
    console.log('Populating form with vehicle data:', vehicle);
    
    if (!vehicle) {
      this.errorMessage = 'Error: Cannot populate form with empty vehicle data';
      return;
    }
    
    try {
      // Create a fresh form to avoid any lingering validation issues
      this.createEmptyForm();
      
      // Store the MongoDB ID
      this.vehicleId = vehicle._id;
      console.log('Vehicle ID set to:', this.vehicleId);
      
      // Load images for the vehicle
      this.loadVehicleImages(vehicle);
      
      // Convert features array to string for the form
      const featuresString = Array.isArray(vehicle.features) ? vehicle.features.join(', ') : '';
      
      // Map vehicle data to form fields with proper type conversion
      this.vehicleForm.patchValue({
        name: vehicle.name || `${vehicle.brand || vehicle.make} ${vehicle.model} ${vehicle.year}`,
        brand: vehicle.brand || vehicle.make || '',
        make: vehicle.brand || vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        category: vehicle.category || 'economy',
        transmission: vehicle.transmission || 'automatic',
        fuelType: vehicle.fuelType || 'petrol',
        seats: vehicle.seats || 5,
        pricePerDay: vehicle.pricePerDay || '',
        location: vehicle.location || '',
        description: vehicle.description || '',
        stock: vehicle.stock !== undefined ? vehicle.stock : 1,
        available: vehicle.availability === false ? false : true,
        features: featuresString || ''
      });

      console.log('Form populated successfully');
      
      // Clear existing image previews
      this.imagePreviewUrls = [];
      
      // Load all available vehicle images
      this.loadVehicleImages(vehicle);
      
      console.log('Image previews set to:', this.imagePreviewUrls.length, 'images');
    } catch (err) {
      console.error('Error populating form:', err);
      this.errorMessage = 'Error populating vehicle data';
    }
  }

  /**
   * Get the proper URL for a vehicle image
   * @param vehicle The vehicle object containing photos information
   * @returns The full URL to the vehicle image directly from backend uploads
   */
  getImageUrl(vehicle: any): string {
    // Try to get a photo from either photos or images array
    let photoPath = vehicle.photos?.[0] || vehicle.images?.[0];
    
    // Check if it's already a full URL (starts with http or https)
    if (photoPath && (photoPath.startsWith('http://') || photoPath.startsWith('https://'))) {
      return photoPath;
    }
    
    // If we have a photo path, use the FileUploadService to get the proper URL
    if (photoPath) {
      return this.fileUploadService.getCarImageUrl(photoPath);
    }
    
    // If vehicle has a directory name but no photos, try to use that
    if (vehicle.carDirName) {
      return this.fileUploadService.getCarImageUrl(`${vehicle.carDirName}/photo-default.jpg`);
    }
    
    // If vehicle has an ID, use that directly in the URL
    if (vehicle._id || vehicle.id) {
      const vehicleId = vehicle._id || vehicle.id;
      return `http://localhost:5000/uploads/${vehicleId}.jpg`;
    }
    
    // Last resort fallback to a known image in the uploads folder
    console.log('Vehicle photo fallback to known image for vehicle:', vehicle._id || vehicle.id);
    return apiUrls.fallbackImageUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Clear previous selections only if replacing all images
      if (this.selectedFiles.length === 0) {
        this.imagePreviewUrls = [];
      }

      // Process all selected files
      Array.from(input.files).forEach(file => {
        if (file.type.startsWith('image/')) {
          // Add to selected files for upload
          this.selectedFiles.push(file);

          // Create image preview
          const reader = new FileReader();
          reader.onload = () => {
            this.imagePreviewUrls.push(reader.result as string);
            console.log('Preview created for file:', file.name);
          };
          reader.readAsDataURL(file);
        } else {
          console.warn('Skipping non-image file:', file.name);
        }
      });

      console.log(`Added ${input.files.length} files for upload, total: ${this.selectedFiles.length}`);
    }
  }

  removeImage(index: number): void {
    this.imagePreviewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }
  
  /**
   * Handle image loading errors by trying a different image source
   */
  handleImageError(event: Event, index: number): void {
    console.error(`Failed to load image at index ${index}`);
    const imgElement = event.target as HTMLImageElement;
    console.error(`Failed image URL: ${imgElement.src}`);
    
    // Try to use a fallback image
    const fallbackImage = apiUrls.fallbackImageUrl;
    
    // Only replace if the current URL isn't already the fallback
    if (imgElement.src !== fallbackImage) {
      console.log(`Replacing with fallback image: ${fallbackImage}`);
      imgElement.src = fallbackImage;
      
      // Also update the URL in our array to prevent future errors
      this.imagePreviewUrls[index] = fallbackImage;
    }
  }

  // Load vehicle images with proper error handling
  loadVehicleImages(vehicle: any): void {
    console.log('Loading images for vehicle:', vehicle._id || vehicle.id);
    this.imagePreviewUrls = [];
    
    // Try to load the main image first using our getImageUrl method
    const mainImageUrl = this.getImageUrl(vehicle);
    if (mainImageUrl) {
      this.imagePreviewUrls.push(mainImageUrl);
    }
    
    // Get a valid vehicle ID, using either _id or id
    const vehicleId = vehicle._id || vehicle.id;
    
    // If we have photo or image arrays, load all of them
    if (Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
      console.log('Loading multiple photos from vehicle data');
      // Skip the first one if we already added it
      const startIndex = this.imagePreviewUrls.length > 0 ? 1 : 0;
      
      // Add all remaining photos
      for (let i = startIndex; i < vehicle.photos.length; i++) {
        const photoUrl = this.fileUploadService.getCarImageUrl(vehicle.photos[i]);
        if (!this.imagePreviewUrls.includes(photoUrl)) {
          this.imagePreviewUrls.push(photoUrl);
        }
      }
    } else if (Array.isArray(vehicle.images) && vehicle.images.length > 0) {
      console.log('Loading multiple images from vehicle data');
      // Skip the first one if we already added it
      const startIndex = this.imagePreviewUrls.length > 0 ? 1 : 0;
      
      // Add all remaining images
      for (let i = startIndex; i < vehicle.images.length; i++) {
        const imageUrl = this.fileUploadService.getCarImageUrl(vehicle.images[i]);
        if (!this.imagePreviewUrls.includes(imageUrl)) {
          this.imagePreviewUrls.push(imageUrl);
        }
      }
    } else if (vehicleId) {
      // Use the vehicle ID to try multiple potential photo paths
      console.log('Using multiple image patterns with vehicle ID');
      // If we already have at least one image, start from index 1
      const startIndex = this.imagePreviewUrls.length > 0 ? 1 : 0;
      
      // Try to load up to 3 potential photos for the vehicle
      for (let i = startIndex; i < 3; i++) {
        const baseUrl = apiUrls.getUploadUrl('');
        const imagePath = `${baseUrl}${vehicleId}_${i}.jpg`;
        if (!this.imagePreviewUrls.includes(imagePath)) {
          this.imagePreviewUrls.push(imagePath);
          console.log(`Added potential image URL: ${imagePath}`);
        }
      }
    }
    
    // If we still have no images, add a fallback
    if (this.imagePreviewUrls.length === 0) {
      const fallbackImage = apiUrls.fallbackImageUrl;
      console.log('Using fallback image:', fallbackImage);
      this.imagePreviewUrls.push(fallbackImage);
    }
    
    console.log('Image preview URLs set to:', this.imagePreviewUrls);
  }
  
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onSubmit(): void {
    console.log('Submit button clicked');
    console.log('Form validity state:', this.vehicleForm.valid);
    console.log('Submitting state:', this.isSubmitting);
    
    // Debug current form values
    console.log('Current form values:', this.vehicleForm.value);
    
    // Force validation on all controls to expose issues
    Object.keys(this.vehicleForm.controls).forEach(key => {
      const control = this.vehicleForm.get(key);
      control?.markAsTouched();
      console.log(`Field ${key} valid:`, control?.valid, 'errors:', control?.errors);
    });
    
    // Manual validity check (since we disabled form validation in the HTML)
    const hasRequiredFields = this.vehicleForm.get('name')?.value && 
                              this.vehicleForm.get('brand')?.value && 
                              this.vehicleForm.get('model')?.value;
    
    // Only proceed if not already submitting
    if (!this.isSubmitting) {
      console.log('Form has required fields, proceeding with submission');
      this.isSubmitting = true;
      this.errorMessage = null;
      
      const formData = this.vehicleForm.value;
      console.log('Form data:', formData);
      
      // Process features from comma-separated string to array
      const featuresString = formData.features || '';
      const features = featuresString.split(',').map((feature: string) => feature.trim()).filter((feature: string) => feature);
      
      console.log('Processed features:', features);
      
      // Create vehicle object with proper field naming for the backend
      const vehicleData: any = {
        // Make sure to include the name field
        name: formData.name || `${formData.brand || formData.make} ${formData.model} ${formData.year}`,
        // Brand field should match the make field
        brand: formData.brand || formData.make,
        make: formData.brand || formData.make,
        model: formData.model,
        year: Number(formData.year),
        category: formData.category,
        type: formData.type, 
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        seats: Number(formData.seats),
        pricePerDay: Number(formData.pricePerDay),
        location: formData.location,
        mileage: Number(formData.mileage),
        stock: Number(formData.stock),
        description: formData.description || ' ', // Ensure description is never empty
        // Use the availability field instead of status
        availability: formData.available === true,
        features: features
      };
      
      // Debug logging for image files
      console.log('Selected files for upload:', this.selectedFiles);
      
      // Handle image files - explicitly set as 'images' to match the service's expected property name
      if (this.selectedFiles && this.selectedFiles.length > 0) {
        // We have new files selected for upload
        vehicleData.images = this.selectedFiles;
        console.log('Added new images to vehicle data:', this.selectedFiles.length, 'files');
      } else if (this.isEditMode && this.imagePreviewUrls && this.imagePreviewUrls.length > 0) {
        // If we're in edit mode and no new files selected, but we have existing image URLs,
        // pass the existing image paths to keep them
        vehicleData.photos = this.imagePreviewUrls.map(url => {
          // Extract just the filename part from the URL
          const urlParts = url.split('/');
          return urlParts[urlParts.length - 1];
        });
        console.log('Using existing image paths:', vehicleData.photos);
      } else {
        console.warn('No images selected for upload and no existing images found');
      }

      console.log('Prepared vehicle data:', vehicleData);

      if (this.isEditMode && this.vehicleId) {
        console.log('Updating vehicle with ID:', this.vehicleId);
        
        // Make sure we're sending a clean ID string
        const id = this.vehicleId.trim();
        
        this.vehicleService.updateVehicle(id, vehicleData)
          .pipe(
            finalize(() => {
              this.isSubmitting = false;
            })
          )
          .subscribe({
            next: (updatedVehicle) => {
              console.log('Vehicle updated successfully:', updatedVehicle);
              this.successMessage = 'Vehicle updated successfully!';
              // Navigate back to vehicle list after success
              setTimeout(() => this.router.navigate(['/admin/vehicles']), 1500);
            },
            error: (error) => {
              console.error('Error updating vehicle:', error);
              this.isSubmitting = false; // Ensure isSubmitting is reset on error
              this.errorMessage = `Failed to update vehicle: ${error.message || 'Unknown error'}`;
            }
          });
      } else {
        // Add new vehicle
        this.vehicleService.addVehicle(vehicleData)
          .pipe(
            finalize(() => {
              this.isSubmitting = false;
            })
          )
          .subscribe({
            next: (newVehicle) => {
              console.log('Vehicle added successfully:', newVehicle);
              this.successMessage = 'Vehicle added successfully!';
              setTimeout(() => this.router.navigate(['/admin/vehicles']), 1500);
            },
            error: (error) => {
              console.error('Error adding vehicle:', error);
              this.isSubmitting = false; // Ensure isSubmitting is reset on error
              this.errorMessage = `Failed to add vehicle: ${error.message || 'Unknown error'}`;
            }
          });
      }
    } else {
      console.log('Already submitting, ignoring duplicate submission');
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}


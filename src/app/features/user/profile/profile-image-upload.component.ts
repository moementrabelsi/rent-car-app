import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCamera, faSpinner, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-profile-image-upload',
  templateUrl: './profile-image-upload.component.html',
  styleUrls: ['./profile-image-upload.component.css'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule]
})
export class ProfileImageUploadComponent {
  @Input() currentImageUrl: string | null = null;
  @Output() imageUploaded = new EventEmitter<string>();
  
  isUploading = false;
  uploadError: string | null = null;
  uploadSuccess = false;
  
  // Icons
  faCamera = faCamera;
  faSpinner = faSpinner;
  faCheck = faCheck;
  faTimes = faTimes;
  
  constructor(
    private fileUploadService: FileUploadService,
    private library: FaIconLibrary
  ) {
    // Add icons to the library for the [spin] property to work
    library.addIcons(faCamera, faSpinner, faCheck, faTimes);
  }
  
  /**
   * Handles file input change event
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (file) {
      this.uploadImage(file);
    }
  }
  
  /**
   * Trigger file input click programmatically
   */
  triggerFileInput(): void {
    document.getElementById('profile-image-input')?.click();
  }
  
  /**
   * Upload image file to server
   */
  private uploadImage(file: File): void {
    // Validate file type
    if (!file.type.match(/image\/*/) || file.size > 5 * 1024 * 1024) {
      this.uploadError = 'Please select a valid image file (max 5MB).';
      return;
    }
    
    this.isUploading = true;
    this.uploadError = null;
    this.uploadSuccess = false;
    
    this.fileUploadService.uploadProfileImage(file).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.uploadSuccess = true;
        
        // Handle different response formats (backend might return response.data.profileImage or response.profileImage)
        let imagePath = '';
        if (response.data && response.data.profileImage) {
          imagePath = response.data.profileImage;
        } else if (response.profileImage) {
          imagePath = response.profileImage;
        } else {
          // If no specific path found, use the entire response as path if it's a string
          imagePath = typeof response === 'string' ? response : '';
        }
        
        // Emit the uploaded image URL if we have a path
        if (imagePath) {
          this.imageUploaded.emit(imagePath);
        }
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          this.uploadSuccess = false;
        }, 3000);
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Error uploading profile image:', error);
        this.uploadError = error.error?.message || error.message || 'Failed to upload image. Please try again.';
      }
    });
  }
}

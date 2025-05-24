import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserService } from '../../../core/services/user.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { User, UserActivity } from '../../../core/interfaces/user.interface';
import { faUserCircle, faCalendarAlt, faKey, faEdit, faLock } from '@fortawesome/free-solid-svg-icons';
import { ProfileImageUploadComponent } from './profile-image-upload.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, DatePipe, ProfileImageUploadComponent]
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  userActivities: UserActivity[] = [];
  profileImageUrl: string | null = null;
  loading = true;
  activitiesLoading = true;
  imageLoading = true;
  error: string | null = null;
  activeTab: 'profile' | 'activities' = 'profile';
  
  // Icons
  faUserCircle = faUserCircle;
  faCalendarAlt = faCalendarAlt;
  faKey = faKey;
  faEdit = faEdit;
  faLock = faLock;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserActivities();
    this.loadProfileImage();
  }

  loadUserProfile() {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load profile';
        this.loading = false;
        this.user = this.userService.getFallbackUserFromAuth();
      }
    });
  }

  loadUserActivities() {
    this.activitiesLoading = true;
    try {
      // Try to get from service first
      this.userService.getUserActivities().subscribe({
        next: (activities) => {
          this.userActivities = activities;
          this.activitiesLoading = false;
        },
        error: (error) => {
          console.log('Activities endpoint not implemented, using mock data', error);
          // Fallback to mock data
          this.createMockActivities();
          this.activitiesLoading = false;
        }
      });
    } catch (e) {
      // Fallback to mock data
      this.createMockActivities();
      this.activitiesLoading = false;
    }
  }
  
  loadProfileImage() {
    this.imageLoading = true;
    try {
      this.userService.getProfileImageUrl().subscribe({
        next: (imageUrl) => {
          this.profileImageUrl = imageUrl;
          this.imageLoading = false;
        },
        error: (error) => {
          console.log('Error loading profile image:', error);
          this.imageLoading = false;
        }
      });
    } catch (e) {
      console.error('Error loading profile image:', e);
      this.imageLoading = false;
    }
  }

  onImageUploaded(imagePath: string) {
    // Update local image url
    this.userService.getProfileImageUrl().subscribe({
      next: (url) => {
        this.profileImageUrl = url;
        
        // Update user profile cache with new image
        if (this.user) {
          this.userService.updateUserProfileCache({
            ...this.user,
            profileImage: imagePath
          });
        }
      },
      error: (error) => {
        console.error('Error updating profile image:', error);
      }
    });
  }

  private createMockActivities() {
    const now = new Date();
    this.userActivities = [
      {
        id: '1',
        type: 'booking',
        description: 'You booked a car for your trip',
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        id: '2',
        type: 'profile_update',
        description: 'You updated your profile information',
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        id: '3',
        type: 'password_change',
        description: 'You changed your password',
        date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      }
    ];
  }

  editProfile() {
    // Navigate to the edit profile page
    this.router.navigate(['/user/edit-profile']);
  }

  changePassword() {
    // Navigate to the change password page
    this.router.navigate(['/user/change-password']);
  }
  
  setActiveTab(tab: 'profile' | 'activities') {
    this.activeTab = tab;
  }

  getActivityIcon(type: string) {
    switch (type) {
      case 'booking':
        return faCalendarAlt;
      case 'password_change':
        return faKey;
      default:
        return faUserCircle;
    }
  }
  
  formatDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }
} 
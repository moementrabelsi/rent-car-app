import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faEnvelope, faPhone, faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/interfaces/user.interface';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule]
})
export class EditProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Icons
  faUser = faUser;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faHome = faHome;
  faArrowLeft = faArrowLeft;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: [{ value: '', disabled: true }], // Email can't be changed
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
        
        // Set form values
        this.profileForm.patchValue({
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email,
          phone: user.phone || '',
          address: user.address || ''
        });
      },
      error: (err: Error) => {
        this.error = 'Failed to load user data: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      const userData = {
        ...this.profileForm.getRawValue(),
        // Don't include email as it can't be changed
        email: undefined
      };

      this.userService.updateProfile(userData).subscribe({
        next: (updatedUser) => {
          this.isLoading = false;
          this.successMessage = 'Profile updated successfully';
          this.user = updatedUser;
          
          // Navigate back to profile page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 2000);
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.error = 'Failed to update profile: ' + err.message;
        }
      });
    } else {
      // Mark all form controls as touched to trigger validation messages
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FontAwesomeModule]
})
export class SignInComponent {
  signInForm: FormGroup;
  error: string | null = null;
  isLoading = false;

  // Notification
  showNotification = false;
  notificationMessage = '';

  // Icons
  faEnvelope = faEnvelope;
  faLock = faLock;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Check if redirected from signup
    if ((window.history.state as any).signupSuccess) {
      this.showNotification = true;
      this.notificationMessage = 'Please check your mail to activate your account.';
      // Hide notification after 6 seconds
      setTimeout(() => this.showNotification = false, 6000);
    }
  }

  onSubmit() {
    if (this.signInForm.valid) {
      this.isLoading = true;
      this.error = null;

      const { email, password } = this.signInForm.value;
      this.authService.signIn(email, password).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error = err.message || 'An error occurred during sign in';
          this.isLoading = false;
        }
      });
    }
  }
  
  forgotPassword() {
    const email = this.signInForm.get('email')?.value;
    
    if (!email) {
      this.error = 'Please enter your email address first';
      return;
    }
    
    if (this.signInForm.get('email')?.invalid) {
      this.error = 'Please enter a valid email address';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    this.authService.forgotPassword(email).subscribe({
      next: (response: { message: string }) => {
        this.isLoading = false;
        this.showNotification = true;
        this.notificationMessage = 'Password reset instructions sent to your email. Please check your inbox.';
        setTimeout(() => this.showNotification = false, 6000);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.error = err.message || 'Failed to send reset email. Please try again.';
      }
    });
  }
}
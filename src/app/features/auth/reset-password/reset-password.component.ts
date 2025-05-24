import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock, faUnlock, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, RouterModule]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  token: string | null = null;
  
  // Icons
  faLock = faLock;
  faUnlock = faUnlock;
  faArrowLeft = faArrowLeft;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    
    if (!this.token) {
      this.error = 'Invalid password reset link. Please request a new one.';
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.resetForm.valid && this.token) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      const { password } = this.resetForm.value;

      this.authService.resetPassword(this.token, password).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Password reset successful! You can now log in with your new password.';
          
          // Reset form
          this.resetForm.reset();
          
          // Navigate to sign-in page after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/signin']);
          }, 3000);
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.error = 'Failed to reset password: ' + (err.message || 'Please try again or request a new reset link.');
        }
      });
    } else {
      // Mark all form controls as touched to trigger validation messages
      Object.keys(this.resetForm.controls).forEach(key => {
        this.resetForm.get(key)?.markAsTouched();
      });
    }
  }

  goToSignIn(): void {
    this.router.navigate(['/signin']);
  }
}

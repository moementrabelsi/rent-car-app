import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, RouterModule]
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Icons
  faEnvelope = faEnvelope;
  faArrowLeft = faArrowLeft;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      const { email } = this.forgotForm.value;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response.message || 'Password reset instructions have been sent to your email.';
          this.forgotForm.reset();
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.error = err.message || 'Failed to request password reset. Please try again.';
        }
      });
    } else {
      // Mark all form controls as touched to trigger validation messages
      Object.keys(this.forgotForm.controls).forEach(key => {
        this.forgotForm.get(key)?.markAsTouched();
      });
    }
  }

  goToSignIn(): void {
    this.router.navigate(['/signin']);
  }
}

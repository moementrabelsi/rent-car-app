import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule]
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Icons
  faLock = faLock;
  faArrowLeft = faArrowLeft;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      const { currentPassword, newPassword } = this.passwordForm.value;

      this.userService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Password changed successfully. A confirmation email has been sent.';
          
          // Reset form
          this.passwordForm.reset();
          
          // Navigate back to profile page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 2000);
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.error = 'Failed to change password: ' + err.message;
        }
      });
    } else {
      // Mark all form controls as touched to trigger validation messages
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}

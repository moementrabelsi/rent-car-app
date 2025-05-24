import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faEnvelope, faLock, faPhone } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FontAwesomeModule]
})
export class SignUpComponent {
  signUpForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  // Icons
  faUser = faUser;
  faEnvelope = faEnvelope;
  faLock = faLock;
  faPhone = faPhone;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordMismatch: true }
      : null;
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.isLoading = true;
      this.error = null;
      
      // Create a copy of the form value without confirmPassword
      const { confirmPassword, ...userData } = this.signUpForm.value;
      
      this.authService.signUp(userData).subscribe(
        () => {
          // Handle sign up logic here
          console.log('User registered successfully');
          this.isLoading = false;
          // Navigate to signin page after successful signup
          this.router.navigate(['/signin'], { state: { signupSuccess: true } });
        },
        error => {
          console.error('Sign up failed:', error);
          this.error = error.message;
          this.isLoading = false;
        }
      );
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.signUpForm.controls).forEach(key => {
        const control = this.signUpForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
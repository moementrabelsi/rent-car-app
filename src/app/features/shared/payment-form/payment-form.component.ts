import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class PaymentFormComponent implements OnInit {
  @Input() bookingId: string = '';
  @Input() amount: number = 0;
  @Output() paymentComplete = new EventEmitter<{success: boolean, message: string}>();
  
  paymentForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  paymentSuccess = false;
  cardError: string | null = null;
  
  // Card display values
  cardNumber = '';
  cardExpiry = '';
  cardCvc = '';
  cardHolder = '';
  
  // Stripe elements
  private stripe: any;
  private elements: any;
  private card: any;
  private clientSecret: string = '';
  private paymentIntentId: string = '';

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService
  ) {
    this.paymentForm = this.fb.group({
      cardHolder: ['', [Validators.required]],
      saveCard: [false]
    });
  }

  async ngOnInit() {
    this.loadStripe();
    this.createPaymentIntent();
  }

  private async loadStripe() {
    // Load Stripe.js dynamically
    if (!window.hasOwnProperty('Stripe')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.body.appendChild(script);
      
      // Wait for script to load
      await new Promise(resolve => {
        script.onload = resolve;
      });
    }
    
    // Initialize Stripe
    this.initializeStripe();
  }

  private initializeStripe() {
    // Replace with your publishable key
    this.stripe = (window as any).Stripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');
    
    this.elements = this.stripe.elements();
    
    // Create card element
    this.card = this.elements.create('card', {
      style: {
        base: {
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    });
    
    // Wait for DOM to be ready
    setTimeout(() => {
      // Mount card element
      this.card.mount('#card-element');
      
      // Add event listener for changes
      this.card.on('change', (event: any) => {
        this.cardError = event.error ? event.error.message : null;
      });
    }, 100);
  }

  private createPaymentIntent() {
    if (!this.bookingId || this.amount <= 0) {
      this.error = 'Invalid booking or amount';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(this.amount * 100);
    
    this.paymentService.createPaymentIntent(this.bookingId, amountInCents).subscribe({
      next: (response) => {
        this.clientSecret = response.clientSecret;
        this.paymentIntentId = response.id;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to create payment intent';
        this.isLoading = false;
        this.paymentComplete.emit({ success: false, message: this.error });
      }
    });
  }

  async processPayment() {
    if (this.paymentForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: this.paymentForm.value.cardHolder
          }
        }
      });
      
      if (error) {
        this.error = error.message || 'Payment failed';
        this.paymentComplete.emit({ success: false, message: this.error });
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on our backend
        this.confirmPaymentOnServer(paymentIntent.id);
      } else {
        this.error = `Payment status: ${paymentIntent.status}. Please try again.`;
        this.paymentComplete.emit({ success: false, message: this.error });
      }
    } catch (err: any) {
      this.error = err.message || 'An unexpected error occurred';
      this.paymentComplete.emit({ success: false, message: this.error });
    } finally {
      this.isLoading = false;
    }
  }

  private confirmPaymentOnServer(paymentIntentId: string) {
    this.paymentService.confirmPayment(this.bookingId, paymentIntentId).subscribe({
      next: () => {
        this.paymentSuccess = true;
        this.paymentComplete.emit({ 
          success: true, 
          message: 'Payment processed successfully' 
        });
      },
      error: (error) => {
        this.error = error.message || 'Failed to confirm payment on server';
        this.paymentComplete.emit({ success: false, message: this.error });
      }
    });
  }
}

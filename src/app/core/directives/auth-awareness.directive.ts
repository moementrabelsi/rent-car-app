import { Directive, ElementRef, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';

/**
 * This directive automatically hides any elements containing 
 * "not logged in" or similar text when a user is authenticated.
 * It can be applied to any element, but is most useful on divs or paragraphs
 * that might show authentication-related messages.
 */
@Directive({
  selector: '[appAuthAwareness]',
  standalone: true
})
export class AuthAwarenessDirective implements OnInit, OnDestroy {
  private subscription: Subscription | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private authStateService: AuthStateService
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.subscription = this.authStateService.isAuthenticated$.subscribe(isAuthenticated => {
      this.updateElementVisibility(isAuthenticated);
    });
    
    // Also run once at initialization to set correct initial state
    this.updateElementVisibility(this.authStateService.isUserAuthenticated);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Hide "not logged in" messages when authenticated
   */
  private updateElementVisibility(isAuthenticated: boolean): void {
    const element = this.el.nativeElement;
    const text = element.innerText?.toLowerCase() || '';
    
    // Check if the element contains not-logged-in messaging
    if (text.includes('not logged in') || text.includes('log in to get access')) {
      // If authenticated, hide the element
      if (isAuthenticated) {
        this.renderer.setStyle(element, 'display', 'none');
      } else {
        this.renderer.removeStyle(element, 'display');
      }
    }
  }
}

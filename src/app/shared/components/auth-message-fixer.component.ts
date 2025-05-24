import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../core/services/auth-state.service';

/**
 * This component automatically detects and hides any "not logged in" messages
 * that appear when the user is actually authenticated.
 * It uses DOM manipulation to find and fix these inconsistencies.
 */
@Component({
  selector: 'app-auth-message-fixer',
  standalone: true,
  imports: [CommonModule],
  template: '', // No visible UI
  styles: ['']
})
export class AuthMessageFixerComponent implements AfterViewInit {
  constructor(private authStateService: AuthStateService) {}

  ngAfterViewInit(): void {
    // Wait for the DOM to be fully loaded
    setTimeout(() => {
      this.fixAuthMessages();
      
      // Also set up an observer to detect dynamically added messages
      this.observeDOMChanges();
    }, 500);
  }

  private fixAuthMessages(): void {
    // Only fix messages if the user is actually authenticated
    if (!this.authStateService.isUserAuthenticated) {
      return;
    }

    // Find all text nodes in the DOM
    const textNodes = this.getAllTextNodes(document.body);
    
    // Check each text node for the "not logged in" message
    textNodes.forEach(node => {
      if (node.textContent && 
         (node.textContent.includes('not logged in') || 
          node.textContent.includes('log in to get access'))) {
        
        // Find the parent element that contains this text
        let element = node.parentElement;
        while (element && element.innerText !== node.textContent) {
          element = element.parentElement;
        }
        
        // Hide the element containing the message
        if (element) {
          element.style.display = 'none';
        }
      }
    });
  }

  private getAllTextNodes(element: Node): Text[] {
    const textNodes: Text[] = [];
    
    // Skip if node doesn't exist
    if (!element) return textNodes;
    
    const walk = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node: Node | null;
    while (node = walk.nextNode()) {
      textNodes.push(node as Text);
    }
    
    return textNodes;
  }

  private observeDOMChanges(): void {
    // Create an observer to detect when new content is added to the DOM
    const observer = new MutationObserver(() => {
      this.fixAuthMessages();
    });
    
    // Start observing the document body for added/removed nodes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

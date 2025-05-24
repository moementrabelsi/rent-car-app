import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faLinkedinIn
} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  
  // Social media icons
  faFacebookF = faFacebookF;
  faTwitter = faTwitter;
  faInstagram = faInstagram;
  faLinkedinIn = faLinkedinIn;
}

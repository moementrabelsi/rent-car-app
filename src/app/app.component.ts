import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuthMessageFixerComponent } from './shared/components/auth-message-fixer.component';

@Component({
  selector: 'app-root',
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-auth-message-fixer></app-auth-message-fixer>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 140px);
      padding-top: 80px;
      padding-bottom: var(--space-xxl);
    }
  `],
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, AuthMessageFixerComponent]
})
export class AppComponent {
  title = 'RentCar';
}
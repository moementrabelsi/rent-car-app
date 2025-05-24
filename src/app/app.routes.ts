import { Routes } from '@angular/router';
import { MainHomeComponent } from './features/home/main-home.component';
import { AboutComponent } from './features/about/about.component';
import { CarsListComponent } from './features/cars/cars-list/cars-list.component';
import { CarDetailComponent } from './features/cars/car-detail';
import { SignInComponent } from './features/auth/sign-in/sign-in.component';
import { SignUpComponent } from './features/auth/sign-up/sign-up.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { UserProfileComponent } from './features/user/profile/user-profile.component';
import { EditProfileComponent } from './features/user/profile/edit-profile.component';
import { ChangePasswordComponent } from './features/user/profile/change-password.component';
import { BookingsComponent } from './features/user/bookings/bookings.component';
import { VehicleFormComponent } from './features/admin/vehicle-form/vehicle-form.component';
import { VehicleListComponent } from './features/admin/vehicle-list/vehicle-list.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: MainHomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'cars', component: CarsListComponent },
  { path: 'cars/:id', component: CarDetailComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { 
    path: 'admin/dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'admin/vehicle/new', 
    component: VehicleFormComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'admin/vehicle/edit/:id', 
    component: VehicleFormComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'admin/vehicles', 
    component: VehicleListComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'profile', 
    component: UserProfileComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'user/edit-profile', 
    component: EditProfileComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'user/change-password', 
    component: ChangePasswordComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'bookings', 
    component: BookingsComponent, 
    canActivate: [AuthGuard] 
  },
  { path: '**', redirectTo: '' }
];


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AboutComponent } from './features/about/about.component';
import { CarsListComponent } from './features/cars/cars-list/cars-list.component';
import { CarDetailComponent } from './features/cars/car-detail/car-detail.component';
import { SignInComponent } from './features/auth/sign-in/sign-in.component';
import { SignUpComponent } from './features/auth/sign-up/sign-up.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { UserProfileComponent } from './features/user/profile/user-profile.component';
import { BookingsComponent } from './features/user/bookings/bookings.component';
import { VehicleFormComponent } from './features/admin/vehicle-form/vehicle-form.component';
import { VehicleListComponent } from './features/admin/vehicle-list/vehicle-list.component';
import { EditProfileComponent } from './features/user/profile/edit-profile.component';
import { ChangePasswordComponent } from './features/user/profile/change-password.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'cars', component: CarsListComponent },
  { path: 'cars/:id', component: CarDetailComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'signup', component: SignUpComponent },
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
    path: 'profile/edit', 
    component: EditProfileComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'profile/change-password', 
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BookingService } from '../../../core/services/booking.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Booking } from '../../../core/interfaces/booking.interface';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/interfaces/user.interface';

import {
  faCar, 
  faCalendarAlt, 
  faUsers, 
  faMoneyBillWave,
  faChartLine,
  faEye,
  faCheck,
  faTimes,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faSyncAlt,
  faFileExport
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, DatePipe, FormsModule]
})
export class DashboardComponent implements OnInit {
  // Icons
  faCar = faCar;
  faCalendarAlt = faCalendarAlt;
  faUsers = faUsers;
  faMoneyBillWave = faMoneyBillWave;
  faChartLine = faChartLine;
  faEye = faEye;
  faCheck = faCheck;
  faTimes = faTimes;
  faTrash = faTrash;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faSyncAlt = faSyncAlt;
  faFileExport = faFileExport;

  // Dashboard Statistics
  totalVehicles: number = 0;
  totalBookings: number = 0;
  activeBookings: number = 0;
  totalRevenue: number = 0;
  pendingBookings: number = 0;
  confirmedBookings: number = 0;
  cancelledBookings: number = 0;
  completedBookings: number = 0;
  activeBookingsPercentage: number = 0;
  averageBookingDuration: number = 0;
  monthlyAverageRevenue: number = 0;
  averageBookingValue: number = 0;
  uniqueCustomers: number = 0;
  returningCustomers: number = 0;
  averageBookingsPerCustomer: number = 0;
  recentBookings: Booking[] = [];
  
  // All bookings data
  allBookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  customerNames: { [key: string]: string } = {};
  loading: boolean = true;
  
  // Selected booking for detailed view
  selectedBooking: Booking | null = null;
  
  // Tracking booking actions in progress
  processingBookings: Set<string> = new Set<string>();
  
  // Search and filters
  searchTerm: string = '';
  statusFilter: string = 'all';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private bookingService: BookingService,
    private vehicleService: VehicleService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    console.log('Loading dashboard data...');
    
    // Load total vehicles
    this.vehicleService.getVehicles().subscribe(vehicles => {
      this.totalVehicles = vehicles.length;
      console.log(`Found ${vehicles.length} vehicles`);
    });

    // Load all bookings data
    console.log('Attempting to fetch bookings from service...');
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        console.log('Dashboard received bookings:', bookings);
        this.allBookings = bookings;
        
        // Update stats based on booking data
        this.totalBookings = bookings.length;
        this.activeBookings = bookings.filter(b => b.status === 'pending' || b.status === 'active').length;
        this.totalRevenue = bookings
          .filter(b => ['confirmed', 'active', 'completed'].includes(b.status))
          .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
          
        console.log(`Dashboard stats - Total: ${this.totalBookings}, Active: ${this.activeBookings}, Revenue: ${this.totalRevenue}`);
          
        // Get most recent bookings for the stats
        this.recentBookings = [...bookings].sort((a, b) => {
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        }).slice(0, 5);
        
        // Apply initial filters
        this.applyFilters();
        console.log('After filters applied:', this.filteredBookings.length, 'bookings match filters');
        
        // Load customer names for all bookings
        const uniqueUserIds = [...new Set(bookings.map(b => b.userId))];
        console.log('Found unique user IDs:', uniqueUserIds);
        
        uniqueUserIds.forEach(userId => {
          this.userService.getUserById(userId).subscribe({
            next: (user: User | undefined) => {
              if (user) {
                this.customerNames[userId] = user.name || 
                  (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Unknown');
                console.log(`Loaded user ${userId} name: ${this.customerNames[userId]}`);
              } else {
                this.customerNames[userId] = 'Unknown User';
                console.log(`User ${userId} not found`);
              }
            },
            error: (error) => {
              console.error(`Error fetching user ${userId}:`, error);
              this.customerNames[userId] = 'Unknown User';
            }
          });
        });
        
        this.loading = false;
        this.updateDashboardStats(); // Make sure to update all stats
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.loading = false;
        alert('Failed to load bookings. Please try again.');
      }
    });
  }

  getCustomerName(userId: string): string {
    return this.customerNames[userId] || 'Unknown User';
  }

  isProcessingBooking(bookingId: string): boolean {
    return this.processingBookings.has(bookingId);
  }

  approveBooking(bookingId: string): void {
    if (this.isProcessingBooking(bookingId)) return;
    
    // Mark booking as being processed
    this.processingBookings.add(bookingId);
    
    this.bookingService.approveBooking(bookingId).subscribe({
      next: (updatedBooking) => {
        if (updatedBooking) {
          // Find and update the booking in our list
          const index = this.recentBookings.findIndex(b => b.id === bookingId);
          if (index !== -1) {
            this.recentBookings[index] = updatedBooking;
          }
          
          // Recalculate dashboard stats
          this.updateDashboardStats();
        }
        this.processingBookings.delete(bookingId);
      },
      error: (error) => {
        console.error('Error approving booking:', error);
        alert('Failed to approve booking. Please try again.');
        this.processingBookings.delete(bookingId);
      }
    });
  }

  rejectBooking(bookingId: string): void {
    if (this.isProcessingBooking(bookingId)) return;
    
    // Mark booking as being processed
    this.processingBookings.add(bookingId);
    
    this.bookingService.rejectBooking(bookingId).subscribe({
      next: (updatedBooking) => {
        if (updatedBooking) {
          // Find and update the booking in our list
          const index = this.recentBookings.findIndex(b => b.id === bookingId);
          if (index !== -1) {
            this.recentBookings[index] = updatedBooking;
          }
          
          // Recalculate dashboard stats
          this.updateDashboardStats();
        }
        this.processingBookings.delete(bookingId);
      },
      error: (error) => {
        console.error('Error rejecting booking:', error);
        alert('Failed to reject booking. Please try again.');
        this.processingBookings.delete(bookingId);
      }
    });
  }

  updateDashboardStats(): void {
    this.totalBookings = this.allBookings.length;
    
    // Status-based counts
    this.pendingBookings = this.allBookings.filter(b => b.status === 'pending').length;
    this.confirmedBookings = this.allBookings.filter(b => b.status === 'active').length; // 'active' status used instead of 'confirmed'
    this.cancelledBookings = this.allBookings.filter(b => b.status === 'cancelled').length;
    this.completedBookings = this.allBookings.filter(b => b.status === 'completed').length;
    
    // Active bookings metrics
    this.activeBookings = this.confirmedBookings; // Active bookings are those with active status
    this.activeBookingsPercentage = this.totalBookings > 0 
      ? Math.round((this.activeBookings / this.totalBookings) * 100) 
      : 0;
    
    // Duration calculations
    let totalDuration = 0;
    const activeBookingsWithDates = this.allBookings.filter(b => b.status === 'active' && b.startDate && b.endDate);
    
    activeBookingsWithDates.forEach(booking => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDuration += diffDays;
    });
    
    this.averageBookingDuration = activeBookingsWithDates.length > 0 
      ? Math.round((totalDuration / activeBookingsWithDates.length) * 10) / 10 
      : 0;
    
    // Revenue calculations
    this.totalRevenue = this.allBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    this.averageBookingValue = this.totalBookings > 0 
      ? Math.round((this.totalRevenue / this.totalBookings) * 100) / 100 
      : 0;
    
    // Assuming bookings span approximately the last 6 months for the monthly average
    this.monthlyAverageRevenue = Math.round((this.totalRevenue / 6) * 100) / 100;
    
    // Customer metrics
    const uniqueCustomerIds = new Set<string>();
    const customerBookingCounts: { [key: string]: number } = {};
    
    this.allBookings.forEach(booking => {
      if (booking.userId) {
        uniqueCustomerIds.add(booking.userId);
        
        if (!customerBookingCounts[booking.userId]) {
          customerBookingCounts[booking.userId] = 1;
        } else {
          customerBookingCounts[booking.userId]++;
        }
      }
    });
    
    this.uniqueCustomers = uniqueCustomerIds.size;
    
    // Customers with more than one booking are considered returning
    this.returningCustomers = Object.values(customerBookingCounts).filter(count => count > 1).length;
    
    this.averageBookingsPerCustomer = this.uniqueCustomers > 0 
      ? Math.round((this.totalBookings / this.uniqueCustomers) * 10) / 10 
      : 0;
  }
  
  /**
   * Filter bookings based on search term and status filter
   */
  applyFilters(): void {
    let filtered = [...this.allBookings];
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === this.statusFilter);
    }
    
    // Apply search filter
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(booking => 
        // Search by ID
        booking.id.toLowerCase().includes(term) ||
        // Search by customer name
        this.getCustomerName(booking.userId).toLowerCase().includes(term) ||
        // Search by vehicle
        (booking.vehicle?.name?.toLowerCase()?.includes(term) ?? false) ||
        (booking.vehicle?.brand?.toLowerCase()?.includes(term) ?? false) ||
        (booking.vehicle?.model?.toLowerCase()?.includes(term) ?? false)
      );
    }
    
    // Update filtered bookings and pagination
    this.filteredBookings = filtered;
    this.updatePagination();
  }
  
  /**
   * Update pagination based on filtered results
   */
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredBookings.length / this.itemsPerPage) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }
  
  /**
   * Change current page
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  /**
   * Update a booking's status
   */
  updateBookingStatus(booking: Booking): void {
    this.processingBookings.add(booking.id);
    
    this.bookingService.updateBooking(booking.id, { status: booking.status }).subscribe({
      next: (updatedBooking) => {
        if (updatedBooking) {
          console.log(`Booking ${booking.id} status updated to ${booking.status}`);
          // Recalculate dashboard stats
          this.updateDashboardStats();
        } else {
          alert('Failed to update booking status. Please try again.');
          // Revert status change if failed
          const originalBooking = this.allBookings.find(b => b.id === booking.id);
          if (originalBooking) {
            booking.status = originalBooking.status;
          }
        }
        this.processingBookings.delete(booking.id);
      },
      error: (error) => {
        console.error('Error updating booking status:', error);
        alert('Failed to update booking status: ' + error.message);
        // Revert status change if failed
        const originalBooking = this.allBookings.find(b => b.id === booking.id);
        if (originalBooking) {
          booking.status = originalBooking.status;
        }
        this.processingBookings.delete(booking.id);
      }
    });
  }
  
  /**
   * View booking details in modal
   */
  viewBookingDetails(booking: Booking): void {
    this.selectedBooking = booking;
  }
  
  /**
   * Close booking details modal
   */
  closeBookingDetails(): void {
    this.selectedBooking = null;
  }
  
  /**
   * Export bookings data as CSV file
   */
  exportBookingsData(): void {
    if (!this.allBookings || this.allBookings.length === 0) {
      alert('No booking data to export.');
      return;
    }
    
    // Define CSV column headers
    const headers = [
      'Booking ID', 
      'Customer Name', 
      'Vehicle',
      'Start Date',
      'End Date',
      'Amount ($)',
      'Status',
      'Pickup Location',
      'Dropoff Location',
      'Created At'
    ];
    
    // Transform bookings data into CSV rows
    const rows = this.allBookings.map(booking => {
      const customerName = this.getCustomerName(booking.userId);
      const vehicleName = booking.vehicle?.name || 
        (booking.vehicle?.brand ? `${booking.vehicle.brand} ${booking.vehicle.model}` : 'N/A');
      
      return [
        booking.id,
        customerName,
        vehicleName,
        new Date(booking.startDate).toLocaleDateString(),
        new Date(booking.endDate).toLocaleDateString(),
        booking.totalAmount || 0,
        booking.status,
        booking.pickupLocation?.address || 'N/A',
        booking.dropoffLocation?.address || 'N/A',
        booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'
      ];
    });
    
    // Combine headers and rows
    let csvContent = headers.join(',') + '\n';
    
    // Add each row to the CSV content
    rows.forEach(row => {
      // Properly format each cell (handle commas, quotes, etc.)
      const formattedRow = row.map(cell => {
        // Convert to string and handle null/undefined
        const cellStr = cell !== null && cell !== undefined ? String(cell) : '';
        
        // If the cell contains commas, quotes, or newlines, wrap it in quotes
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          // Escape any quotes within the cell by doubling them
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      });
      
      csvContent += formattedRow.join(',') + '\n';
    });
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link and trigger download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Get current date for filename
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `rentcar-bookings-${dateStr}.csv`);
    link.style.visibility = 'hidden';
    
    // Add to document, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Check if booking has any extras
   */
  hasExtras(booking: Booking): boolean {
    if (!booking.extras) return false;
    
    return booking.extras.driver || 
           booking.extras.gps || 
           booking.extras.airConditioning || 
           booking.extras.bluetooth || 
           booking.extras.babySeat || 
           false;
  }
  
  /**
   * Delete a booking
   */
  deleteBooking(booking: Booking): void {
    if (!confirm(`Are you sure you want to delete booking ${booking.id}? This action cannot be undone.`)) {
      return;
    }
    
    this.processingBookings.add(booking.id);
    
    this.bookingService.deleteBooking(booking.id).subscribe({
      next: (success) => {
        if (success) {
          // Remove booking from arrays
          this.allBookings = this.allBookings.filter(b => b.id !== booking.id);
          this.filteredBookings = this.filteredBookings.filter(b => b.id !== booking.id);
          
          // Recalculate stats and pagination
          this.updateDashboardStats();
          this.updatePagination();
          
          alert('Booking deleted successfully.');
        } else {
          alert('Failed to delete booking. Please try again.');
        }
        this.processingBookings.delete(booking.id);
      },
      error: (error) => {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking: ' + error.message);
        this.processingBookings.delete(booking.id);
      }
    });
  }
}

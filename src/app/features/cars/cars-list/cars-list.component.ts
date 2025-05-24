import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCar, faGasPump, faCog, faUsers, faMapMarkerAlt, faStar, faTachometerAlt, faCalendarAlt, faSearch, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { CarService } from '../../../core/services/car.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { Car, CarCategory } from '../../../core/models/car.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cars-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FontAwesomeModule],
  templateUrl: './cars-list.component.html',
  styleUrls: ['./cars-list.component.scss']
})
export class CarsListComponent implements OnInit {
  // FontAwesome icons
  faCar = faCar;
  faGasPump = faGasPump;
  faCog = faCog;
  faUsers = faUsers;
  faMapMarkerAlt = faMapMarkerAlt;
  faStar = faStar;
  faTachometerAlt = faTachometerAlt;
  faCalendarAlt = faCalendarAlt;
  faSearch = faSearch;
  faRefresh = faRefresh;
  
  // Base URL for images
  private apiBaseUrl = environment.apiUrl;
  
  // Car data
  cars: Car[] = [];
  filteredCars: Car[] = [];
  paginatedCars: Car[] = [];
  
  // Filter options
  categories: CarCategory[] = [];
  selectedCategory: string = '';
  priceMin: number = 0;
  priceMax: number = 1000;
  minPossiblePrice: number = 0;
  maxPossiblePrice: number = 1000;
  seatOptions: number[] = [];
  selectedSeats: number[] = [];
  fuelTypes: string[] = ['', 'petrol', 'diesel', 'electric', 'hybrid'];
  selectedFuelType: string = '';
  selectedTransmission: string = '';
  isFiltered: boolean = false;
  
  // Search and sort
  searchQuery: string = '';
  sortOption: string = 'priceAsc';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 3;
  totalPages: number = 1;
  
  // Required for template
  Math = Math;

  constructor(
    private carService: CarService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    this.carService.getCars().subscribe(cars => {
      this.cars = cars;
      // Find min/max prices
      const prices = cars.map(c => c.pricePerDay);
      this.minPossiblePrice = Math.min(...prices) || 0;
      this.maxPossiblePrice = Math.max(...prices) || 1000;
      this.priceMin = this.minPossiblePrice;
      this.priceMax = this.maxPossiblePrice;
      // Find unique seat counts
      this.seatOptions = Array.from(new Set(cars.map(c => c.seats))).sort((a, b) => a - b);
      this.applyFilters();
    });
    this.carService.getCarCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onPriceChange() {
    if (this.priceMin > this.priceMax) {
      [this.priceMin, this.priceMax] = [this.priceMax, this.priceMin];
    }
    this.applyFilters();
  }

  onSeatChange(event: any, seat: number) {
    if (event.target.checked) {
      if (!this.selectedSeats.includes(seat)) {
        this.selectedSeats.push(seat);
      }
    } else {
      this.selectedSeats = this.selectedSeats.filter(s => s !== seat);
    }
    this.applyFilters();
  }
  
  selectTransmission(transmission: string) {
    this.selectedTransmission = transmission;
    this.applyFilters();
  }
  
  selectFuelType(fuelType: string) {
    this.selectedFuelType = fuelType;
    this.applyFilters();
  }
  
  sortCars() {
    switch (this.sortOption) {
      case 'priceAsc':
        this.filteredCars.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'priceDesc':
        this.filteredCars.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'newest':
        this.filteredCars.sort((a, b) => b.year - a.year);
        break;
      case 'oldest':
        this.filteredCars.sort((a, b) => a.year - b.year);
        break;
    }
    this.updatePagination();
  }

  searchCars(): void {
    // Apply search filter first
    const searchTerms = this.searchQuery.toLowerCase().trim().split(' ');
    
    if (this.searchQuery.trim() === '') {
      this.applyFilters(); // If empty search, just apply other filters
      return;
    }
    
    this.filteredCars = this.cars.filter(car => {
      // Apply normal filters
      const matchesCategory = !this.selectedCategory || car.category === this.selectedCategory;
      const matchesPrice = car.pricePerDay >= this.priceMin && car.pricePerDay <= this.priceMax;
      const matchesSeats = this.selectedSeats.length === 0 || this.selectedSeats.includes(car.seats);
      const matchesTransmission = !this.selectedTransmission || car.transmission === this.selectedTransmission;
      const matchesFuelType = !this.selectedFuelType || car.fuelType === this.selectedFuelType;
      
      // Search in make, model, location, and description
      const searchableText = [
        car.make,
        car.model,
        car.location || '',
        car.description || ''
      ].join(' ').toLowerCase();
      
      const matchesSearch = searchTerms.every(term => searchableText.includes(term));
      
      return matchesCategory && matchesPrice && matchesSeats && matchesTransmission && matchesFuelType && matchesSearch;
    });
    
    this.sortCars(); // Apply the selected sorting
    this.currentPage = 1;
    this.updatePagination();
    this.checkIfFiltered();
  }

  applyFilters(): void {
    this.filteredCars = this.cars.filter(car => {
      const matchesCategory = !this.selectedCategory || car.category === this.selectedCategory;
      const matchesPrice = car.pricePerDay >= this.priceMin && car.pricePerDay <= this.priceMax;
      const matchesSeats = this.selectedSeats.length === 0 || this.selectedSeats.includes(car.seats);
      const matchesTransmission = !this.selectedTransmission || car.transmission === this.selectedTransmission;
      const matchesFuelType = !this.selectedFuelType || car.fuelType === this.selectedFuelType;
      
      // If search query is active, apply it too
      let matchesSearch = true;
      if (this.searchQuery.trim() !== '') {
        const searchTerms = this.searchQuery.toLowerCase().trim().split(' ');
        const searchableText = [
          car.make,
          car.model,
          car.location || '',
          car.description || ''
        ].join(' ').toLowerCase();
        
        matchesSearch = searchTerms.every(term => searchableText.includes(term));
      }
      
      return matchesCategory && matchesPrice && matchesSeats && matchesTransmission && matchesFuelType && matchesSearch;
    });
    
    this.sortCars(); // Apply the selected sorting
    this.currentPage = 1;
    this.updatePagination();
    this.checkIfFiltered();
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.priceMin = this.minPossiblePrice;
    this.priceMax = this.maxPossiblePrice;
    this.selectedSeats = [];
    this.selectedTransmission = '';
    this.selectedFuelType = '';
    this.searchQuery = '';
    this.sortOption = 'priceAsc';
    this.applyFilters();
  }
  
  checkIfFiltered(): void {
    this.isFiltered = (
      this.selectedCategory !== '' ||
      this.priceMin !== this.minPossiblePrice ||
      this.priceMax !== this.maxPossiblePrice ||
      this.selectedSeats.length > 0 ||
      this.selectedTransmission !== '' ||
      this.selectedFuelType !== '' ||
      this.searchQuery !== ''
    );
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCars.length / this.pageSize) || 1;
    this.paginatedCars = this.filteredCars.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }
  
  // Generate pagination array for the template
  getPaginationArray(): number[] {
    const pageArray: number[] = [];
    const maxVisiblePages = 5; // Show at most 5 page numbers
    
    if (this.totalPages <= maxVisiblePages) {
      // If total pages is less than max visible, show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        pageArray.push(i);
      }
    } else {
      // Complex pagination logic for many pages
      let startPage = Math.max(this.currentPage - Math.floor(maxVisiblePages / 2), 1);
      let endPage = startPage + maxVisiblePages - 1;
      
      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageArray.push(i);
      }
    }
    
    return pageArray;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  
  /**
   * Get the proper URL for a car image
   * @param car The car object containing photos information
   * @returns The full URL to the car image directly from backend uploads
   */
  getImageUrl(car: Car): string {
    // Try to get a photo from either photos or images array
    let photoPath = car.photos?.[0] || car.images?.[0];
    
    // Check if it's already a full URL (starts with http or https)
    if (photoPath && (photoPath.startsWith('http://') || photoPath.startsWith('https://'))) {
      return photoPath;
    }
    
    // If we have a photo path, use the FileUploadService to get the proper URL
    if (photoPath) {
      return this.fileUploadService.getCarImageUrl(photoPath);
    }
    
    // If car has a directory name but no photos, try to use that
    if (car.carDirName) {
      return this.fileUploadService.getCarImageUrl(`${car.carDirName}/photo-default.jpg`);
    }
    
    // If car has an ID, use that directly in the URL
    if (car._id || car.id) {
      const carId = car._id || car.id;
      const baseUrl = environment.apiUrl.split('/api')[0];
      return `${baseUrl}/uploads/${carId}.jpg`;
    }
    
    // Last resort fallback to a known image in the uploads folder
    console.log('Car photo fallback to known image for car:', car.id);
    return 'http://localhost:5000/uploads/1747396263436_2855267.jpg';
  }
}

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule]
})
export class SearchbarComponent {
  @Output() search = new EventEmitter<{ query: string; location: string }>();

  searchQuery: string = '';
  selectedLocation: string = '';
  locations: string[] = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'];
  categories: string[] = ['Sedan', 'SUV', 'Sports', 'Luxury'];

  // Icons
  faSearch = faSearch;
  faMapMarkerAlt = faMapMarkerAlt;

  onSearch() {
    this.search.emit({
      query: this.searchQuery,
      location: this.selectedLocation
    });
  }
}
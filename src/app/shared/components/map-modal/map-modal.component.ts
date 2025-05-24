import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-map-modal',
  standalone: true, // ⬅️ Important if it's a standalone component
  imports: [CommonModule], // ⬅️ Fixes the NG8103 warning
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.css']
})
export class MapModalComponent {
  @Input() show = false;
  @Output() locationSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  onLocationSelect(location: string) {
    this.locationSelected.emit(location);
  }

  onClose() {
    this.close.emit();
  }
} 
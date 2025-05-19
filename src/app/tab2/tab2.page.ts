import { Component } from '@angular/core';
import { RadioBrowserService } from '../services/radio-browser.service';
import { Router } from '@angular/router';
import { StreamingService } from '../services/streaming.service';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonThumbnail,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { addIcons } from 'ionicons';
import { searchOutline, radioOutline, chevronForward, chevronBack, arrowUp, arrowDown } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonIcon,
    IonSpinner,
    FormsModule,
    NgIf,
    NgFor,
    IonFooter,
    IonButtons,
    IonButton,
    IonSelect,
    IonSelectOption
  ]
})
export class Tab2Page {
  searchTerm: string = '';
  searchResults: any[] = [];
  isLoading: boolean = false;
  sortOrder: string = 'name';
  sortDirection: string = 'asc';
  treatAsWhole: boolean = true; // Neue Option für die gepaarte Suche

  constructor(
    private radioBrowserService: RadioBrowserService,
    private router: Router,
    private streamingService: StreamingService
  ) {
    addIcons({
      searchOutline,
      radioOutline,
      chevronForward,
      chevronBack,
      arrowUp,
      arrowDown
    });
  }

  itemsPerPage: number = 25;
  currentPage: number = 1;

  get totalPages(): number {
    return Math.ceil(this.searchResults.length / this.itemsPerPage);
  }

  get paginatedResults(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.searchResults.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onStationClick(station: any) {
    if (!station.id) {
      console.error('Station hat keine gültige ID:', station);
      station.id = 'station_' + station.name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now();
      console.log('Generierte ID für Station:', station.id);
    }

    this.streamingService.setCurrentStation(station);
    this.router.navigate(['/tabs/tab1']);
  }

  onSortChange() {
    this.onSearch();
  }

  onSortDirectionChange() {
    this.onSearch();
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.isLoading = true;
      this.currentPage = 1;

      console.log('Suche nach:', this.searchTerm);

      this.radioBrowserService.getSearchResults(this.searchTerm, this.sortOrder, this.sortDirection).subscribe(
        results => {
          this.searchResults = results;
          console.log('Gefundene Sender:', results.length);
          this.isLoading = false;
        },
        error => {
          console.error('Fehler bei der Suche:', error);
          this.isLoading = false;
        }
      );
    } else {
      this.searchResults = [];
    }
  }

  formatTags(tags: string | string[]): string {
    if (!tags) return '';

    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim()).join(', ');
    }

    if (Array.isArray(tags)) {
      return tags.join(', ');
    }

    return '';
  }
}

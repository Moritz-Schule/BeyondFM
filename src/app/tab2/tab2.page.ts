import {Component} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonIcon,
  IonList,
  IonLabel,
  IonThumbnail,
  IonSpinner, IonFooter, IonButtons, IonButton, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, radioOutline, chevronForward, chevronBack } from 'ionicons/icons';
import {RadioBrowserService} from "../services/radio-browser.service";
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { StreamingService } from '../services/streaming.service';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonIcon,
    IonList,
    IonLabel,
    IonThumbnail,
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

  constructor(
    private radioBrowserService: RadioBrowserService,
    private router: Router,
    private streamingService: StreamingService
  ) {
    addIcons({
      searchOutline,
      radioOutline,
      chevronForward,
      chevronBack
    });
  }

  // Paginierung
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
    this.streamingService.setCurrentStation(station);
    this.router.navigate(['/tabs/tab1']);
  }

  onSortChange() {
    this.onSearch(); // Neue Suche mit aktualisierter Sortierung
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.isLoading = true;
      this.currentPage = 1;
      this.radioBrowserService.getSearchResults(this.searchTerm, this.sortOrder).subscribe(
        results => {
          this.searchResults = results;
          this.isLoading = false;
          console.log('Gefundene Sender:', results);
        },
        error => {
          console.error('Fehler bei der Suche:', error);
          this.isLoading = false;
        }
      );
    }
  }

  formatTags(tags: string | string[]): string {
    if (!tags) return '';

    // Wenn tags ein String ist, splitte es an Kommas
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim()).join(', ');
    }

    // Wenn tags ein Array ist
    if (Array.isArray(tags)) {
      return tags.join(', ');
    }

    return '';
  }
}

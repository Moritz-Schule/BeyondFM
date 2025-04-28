import {Component, OnInit} from '@angular/core';
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
  IonSkeletonText,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, radioOutline } from 'ionicons/icons';
import {RadioBrowserService} from "../services/radio-browser.service";
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

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
    NgFor
  ]
})
export class Tab2Page {
  searchTerm: string = '';
  searchResults: any[] = [];
  isLoading: boolean = false;

  constructor(private radioBrowserService: RadioBrowserService) {
    addIcons({
      searchOutline,
      radioOutline
    });
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.isLoading = true;
      this.radioBrowserService.getSearchResults(this.searchTerm).subscribe(
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

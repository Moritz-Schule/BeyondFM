import { Component, OnInit } from '@angular/core';
import { DatabaseService, RadioStation } from '../services/database.service';
import { StreamingService } from '../services/streaming.service';
import { Router } from '@angular/router';
import {
  IonAvatar, IonButton,
  IonContent,
  IonHeader, IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonPopover,
  IonSelect,
  IonSelectOption, IonButtons
} from "@ionic/angular/standalone";
import {NgForOf, NgIf} from "@angular/common";
import { addIcons } from 'ionicons';
import { heart, heartOutline, listOutline, gridOutline, ellipsisVertical } from 'ionicons/icons';
import {FormsModule} from "@angular/forms";
import {HeaderComponent} from "../header/header.component";

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonHeader,
    IonContent,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonButton,
    IonIcon,
    NgForOf,
    NgIf,
    IonGrid,
    IonRow,
    IonCol,
    FormsModule,
    HeaderComponent
  ]
})
export class Tab3Page implements OnInit {
  favorites: RadioStation[] = [];
  viewMode: 'list' | 'grid' = 'list';

  constructor(
    private databaseService: DatabaseService,
    private streamingService: StreamingService,
    private router: Router
  ) {
    addIcons({ heart, heartOutline, listOutline, gridOutline, ellipsisVertical });
  }

  ngOnInit() {
    this.databaseService.favorites.subscribe(favs => {
      this.favorites = favs;
    });
  }

  playStation(station: RadioStation) {
    this.streamingService.setCurrentStation(station, 'library');
    this.streamingService.playStream(station.url);
    this.router.navigate(['/tabs/tab1']);
  }

  async removeFavorite(event: Event, stationId: string) {
    event.stopPropagation();
    await this.databaseService.removeFavorite(stationId);
  }

  handleImageError(event: any) {
    const img = event.target;
    if (img.naturalWidth < 100 || img.naturalHeight < 100) {
      img.src = './assets/radio-placeholder.jpg';
    }
  }

  onStationClick(station: any) {
    if (!station.id) {
      station.id = 'station_' + Date.now();
    }
    this.streamingService.setCurrentStation(station, 'library');
    this.router.navigate(['/tabs/tab1']);
  }

  changeViewMode(event: CustomEvent) {
    this.viewMode = event.detail.value;
  }
}

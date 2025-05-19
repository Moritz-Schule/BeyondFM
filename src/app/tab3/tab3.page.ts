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
  IonToolbar
} from "@ionic/angular/standalone";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonButton,
    IonIcon,
    NgForOf,
    NgIf
  ]
})

export class Tab3Page implements OnInit {
  favorites: RadioStation[] = [];

  constructor(
    private databaseService: DatabaseService,
    private streamingService: StreamingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.databaseService.favorites.subscribe(favs => {
      this.favorites = favs;
    });
  }

playStation(station: RadioStation) {
  // ID-Check sollte hier nicht mehr nötig sein, da die Favoriten bereits IDs haben sollten
  this.streamingService.setCurrentStation(station);
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
    console.error('Station hat keine gültige ID:', station);
    station.id = 'station_' + Date.now();
    console.log('Generierte ID für Station:', station.id);
  }

  this.streamingService.setCurrentStation(station);
  this.router.navigate(['/tabs/tab1']);
}
}

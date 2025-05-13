import { Component, OnInit } from '@angular/core';
import { RadioBrowserService } from '../services/radio-browser.service';
import {
  IonButton,
  IonCard, IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader, IonIcon,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";
import { HeaderComponent } from "../header/header.component";
import { addIcons } from 'ionicons';
import { playOutline, pauseOutline, heartOutline, heart } from 'ionicons/icons';
import {NgIf} from "@angular/common";
import {StreamingService} from "../services/streaming.service";
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, NgIf, IonIcon, HeaderComponent]
})
export class Tab1Page implements OnInit {
  serverUrl: string = '';
  radioStation: any = null;
  audio: HTMLAudioElement | null = null;
  isFavorite = false;

  constructor(
    private radioBrowserService: RadioBrowserService,
    private streamingService: StreamingService,
    private databaseService: DatabaseService
  ) {
    addIcons({ playOutline, pauseOutline, heartOutline, heart });
  }

  ionViewWillEnter() {
    // Prüfen und Aktualisieren der Station beim Betreten der Seite
    const selectedStation = this.streamingService.getCurrentStation();
    if (selectedStation) {
      this.radioStation = selectedStation;
      this.updateFavoriteStatus(); // Favoriten-Status aktualisieren
    }
  }

  ngOnInit() {
    this.serverUrl = this.radioBrowserService.getServerUrl();

    if (!this.serverUrl) {
      this.radioBrowserService.getRadiobrowserBaseUrlRandom().subscribe(url => {
        this.radioBrowserService.setServerUrl(url);
        this.serverUrl = url;
        // Nur eine zufällige Station laden, wenn keine ausgewählte Station existiert
        if (!this.streamingService.getCurrentStation()) {
          this.loadRandomStation();
        }
      });
    } else if (!this.streamingService.getCurrentStation()) {
      this.loadRandomStation();
    }
  }

  loadRandomStation() {
    this.radioBrowserService.getRandomStationFromAustria().subscribe(station => {
      if (station) {
        this.radioStation = station;
        console.log("Abspielender Sender:", station.name, station.url);
      } else {
        console.error("Keine Sender gefunden.");
      }
    });
  }

  radioInteract(url: string) {
    if(!this.isPlaying()){
      this.streamingService.playStream(url);
    } else {
      this.streamingService.pauseStream();
    }

  }

  isPlaying(){
    return this.streamingService.isPlaying();
  }

  handleImageError(event: any) {
    const img = event.target;
    if (img.naturalWidth < 100 || img.naturalHeight < 100) {
      img.src = './assets/radio-placeholder.jpg';
    }
  }

    // Existierende Methoden...

  async toggleFavorite() {
    if (!this.radioStation) return;

    if (await this.databaseService.isFavorite(this.radioStation.id)) {
      await this.databaseService.removeFavorite(this.radioStation.id);
      this.isFavorite = false;
    } else {
      await this.databaseService.addFavorite(this.radioStation);
      this.isFavorite = true;
    }
  }

  // Aktualisiere den Favoriten-Status, wenn sich die radioStation ändert
  async updateFavoriteStatus() {
    if (this.radioStation) {
      this.isFavorite = await this.databaseService.isFavorite(this.radioStation.id);
    }
  }

  // Andere Methoden...
}

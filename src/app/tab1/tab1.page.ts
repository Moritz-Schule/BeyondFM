import { Component, OnInit, OnDestroy } from '@angular/core';
import { RadioBrowserService } from '../services/radio-browser.service';
import {
  IonButton,
  IonCard, IonCardContent,
  IonCardHeader,
  IonCardTitle,
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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, NgIf, IonIcon, HeaderComponent]
})
export class Tab1Page implements OnInit, OnDestroy {
  serverUrl: string = '';
  radioStation: any = null;
  audio: HTMLAudioElement | null = null;
  isFavorite = false;
  private stationChangeSubscription: Subscription | null = null;

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

    // Abonnieren des stationChange-Observables, um auf Änderungen zu reagieren
    this.stationChangeSubscription = this.streamingService.stationChange$.subscribe(station => {
      if (station) {
        this.radioStation = station;
        this.updateFavoriteStatus(); // Favoriten-Status beim Senderwechsel aktualisieren
      }
    });
  }

  ngOnDestroy() {
    // Aufräumen des Abonnements, um Memory Leaks zu vermeiden
    if (this.stationChangeSubscription) {
      this.stationChangeSubscription.unsubscribe();
      this.stationChangeSubscription = null;
    }
  }

  loadRandomStation() {
    this.radioBrowserService.getRandomStationFromAustria().subscribe(station => {
      if (station) {
        this.radioStation = station;
        this.streamingService.setCurrentStation(station); // Station auch im Service setzen
        this.updateFavoriteStatus(); // Favoriten-Status aktualisieren
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

  async toggleFavorite() {
    if (!this.radioStation) {
      console.error('Keine Radiostation verfügbar für Favoriten-Toggle');
      return;
    }

    // Sicherstellen, dass die Station eine ID hat
    if (!this.radioStation.id) {
      this.radioStation.id = 'station_' + this.radioStation.name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now();
      console.log('ID für Station generiert:', this.radioStation.id);
    }

    const isFav = await this.databaseService.isFavorite(this.radioStation.id);

    if (isFav) {
      await this.databaseService.removeFavorite(this.radioStation.id);
      this.isFavorite = false;
      console.log('Favorit entfernt für:', this.radioStation.name, '(ID:', this.radioStation.id, ')');
    } else {
      await this.databaseService.addFavorite(this.radioStation);
      this.isFavorite = true;
      console.log('Favorit hinzugefügt für:', this.radioStation.name, '(ID:', this.radioStation.id, ')');
    }
  }

  async updateFavoriteStatus() {
    if (!this.radioStation) {
      this.isFavorite = false;
      return;
    }

    if (!this.radioStation.id) {
      this.radioStation.id = 'station_' + this.radioStation.name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now();
      console.log('ID für Station in updateFavoriteStatus generiert:', this.radioStation.id);
    }

    this.isFavorite = await this.databaseService.isFavorite(this.radioStation.id);
    console.log('Favoriten-Status aktualisiert für:', this.radioStation.name, '(ID:', this.radioStation.id, ')', 'Ist Favorit:', this.isFavorite);
  }
}


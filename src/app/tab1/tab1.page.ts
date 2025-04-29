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
import { playOutline, pauseOutline } from 'ionicons/icons';
import {NgIf} from "@angular/common";
import {StreamingService} from "../services/streaming.service";
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, NgIf, IonIcon, HeaderComponent]
})
export class Tab1Page implements OnInit {
  serverUrl: string = '';
  radioStation: any = null;
  audio: HTMLAudioElement | null = null;

  constructor(private radioBrowserService: RadioBrowserService, private streamingService: StreamingService) {
    addIcons({ playOutline, pauseOutline });
  }

  ngOnInit() {
    this.serverUrl = this.radioBrowserService.getServerUrl();

    if (!this.serverUrl) {
      this.radioBrowserService.getRadiobrowserBaseUrlRandom().subscribe(url => {
        this.radioBrowserService.setServerUrl(url);
        this.serverUrl = url;
        this.loadRandomStation();
      });
    } else {
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
    if (img.naturalWidth < 48 || img.naturalHeight < 48) {
      img.src = './assets/radio-placeholder.jpg';
    }
  }

}

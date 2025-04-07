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

import { addIcons } from 'ionicons';
import { playOutline } from 'ionicons/icons';
import {ExploreContainerComponent} from "../explore-container/explore-container.component";
import {NgIf} from "@angular/common";
import {StreamingService} from "../services/streaming.service";

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, NgIf, IonIcon]
})
export class Tab1Page implements OnInit {
  serverUrl: string = '';
  radioStation: any = null;
  audio: HTMLAudioElement | null = null;

  constructor(private radioBrowserService: RadioBrowserService, private streamingService: StreamingService) {
    addIcons({ playOutline });
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
      this.streamingService.playStream(url);
  }

}

import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StreamingService {
  private currentStation: any = null;
  private audio: HTMLAudioElement = new Audio();
  private stationChangeSubject = new Subject<any>();
  private stationSource: 'random' | 'search' | 'library' | null = null;

  constructor() {}

  get stationChange$() {
    return this.stationChangeSubject.asObservable();
  }

  setCurrentStation(station: any, source: 'random' | 'search' | 'library' = 'random') {
    if (station && !station.id) {
      station.id = 'station_' + station.name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now();
      console.log('Neue ID für Station generiert:', station.id);
    }

    this.currentStation = station;
    this.stationSource = source;
    this.stationChangeSubject.next(station);
  }

  getCurrentStationSource(): 'random' | 'search' | 'library' | null {
    return this.stationSource;
  }

  getCurrentStation() {
    return this.currentStation;
  }

  playStream(url: string) {
    this.audio.src = url;
    this.audio.load();
    this.audio.play();
  }

  pauseStream() {
    this.audio.pause();
  }

  isPlaying(): boolean {
    return !this.audio.paused;
  }


}



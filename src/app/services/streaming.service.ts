import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StreamingService {

  private audio: HTMLAudioElement = new Audio();

  constructor() {}

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

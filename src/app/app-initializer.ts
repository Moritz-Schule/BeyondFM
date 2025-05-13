import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class AppInitializer {
  constructor(private storage: Storage) {}

  async initialize() {
    try {
      const storage = await this.storage.create();
      console.log('Storage initialized', storage);
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }
}

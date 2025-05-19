import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  favicon?: string;
  // weitere Eigenschaften je nach Bedarf
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private _favorites = new BehaviorSubject<RadioStation[]>([]);
  private _storageReady = false;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    try {
      // Sicherstellen, dass Storage initialisiert ist
      if (!this._storageReady) {
        await this.storage.create();
        this._storageReady = true;
        console.log('Database service initialized storage');
      }

      await this.loadFavorites();
    } catch (error) {
      console.error('Fehler bei der Initialisierung des Speichers:', error);
      // Fallback auf leere Liste
      this._favorites.next([]);
    }
  }

  get favorites() {
    return this._favorites.asObservable();
  }

  private async loadFavorites() {
    try {
      if (!this._storageReady) {
        await this.init();
      }

      const favorites = await this.storage.get('favorites');
      this._favorites.next(favorites || []);
    } catch (error) {
      console.error('Fehler beim Laden der Favoriten:', error);
      this._favorites.next([]);
    }
  }

  async addFavorite(station: RadioStation) {
    try {
      if (!this._storageReady) {
        await this.init();
      }

      const favorites = this._favorites.value;
      const exists = favorites.some(fav => fav.id === station.id);

      if (!exists) {
        const newFavorites = [...favorites, station];
        await this.storage.set('favorites', newFavorites);
        this._favorites.next(newFavorites);
        console.log('Favorite added:', station.name);
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Favoriten:', error);
    }
  }

  async removeFavorite(stationId: string) {
    try {
      if (!stationId) {
        console.error('Ungültige Station-ID beim Entfernen eines Favoriten');
        return;
      }

      if (!this._storageReady) {
        await this.init();
      }

      const favorites = this._favorites.value;
      const newFavorites = favorites.filter(fav => fav.id !== stationId);

      await this.storage.set('favorites', newFavorites);
      this._favorites.next(newFavorites);
      console.log('Favorit entfernt, ID:', stationId);
    } catch (error) {
      console.error('Fehler beim Entfernen des Favoriten:', error);
    }
  }

  async isFavorite(stationId: string): Promise<boolean> {
    try {
      if (!stationId) {
        return false;
      }

      const favorites = this._favorites.value;
      if (!favorites || favorites.length === 0) {
        return false;
      }

      return favorites.some(fav => fav.id === stationId);
    } catch (error) {
      console.error('Fehler bei der Favoriten-Prüfung:', error);
      return false;
    }
  }
}

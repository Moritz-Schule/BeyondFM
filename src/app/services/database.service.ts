import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private initialized = false;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initializeDatabase() {
    if (this.initialized) {
      return;
    }

    try {
      const platform = Capacitor.getPlatform();
      if (platform === 'web') {
        await this.sqlite.initWebStore();
      }

      // Verbindung zur existierenden "BeyondFM" Datenbank herstellen
      const db = await this.sqlite.createConnection(
        'BeyondFM',
        false,
        'no-encryption',
        1,
        false
      );

      await db.open();

      // Tabelle für Favoriten erstellen, falls sie noch nicht existiert
      const schema = `
        CREATE TABLE IF NOT EXISTS favorites (
          station_uuid TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          added_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await db.execute(schema);
      this.db = db;
      this.initialized = true;
    } catch (error) {
      console.error('Fehler bei der Datenbankinitialisierung:', error);
      throw error;
    }
  }

  async addFavorite(station: { stationuuid: string; name: string; url: string; }) {
    await this.initializeDatabase();
    try {
      const query = `
        INSERT OR REPLACE INTO favorites (station_uuid, name, url)
        VALUES (?, ?, ?)
      `;
      return await this.db.run(query, [station.stationuuid, station.name, station.url]);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Favoriten:', error);
      throw error;
    }
  }

  async removeFavorite(uuid: string) {
    await this.initializeDatabase();
    try {
      const query = 'DELETE FROM favorites WHERE station_uuid = ?';
      return await this.db.run(query, [uuid]);
    } catch (error) {
      console.error('Fehler beim Entfernen des Favoriten:', error);
      throw error;
    }
  }

  async isFavorite(uuid: string): Promise<boolean> {
    await this.initializeDatabase();
    try {
      const query = 'SELECT COUNT(*) as count FROM favorites WHERE station_uuid = ?';
      const result = await this.db.query(query, [uuid]);
      return Boolean(result.values && result.values.length > 0 && result.values[0].count > 0);
    } catch (error) {
      console.error('Fehler beim Prüfen des Favoritenstatus:', error);
      return false;
    }
  }

  async getAllFavorites() {
    await this.initializeDatabase();
    try {
      const query = 'SELECT * FROM favorites ORDER BY added_at DESC';
      const result = await this.db.query(query);
      return result.values || [];
    } catch (error) {
      console.error('Fehler beim Abrufen der Favoriten:', error);
      return [];
    }
  }

  // Optional: Methode zum Testen der Datenbankverbindung
  async testConnection() {
    try {
      await this.initializeDatabase();
      const result = await this.db.query('SELECT sqlite_version() as version');
      if (result.values && result.values.length > 0) {
        console.log('SQLite Version:', result.values[0].version);
      }
      return true;
    } catch (error) {
      console.error('Datenbankverbindungstest fehlgeschlagen:', error);
      return false;
    }
  }
}

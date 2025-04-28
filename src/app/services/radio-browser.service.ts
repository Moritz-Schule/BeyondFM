import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RadioBrowserService {
  private serverUrl: string = ''; // Hier speichern wir die Server-URL

  constructor(private http: HttpClient) {
  }

  /**
   * Ruft die Liste aller verfügbaren Server ab.
   * @returns Observable<string[]> - Eine Liste von Server-URLs.
   */
  getRadiobrowserBaseUrls(): Observable<string[]> {
    const url = 'http://all.api.radio-browser.info/json/servers';
    return this.http.get<any[]>(url).pipe(
      map((response) => {
        return response.map(x => 'https://' + x.name);
      })
    );
  }

  /**
   * Ruft die Server-Konfiguration eines bestimmten Servers ab.
   * @param baseurl - Die Basis-URL des Servers.
   * @returns Observable<any> - Die Server-Konfiguration.
   */
  getRadiobrowserServerConfig(baseurl: string): Observable<any> {
    const url = `${baseurl}/json/config`;
    return this.http.get<any>(url);
  }

  /**
   * Setzt die gespeicherte Server-URL.
   * @param url - Die URL des Servers.
   */
  setServerUrl(url: string): void {
    this.serverUrl = url;
  }

  /**
   * Ruft die gespeicherte Server-URL ab.
   * @returns string - Die aktuelle Server-URL.
   */
  getServerUrl(): string {
    console.log("Server Url: ", this.serverUrl);
    return this.serverUrl;
  }

  /**
   * Überprüft, ob ein Server erreichbar ist.
   * @param baseurl - Die Basis-URL des Servers.
   * @returns Observable<boolean> - Gibt 'true' zurück, wenn der Server erreichbar ist.
   */
  checkServerAvailability(baseurl: string): Observable<boolean> {
    return this.http.get(`${baseurl}/json/config`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Ruft zufällig einen verfügbaren Radio-Browser-Server ab und prüft, ob er erreichbar ist.
   * @returns Observable<string> - Eine zufällige Server-URL.
   */
  getRadiobrowserBaseUrlRandom(): Observable<string> {
    return this.getRadiobrowserBaseUrls().pipe(
      map((hosts) => {
        const randomIndex = Math.floor(Math.random() * hosts.length);
        const randomHost = hosts[randomIndex];

        // Überprüfen, ob der zufällige Server erreichbar ist
        this.checkServerAvailability(randomHost).subscribe(isAvailable => {
          if (isAvailable) {
            this.setServerUrl(randomHost); // Speichern der URL, wenn sie erreichbar ist
          } else {
            console.log(`Server ${randomHost} ist nicht erreichbar.`);
          }
        });

        return randomHost;
      })
    );
  }

  /**
   * Holt eine Liste aller Radiosender aus Österreich.
   */
  getStationsFromAustria(): Observable<any[]> {
    const url = `${this.getServerUrl()}/json/stations/bycountry/Austria`;
    return this.http.get<any[]>(url).pipe(
      catchError(error => {
        console.error("Fehler beim Abrufen der Radiosender:", error);
        return of([]); // Leeres Array zurückgeben bei Fehler
      })
    );
  }

  /**
   * Holt einen zufälligen Sender aus Österreich.
   */
  getRandomStationFromAustria(): Observable<any> {
    return this.getStationsFromAustria().pipe(
      map(stations => {
        if (stations.length === 0) {
          return null; // Falls keine Sender verfügbar sind
        }
        const randomIndex = Math.floor(Math.random() * stations.length);
        return stations[randomIndex];
      })
    );
  }

  /**
   * Sucht nach Radiosendern basierend auf einem Suchbegriff.
   * @param searchTerm - Der Suchbegriff für die Radiosuche
   * @returns Observable<any[]> - Eine Liste der gefundenen Radiosender
   */
  getSearchResults(searchTerm: string): Observable<any[]> {
    if (!this.serverUrl) {
      // Wenn keine Server-URL gesetzt ist, zuerst einen Server abrufen
      return this.getRadiobrowserBaseUrlRandom().pipe(
        switchMap(baseUrl => {
          const encodedSearchTerm = encodeURIComponent(searchTerm.trim());
          const url = `${baseUrl}/json/stations/byname/${encodedSearchTerm}`;
          return this.http.get<any[]>(url);
        }),
        catchError(error => {
          console.error("Fehler beim Abrufen der Radiosender:", error);
          return of([]);
        })
      );
    }

    const encodedSearchTerm = encodeURIComponent(searchTerm.trim());
    const url = `${this.serverUrl}/json/stations/byname/${encodedSearchTerm}`;

    return this.http.get<any[]>(url).pipe(
      catchError(error => {
        console.error("Fehler beim Abrufen der Radiosender:", error);
        return of([]);
      })
    );
  }
}

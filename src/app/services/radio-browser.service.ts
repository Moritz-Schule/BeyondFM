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

  getRadiobrowserBaseUrls(): Observable<string[]> {
    const url = 'https://all.api.radio-browser.info/json/servers';
    return this.http.get<any[]>(url).pipe(
      map((response) => {
        return response.map(x => 'https://' + x.name);
      })
    );
  }

  getRadiobrowserServerConfig(baseurl: string): Observable<any> {
    const url = `${baseurl}/json/config`;
    return this.http.get<any>(url);
  }

  setServerUrl(url: string): void {
    this.serverUrl = url;
  }

  getServerUrl(): string {
    console.log("Server Url: ", this.serverUrl);
    return this.serverUrl;
  }

  checkServerAvailability(baseurl: string): Observable<boolean> {
    return this.http.get(`${baseurl}/json/config`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getRadiobrowserBaseUrlRandom(): Observable<string> {
    return this.getRadiobrowserBaseUrls().pipe(
      map((hosts) => {
        const randomIndex = Math.floor(Math.random() * hosts.length);
        const randomHost = hosts[randomIndex];

        this.checkServerAvailability(randomHost).subscribe(isAvailable => {
          if (isAvailable) {
            this.setServerUrl(randomHost);
          } else {
            console.log(`Server ${randomHost} ist nicht erreichbar.`);
          }
        });

        return randomHost;
      })
    );
  }

  getStationsFromAustria(): Observable<any[]> {
    const url = `${this.getServerUrl()}/json/stations/bycountry/Austria`;
    return this.http.get<any[]>(url).pipe(
      catchError(error => {
        console.error("Fehler beim Abrufen der Radiosender:", error);
        return of([]);
      })
    );
  }

  getRandomStationFromAustria(): Observable<any> {
    return this.getStationsFromAustria().pipe(
      map(stations => {
        if (stations.length === 0) {
          return null;
        }
        const randomIndex = Math.floor(Math.random() * stations.length);
        return stations[randomIndex];
      })
    );
  }

  getAllStations(sortOrder: string = 'name', sortDirection: string = 'asc'): Observable<any[]> {
    const isReverse = sortDirection === 'desc' ? 'true' : 'false';

    if (!this.serverUrl) {
      return this.getRadiobrowserBaseUrlRandom().pipe(
        switchMap(baseUrl => {
          return this.http.get<any[]>(`${baseUrl}/json/stations`, {
            params: {
              order: sortOrder,
              reverse: isReverse,
              limit: '1000',
              hidebroken: 'true'
            }
          }).pipe(
            catchError(error => {
              console.error("Fehler beim Abrufen aller Radiosender:", error);
              return of([]);
            })
          );
        })
      );
    }

    return this.http.get<any[]>(`${this.serverUrl}/json/stations`, {
      params: {
        order: sortOrder,
        reverse: isReverse,
        limit: '1000',
        hidebroken: 'true'
      }
    }).pipe(
      catchError(error => {
        console.error("Fehler beim Abrufen aller Radiosender:", error);
        return of([]);
      })
    );
  }

  getSearchResults(searchTerm: string, sortOrder: string = 'name', sortDirection: string = 'asc', treatAsWhole: boolean = false): Observable<any[]> {
    const isReverse = sortDirection === 'desc' ? 'true' : 'false';

    if (!searchTerm.trim()) {
      return of([]);
    }

    if (!this.serverUrl) {
      return this.getRadiobrowserBaseUrlRandom().pipe(
        switchMap(baseUrl => {
          return this.performSearch(baseUrl, searchTerm, sortOrder, isReverse);
        })
      );
    }

    return this.performSearch(this.serverUrl, searchTerm, sortOrder, isReverse);
  }

  private performSearch(baseUrl: string, searchTerm: string, sortOrder: string, isReverse: string): Observable<any[]> {
    const normalizedSearchTerm = searchTerm.trim();
    const encodedSearchTerm = encodeURIComponent(normalizedSearchTerm);

    console.log(`Suche nach "${normalizedSearchTerm}" (kodiert: ${encodedSearchTerm})`);

    return this.searchByName(baseUrl, encodedSearchTerm, sortOrder, isReverse).pipe(
      switchMap(results => {
        if (results && results.length > 0) {
          return of(results);
        }

        const alternativeSearchTerm = this.normalizeString(normalizedSearchTerm);
        if (alternativeSearchTerm !== normalizedSearchTerm) {
          console.log('Versuche alternative Suche ohne Umlaute:', alternativeSearchTerm);
          return this.searchByName(baseUrl, encodeURIComponent(alternativeSearchTerm), sortOrder, isReverse);
        }

        return of([]);
      }),
      catchError(error => {
        console.error("Fehler beim Abrufen der Radiosender:", error);
        return of([]);
      })
    );
  }

  private searchByName(baseUrl: string, encodedSearchTerm: string, sortOrder: string, isReverse: string): Observable<any[]> {
    const url = `${baseUrl}/json/stations/search`;

    return this.http.get<any[]>(url, {
      params: {
        name: encodedSearchTerm,
        order: sortOrder,
        reverse: isReverse,
        limit: '100',
        codec: 'mp3'
      }
    }).pipe(
      catchError(error => {
        console.error(`Fehler bei Suche nach Namen "${encodedSearchTerm}":`, error);
        return of([]);
      })
    );
  }

  private normalizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[äÄ]/g, 'a')
      .replace(/[öÖ]/g, 'o')
      .replace(/[üÜ]/g, 'u')
      .replace(/[ß]/g, 'ss');
  }
}

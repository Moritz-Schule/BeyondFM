import {Component} from '@angular/core';
import {IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonIcon} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {searchOutline} from 'ionicons/icons';
import {RadioBrowserService} from "../services/radio-browser.service";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonIcon, FormsModule, NgIf]
})
export class Tab2Page /*implements OnInit*/ {
  searchTerm: string = '';
  searchResults: any[] = [];


  constructor(private radioBrowserService: RadioBrowserService) {
    addIcons({
      searchOutline
    });
  }

  /*ngOnInit() {

    this.radioBrowserService.getSearchResults('radio wien').subscribe(
      results => {
        console.log('Gefundene Sender:', results);
      }
    );
  }*/

  onSearch() {
    if (this.searchTerm.trim()) {
      this.radioBrowserService.getSearchResults(this.searchTerm).subscribe(
        results => {
          this.searchResults = results;
          console.log('Gefundene Sender:', results);
        }
      );
    }

  }
}

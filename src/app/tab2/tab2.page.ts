import {Component, OnInit} from '@angular/core';
import {IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonIcon} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';
import {RadioBrowserService} from "../services/radio-browser.service";


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonIcon]
})
export class Tab2Page implements OnInit{

  constructor(private radioBrowserService: RadioBrowserService ) {
    addIcons({
      searchOutline
    });
  }

  ngOnInit() {

    this.radioBrowserService.getSearchResults('radio wien').subscribe(
      results => {
        console.log('Gefundene Sender:', results);
      }
    );
  }

}

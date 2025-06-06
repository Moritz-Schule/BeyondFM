import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, searchOutline, libraryOutline } from 'ionicons/icons';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, AsyncPipe]
})
export class TabsPage {
  selectedTab$ = new BehaviorSubject<string>('tab1');

  constructor() {
    addIcons({ homeOutline, searchOutline, libraryOutline });
  }

  ionTabsDidChange(event: { tab: string }) {
    this.selectedTab$.next(event.tab);
  }
}

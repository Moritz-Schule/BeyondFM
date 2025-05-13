import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AppInitializer } from './app-initializer';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private appInitializer: AppInitializer) {}

  async ngOnInit() {
    await this.appInitializer.initialize();
  }
}

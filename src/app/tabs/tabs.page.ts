import { Component, inject } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { leafOutline, schoolOutline, settingsOutline } from 'ionicons/icons';
import { I18n } from '../services/i18n.service';

@Component({
  selector: 'app-tabs',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="cards">
          <ion-icon name="leaf-outline"></ion-icon>
          <ion-label>{{ t('tabs.cards') }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="learn">
          <ion-icon name="school-outline"></ion-icon>
          <ion-label>{{ t('tabs.learn') }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="settings">
          <ion-icon name="settings-outline"></ion-icon>
          <ion-label>{{ t('tabs.settings') }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  readonly t = inject(I18n).t;

  constructor() {
    addIcons({ leafOutline, schoolOutline, settingsOutline });
  }
}

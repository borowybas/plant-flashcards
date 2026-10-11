import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { BackupService } from './services/backup.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    // Apply the saved theme color right away.
    inject(ThemeService);
    // Remove backup files left over from previous exports.
    inject(BackupService).cleanup();
  }
}

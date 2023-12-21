import { Component } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { DetailService } from './detail/detail-service/detail.service';
import { ErrorDialogService } from './detail/ErrorDialogService/error-dialog.service';
import { SplashAnimationType } from './shared/components/splash-screen/splash-animation-type';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  splashAnimationType = SplashAnimationType;
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    public appservice: DetailService,
    public errorDialogService: ErrorDialogService
  ) {
    this.translate.setDefaultLang('en');

    if (electronService.isElectron) {
    } else {
      ('Run in browser');
    }
  }
  onResize(event) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    event.target.innerWidth;
  }
}

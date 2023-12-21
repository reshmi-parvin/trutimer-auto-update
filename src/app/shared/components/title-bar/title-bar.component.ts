import { Component, NgZone, OnInit } from '@angular/core';
import { DetailService } from '../../../detail/detail-service/detail.service';
import { NavigationEnd, Router } from '@angular/router';
import { ElectronService } from '../../../core/services/electron/electron.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-title-bar',
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.scss']
})
export class TitleBarComponent implements OnInit {

  constructor(private electronService: ElectronService,
    private ngZone: NgZone,
    private router: Router,
    public appservice: DetailService,
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      // Update the title bar based on the current route
      this.updateTitleBar();
    });
  }

  ngOnInit(): void {
    this.updateTitleBar();
  }
  private updateTitleBar(): void {
    const currentRouteTitle = this.router.url;
    // console.log('currentRouteTitle: ', currentRouteTitle);
    if(currentRouteTitle === '/detail/dashboard'){
      this.appservice.isDashboard = true;
    }
    else{
      this.appservice.isDashboard = false;
    }
  }
}

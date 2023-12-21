import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import isElectron from 'is-electron';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router,
    private electronService: ElectronService) { }

  ngOnInit(): void {
    if (isElectron()) {
      this.windowCloseHandlerHome();
    }
  }
  windowCloseHandlerHome() {
    if (isElectron()) {
      this.electronService.ipcRenderer.on('login_app_quit', () => {
          this.electronService.ipcRenderer.send('windowCloseHandler');
      });
    }
  }
}

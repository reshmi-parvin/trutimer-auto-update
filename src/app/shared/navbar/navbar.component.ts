import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import isElectron from 'is-electron';
import { DetailService } from '../../detail/detail-service/detail.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public sidebarOpened = false;
  userDetail;
  closeResult = '';
  manageAccountForm: FormGroup;

  @ViewChild('livevideo') video: ElementRef;
  @ViewChild('screenshot') canvas: ElementRef;

  toggleOffcanvas() {
    this.sidebarOpened = !this.sidebarOpened;
    if (this.sidebarOpened) {
      document.querySelector('.sidebar-offcanvas').classList.add('active');
    } else {
      document.querySelector('.sidebar-offcanvas').classList.remove('active');
    }
  }
  constructor(config: NgbDropdownConfig,
    private router: Router,
    private modalService: NgbModal,
    private appservice: DetailService) {
    this.manageAccountForm = new FormGroup({
      name: new FormControl(),
      email: new FormControl(),
      phoneNo: new FormControl()
    });
    config.placement = 'bottom-right';
  }
  ngOnInit() {
    this.userDetail = JSON.parse(localStorage.getItem('user_detail'));
    this.manageAccountForm.patchValue({
      name: this.userDetail.userName,
      email: this.userDetail.email,
      phoneNo: this.userDetail.phoneNumber
    });
  }
  takeDesktopScreenshot() {
    if (isElectron()) {
      // Create canvas
      const canvas = this.canvas.nativeElement;
      const ctx = canvas.getContext('2d');
      // Draw video on canvas

      // HEIGHT AND WIDTH OF SCREENSHOT
      canvas.width = 1920;
      canvas.height = 1080;

      ctx.drawImage(this.video.nativeElement, 0, 0, canvas.width, canvas.height);
      this.appservice.base64EncodedImage = canvas.toDataURL('image/png');
    } else {
      // alert("sorry...can't take screenshot in web application");
    }
  }

}

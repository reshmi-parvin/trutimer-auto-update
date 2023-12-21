declare global {
  interface Window {
    require: any;
  }
}
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { APP_CONFIG } from '../../../environments/environment';
import { DetailService } from '../../detail/detail-service/detail.service';
import { HomeService } from '../home-services/home.service';
import { DomSanitizer } from '@angular/platform-browser';
import isElectron from 'is-electron';
//import { environment } from "../../../environments/environment";
import moment from 'moment';
// import * as Sentry from '@sentry/angular-ivy';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Login } from '../model/authResponse.model';
import { UserProfileResponse, UserApiResponse, EmptyResponse } from '../../detail/model/AllResponse.model';
import { GetAllResponse } from '../../detail/model/GetAllResponse.model'
const packageJson = require('../../../../package.json');
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild('minimumVersion') modalVersion: TemplateRef<any>;
  loginForm: FormGroup;
  isLoading = false;
  submitted = false;
  messages = '';
  issue: string;
  showButton = false;
  showEye = false;
  visability = false;
  elememtVisible = false;
  openModal = false;
  minimumVersion: number;
  minVersion;
  displayedImage = './assets/images/tracker_time_dr.png';
  logoImage = './assets/images/logo_login.png';
  year = moment().year();
  manageUrlForm: FormGroup;
  isApiKeyIntegrated: boolean;
  closeResult = '';
  settingsUrl = 'gggggg';
  currentVersion: number;
  isValid = false;
  version;
  details = '';
  constructor(
    private authservice: HomeService,
    private router: Router,
    public appservice: DetailService,
    private sanitizer: DomSanitizer,
    private electronService: ElectronService,
    private modalService: NgbModal
  ) {
    this.appservice.moment = moment();
    this.version = 'v' + packageJson.version;
  }
  ngOnInit(): void {
    //localStorage.setItem("dynamicBaseURL", 'https://api.trutimer.com');
    if (isElectron()) {
      this.windowCloseHandlerLogin();
    }
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      rememberme: new FormControl(false),
    });
    this.manageUrlForm = new FormGroup({
      url: new FormControl(
        localStorage.getItem('dynamicBaseURL')
          ? localStorage.getItem('dynamicBaseURL')
          : '',
        [Validators.required]
      ),
    });
    const rememberme = localStorage.getItem('rememberme');
    if (rememberme === 'true') {
      this.loginForm.get('rememberme').setValue(rememberme);
      const usernameOrEmailAddress = localStorage.getItem(
        'usernameOrEmailAddress'
      );
      const userpassword = localStorage.getItem('password');
      this.loginForm.get('email').setValue(usernameOrEmailAddress);
      this.loginForm.get('password').setValue(userpassword);

      // Auto login
      const obj = {
        usernameOrEmailAddress: this.loginForm.get('email').value,
        password: this.loginForm.get('password').value,
        tenancyName: APP_CONFIG.tenancyName,
      };
      this.authservice.userAction = 'login';
    }
    this.appservice.projects = [];
    this.appservice.issues = [];
    this.appservice.activeProjectId = '';
    this.appservice.today = moment
      .utc(this.appservice.moment.format())
      .format('YYYY/MM/DD');
  }
  windowCloseHandlerLogin() {
    if (isElectron()) {
      this.electronService.ipcRenderer.on('login_app_quit', () => {
          this.electronService.ipcRenderer.send('windowCloseHandler');
      });
    }
  }
  open(content) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
        }
      );
  }
  saveUrl() {
    localStorage.setItem('dynamicBaseURL', this.manageUrlForm.get('url').value);
    this.modalService.dismissAll();
  }
  get settings() {
    return this.manageUrlForm.controls;
  }
  get f() {
    return this.loginForm.controls;
  }
  async onHandleSubmit() {
    this.submitted = true;
    this.isLoading = true;
    if (this.loginForm.invalid) {
      this.isLoading = false;
      return;
    }
    const obj = {
      usernameOrEmailAddress: this.loginForm.get('email').value,
      password: this.loginForm.get('password').value,
      tenancyName: APP_CONFIG.tenancyName,
    };
    this.authservice.userAction = 'login';

    try {
      const res: Login = await this.authservice.login(obj);

      if (res.success) {
        //localStorage.setItem('user_login', 'true');
        const rm = this.loginForm.get('rememberme').value;
        if (rm) {
          localStorage.setItem('rememberme', rm);
          localStorage.setItem(
            'usernameOrEmailAddress',
            obj.usernameOrEmailAddress
          );
          localStorage.setItem('password', obj.password);
        } else {
          localStorage.setItem('rememberme', rm);
          localStorage.setItem('usernameOrEmailAddress', '');
          localStorage.setItem('password', '');
        }

        localStorage.setItem('user_id', res.result.userDetails.id.toString());

        this.appservice.isLoginPage = true;
        localStorage.setItem(
          'access_token',
          res.result.authenticateResult.accessToken
        );
        localStorage.setItem(
          'user_detail',
          JSON.stringify(res.result.userDetails)
        );
        localStorage.setItem(
          'user_settings',
          JSON.stringify(res.result.settings)
        );
        this.permission();
      }
    } catch (err) {
      this.isLoading = false;
      this.appservice.isLoginPage = false;

      setTimeout(() => {
        if (err && err.error && err.error.error) {
          this.messages = err.error.error.message;
          this.details = err.error.error.details;
          this.openModal = true;
          this.visability = true;
          this.isLoading = false;
          this.appservice.isLoginPage = false;
        }
      }, 2000);
      // Sentry.captureException(err);
    }
  }
  async permission() {
    const res: GetAllResponse = await this.appservice.getPermission();
    localStorage.setItem(
      'settings',
      JSON.stringify(res.result.auth.grantedPermissions)
    );
    this.minimumVersion = +res.result.setting.values[
      'Abp.TrackingManagement.ApplicationVersion'
    ]
      .split('.')
      .join('');
    this.minVersion = res.result.setting.values[
      'Abp.TrackingManagement.ApplicationVersion'
    ];
    this.getUserProfile();
  };
  async getUserProfile() {
    if (!this.appservice.getProfileLoading) {
      this.appservice.getProfileLoading = true;
      const res: UserProfileResponse = await this.appservice.getProfile();
      localStorage.setItem(
        'profile_picture',
        JSON.stringify(res.result.profilePicture)
      );
      this.appservice.userDetailsData = JSON.parse(localStorage.getItem('user_detail'));
      this.appservice.profilePicture = JSON.parse(localStorage.getItem('profile_picture'));
      this.appservice.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(this.appservice.profilePicture);
      this.appservice.profileImage = this.appservice.imageSource;
      this.appservice.userProfileName = this.appservice.userDetailsData.userName;
      this.currentVersion = +packageJson.version.split('.').join('');
      if (packageJson.version.localeCompare
        (this.minVersion, undefined, {
          numeric: true,
          sensitivity: 'base',
        }) >= 0
      ) {
        this.router.navigate(['/detail/dashboard']);
      }
      else {
        this.issue =
          'Version ' +
          this.minVersion +
          ' is now available, you have ' +
          packageJson.version;
        this.modalService.open(this.modalVersion);
        this.isLoading = false;
      }
      this.appservice.getProfileLoading = false;
    }
  }
  forgotPassword() {
    this.electronService.shell.openExternal(
      'https://trutimer.com/account/forgot-password'
    );
    if (isElectron()) {
      this.electronService.ipcRenderer.on('minimize', () => { });
    }
    this.electronService.ipcRenderer.send(
      'minimize',
      true,
    );
  }
  showPassword() {
    this.showButton = !this.showButton;
    this.showEye = !this.showEye;
  }
  async getUserApiKeys() {
    if (!this.appservice.getUserApiKeysLoading) {
      this.appservice.getUserApiKeysLoading = true;
      const res: UserApiResponse | EmptyResponse = await this.appservice.getUserApiKeys();
      if (res.result.length > 0) {
        this.isApiKeyIntegrated = true;
      } else {
        this.isApiKeyIntegrated = false;
      }
      this.appservice.getUserApiKeysLoading = false;
    }
  }

  toggleRemember() {
    this.loginForm
      .get('rememberme')
      .setValue(!this.loginForm.get('rememberme').value);
  }
  hideErrorMessage() {
    this.isValid = false;
  }
  handleClose() {
    this.openModal = false;
  }
}


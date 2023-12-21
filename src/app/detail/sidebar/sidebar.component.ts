import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import moment from 'moment';
import { Router } from '@angular/router';
import { BrowserWindow } from 'electron';
import { DasboardComponent } from '../dasboard/dasboard.component';
import { DomSanitizer } from '@angular/platform-browser';
import { DetailService } from '../detail-service/detail.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import * as Sentry from '@sentry/angular-ivy';
import { RecentTasks, UserProfileResponse } from '../model/AllResponse.model';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  year = moment().year();
  @Input() toggledBar = '';
  @Output() newSidebarStatus = new EventEmitter<object>();
  smallToggled = true;
  userDetail;
  profilepic;
  imageSource;
  closeResult = '';
  manageAccountForm: FormGroup;
  myGroup: FormGroup;
  signoutscreenshot = false;
  isDarkMode = false;
  pic;
  // eslint-disable-next-line id-blacklist
  string;
  win: BrowserWindow = null;
  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    public appservice: DetailService,
    public modalService: NgbModal,
    private formBuilder: FormBuilder,
    public dashboardComponent: DasboardComponent,
  ) {
    // this.manageAccountForm = this.formBuilder.group({
    //   name: new FormControl(),
    //   email: new FormControl(),
    // });
    this.myGroup = new FormGroup({
      name: new FormControl(),
      email: new FormControl(),
    });
  }

  async ngOnInit() {
    this.appservice.userProfileName = this.appservice.userDetailsData.userName;
    this.myGroup.patchValue({
      name: this.appservice.userProfileName,
      email: this.appservice.userDetailsData.email,
    });
    const acc = document.getElementsByClassName('accordion');
    let i;
    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener('click', function() {
        this.classList.toggle('active');
        const panel = this.nextElementSibling;
        if (panel.style.display === 'block') {
          panel.style.display = 'none';
        } else {
          panel.style.display = 'block';
        }
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
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
    setTimeout(() => {
      this.closeModal();
    }, 30000);
  }
  closeModal() {
    this.modalService.dismissAll();
  }
  modalSignout(mySignout) {
    this.modalService
      .open(mySignout, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
    setTimeout(() => {
      this.closeModal();
    }, 30000);
  }

  async takeScreenshotSignout() {
    this.dashboardComponent.timerstart(
      'stop',
      this.appservice.lastTrackDtl.lastTaskID,
      this.appservice.activeIssueName,
      this.appservice.activeProjectName,
      this.appservice.activeProjectId,
      this.appservice.activeBaseUrlId
    ).then(() => {
      setTimeout(() => {
        this.signout();
      }, 4000);

    });
  }
  async refresh() {
    if (this.appservice.runningIssueId) {

      this.dashboardComponent.timerstart(
        'stop',
        this.appservice.lastTrackDtl.lastTaskID,
        this.appservice.activeIssueName,
        this.appservice.activeProjectName,
        this.appservice.activeProjectId,
        this.appservice.activeBaseUrlId
      )
        .then(async () => {
          localStorage.removeItem('projects');
          localStorage.removeItem('running_Issue_track_time');
          localStorage.removeItem('user_profile_picture');
          localStorage.removeItem('profile_picture');
          this.appservice.setEmptyProjects();
          this.appservice.setEmptyIssue();
          this.appservice.selectedIssueId = null;
          this.appservice.selectedIssueName = null;
          this.appservice.activeProjectName = null;
          this.appservice.activeProjectId = null;
          //this.appservice.showTopDiv = false;
          this.appservice.totalTimeWorked = null;
          this.appservice.activeTimerValue = '00:00:00';
          this.appservice.runningIssueTrackTime = '00:00:00';
          this.appservice.selectedIssueTrackedTime = '00:00:00';
          this.appservice.runningIssueId = null;
          this.appservice.timerArr = [];
          this.appservice.userTimerRecord = [];
          this.appservice.currentDate = undefined;
          this.appservice.totalTimeWorked = '00:00:00';
          this.appservice.offset = 0;
          this.appservice.searchBy = '';
          this.appservice.searchByProj = '';
          this.appservice.settingSource = [];
          this.getUserProfile();
          await this.dashboardComponent.getAllSource();
          await this.dashboardComponent.getProjects(this.appservice.lastSourceCode);
          //this.dashboardComponent.getProjects(this.appservice.lastSourceCode);
          setTimeout(async () => {
            await this.dashboardComponent.getIssueListOnPageLoad();
          }, 5000);
        });
    }
    else {
      this.appservice.offset = 0;
      localStorage.removeItem('projects');
      localStorage.removeItem('running_Issue_track_time');
      localStorage.removeItem('user_profile_picture');
      localStorage.removeItem('profile_picture');
      this.appservice.setEmptyProjects();
      this.appservice.selectedIssueId = null;
      this.appservice.selectedIssueName = null;
      this.appservice.activeProjectName = null;
      this.appservice.activeProjectId = null;
      this.appservice.totalTimeWorked = null;
      //this.appservice.showTopDiv = false;
      this.appservice.totalTimeWorked = '00:00:00';
      this.appservice.activeTimerValue = '00:00:00';
      this.appservice.runningIssueTrackTime = '00:00:00';
      this.appservice.selectedIssueTrackedTime = '00:00:00';
      this.appservice.runningIssueId = null;
      this.appservice.timerArr = [];
      this.appservice.userTimerRecord = [];
      this.appservice.currentDate = undefined;
      this.appservice.searchBy = '';
      this.appservice.searchByProj = '';
      await this.dashboardComponent.getAllSource();
      await this.dashboardComponent.getProjects(this.appservice.lastSourceCode);
      setTimeout(async () => {
        await this.dashboardComponent.getIssueListOnPageLoad();
      }, 5000);
      this.getUserProfile();
    }
  }
  onItemClick(projectId, taskId, sourceCode, projectName, baseUrlId) {
    this.router.navigate(['/detail/dashboard']);
    setTimeout(() => {
      this.dashboardComponent.selectTasksFromRecentTasks(projectId, taskId,
        sourceCode,
        projectName,
        baseUrlId);
    }, 5000);
  }
  async getUserProfile() {
    if (!this.appservice.getProfileLoading) {
      this.appservice.getProfileLoading = true;
      const res: UserProfileResponse = await this.appservice.getProfile();
      localStorage.setItem(
        'profile_picture',
        JSON.stringify(res.result.profilePicture)
      );
      this.appservice.userDetailsData = JSON.parse(localStorage.getItem('user_detail'));
      this.appservice.profilePicture = JSON.stringify(localStorage.getItem('profile_picture'));
      this.appservice.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(this.appservice.profilePicture);
      this.appservice.profileImage = this.appservice.imageSource;
      this.appservice.getProfileLoading = false;
    }
  }
  signout() {
    try{
      this.appservice.currentDate = moment.utc().format();
    this.appservice.isLoginPage = false;
    this.appservice.stopTimmer();
    // CLEAR ALL THE TIMER INSTANCE
    localStorage.setItem('user_login', 'false');
    localStorage.removeItem('user_id');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_detail');
    localStorage.removeItem('user_settings');
    localStorage.removeItem('userSourceCode');
    localStorage.removeItem('projects');
    localStorage.removeItem('running_Issue_track_time');
    localStorage.removeItem('user_profile_picture');
    localStorage.removeItem('profile_picture');
    localStorage.removeItem('dynamicBaseURL');
    this.appservice.setEmptyProjects();
    this.appservice.setEmptyIssue();
    this.appservice.selectedIssueId = null;
    this.appservice.selectedIssueName = null;
    this.appservice.activeProjectName = null;
    this.appservice.activeProjectId = null;
    this.appservice.selectedIssueTrackedTime = null;
    this.appservice.selectedIssueTrackedTime = null;
    this.appservice.totalTimeWorked = null;
    this.appservice.showTopDiv = false;
    this.appservice.totalTimeWorked = '00:00:00';
    this.appservice.activeTimerValue = '00:00:00';
    this.appservice.runningIssueTrackTime = '00:00:00';
    this.appservice.selectedIssueTrackedTime = '00:00:00';
    this.appservice.runningIssueId = null;
    this.appservice.timerArr = [];
    this.appservice.userTimerRecord = [];
    this.appservice.currentDate = undefined;
    if (this.appservice.checkInactiveUser) {
      this.appservice.checkInactiveUser.unsubscribe();
    }
    this.router.navigate(['/home']);
    }
    catch(err){
      // Sentry.captureException(err);
    }
  }

  public toggleField() {
    this.newSidebarStatus.emit();
  }
  public removetoggle() {
    this.smallToggled = false;
  }
  // public removetoggle(event: Event) {
  //   event.preventDefault();
  //   this.smallToggled = !this.smallToggled;
  // }
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    const body = document.querySelector('body');

    if (this.isDarkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
    document.documentElement.style.setProperty('--bg_clr_secondary_extra_dark', this.isDarkMode ? 'white' : 'black');
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
function FirstValueFrom(arg0: Observable<any>) {
  throw new Error('Function not implemented.');
}


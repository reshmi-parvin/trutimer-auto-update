declare global {
  interface Window {
    require: any;
  }
}
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DetailService } from '../detail-service/detail.service';
import { DateTimeService } from '../dateTime-service/dateTime.service';
import { BrowserWindow, ipcRenderer, PowerMonitor } from 'electron';
import { ProjectResponse } from '../model/projectResponse.model';
import {
  GetTasksWithTimeByUsersAndProject,
  GetProjectLastTrackedTime,
  GetAllSourceType,
  UserApiResponse,
  EmptyResponse,
  RecentTasks,
  SearchTaskResponse,
  UserProfileResponse,
  GetUtcTimeResponse,
} from '../model/AllResponse.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { IssueListComponent } from '../issue-list/issue-list.component';
//import * as fs from 'fs';
//import * as electron from 'electron';
//import isElectron from 'is-electron';
declare const window: any;
declare const require: any;

function isElectron(): boolean {
  return window && window.process && window.process.type;
}
//const powerMonitor: PowerMonitor = electron.powerMonitor;
//const electron = require('electron');
import { ElectronService } from 'ngx-electron';
import { filter, interval, timer } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import {
  NgbModalConfig,
  NgbModal,
  ModalDismissReasons,
} from '@ng-bootstrap/ng-bootstrap';
import { sgDatabase } from '../../database/sgDatabase';
// import * as Sentry from '@sentry/angular-ivy';
//import moment from 'moment';
const moment = require('moment-timezone');
import { DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
// import { DateTime } from 'luxon';
import * as https from 'https';
import { transition } from '@angular/animations';
import { ErrorDialogService } from '../ErrorDialogService/error-dialog.service';
import { NTPClient } from 'ntpclient';
//import format from 'moment';
//let desktopCapturer: any = null;
let startTime: any;
let endTime: any;
@Component({
  selector: 'app-dasboard',
  templateUrl: './dasboard.component.html',
  styleUrls: ['./dasboard.component.scss'],
})
export class DasboardComponent
  implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('permission') modalPermission: TemplateRef<any>;
  @ViewChild('livevideo') video: ElementRef;
  @ViewChild('content') modalContent: TemplateRef<any>;
  @ViewChild('viewContent') modalViewContent: TemplateRef<any>;
  @ViewChild('runningContent') modalRunningContent: TemplateRef<any>;
  @ViewChild('manualTimeContent') modalManualTimeContent: TemplateRef<any>;
  @ViewChild('noInternetContent') modalNoInternetContent: TemplateRef<any>;
  @ViewChild('projectList', { static: false }) projectList: ElementRef;
  @ViewChild('issueElement') issueElement: ElementRef;
  win: BrowserWindow = null;
  index = 0;
  messages: string;
  visability: boolean;
  searchedProjectSourceCode;
  objForSaveTime1 = {};
  searchedProject;
  loading = true;
  removeProject = true;
  savedIssueIds: number[] = [];
  issueStartedToday = false;
  isIssueStartedTodayById;
  getUtcTimeFromApiResult: any = {};
  getUtcTimeFromSystemResult: any = {};
  closeResult = '';
  searchText = '';
  idleTimeCounter = 0;
  timeTrackingDurationInMinObj;
  selectedIssueTrackTime = '00:00:00';
  timerInterval = null;
  issueIdForSave = null;
  activity: any = null;
  isActivityLogged = false;
  second;
  popupShown: boolean = false;
  trackedTime = '00:00:00';
  getIssueLoading = false;
  timerRunning = false;
  isModalOpen = false;
  isModalNoInternetOpen = false;
  timerStoppedAt: Date | null = null;
  trackingInactive = false;
  modalReference;
  intervalId: any;
  currentUTCTime: string;
  issue = '';
  logoMapping = {
    Redmine: './assets/images/redmine.png',
    Jira: './assets/images/jira.png',
  };
  searchShowResults: boolean;
  searchQuery: any;
  pic: any;
  imageSource: any;
  profilepic: any;
  private db: any;
  popupInterval: NodeJS.Timer;
  elementRef: any;

  constructor(
    private electronService: ElectronService,
    public appservice: DetailService,
    public dateTimeService: DateTimeService,
    public errorDialogService: ErrorDialogService,
    // public sidebarComponent: SidebarComponent,
    private zone: NgZone,
    private router: Router,
    private sanitizer: DomSanitizer,
    //private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef,
    private modalService: NgbModal,
    private datePipe: DatePipe,
    private renderer: Renderer2
  ) {
    this.db = new sgDatabase();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => { });
  }

  ngOnInit(): void {
    if (isElectron()) {
      this.windowCloseHandler();
      this.powerMonitorActivities();
    }
    this.appservice.settingPageLoading = false;
    this.appservice.setting = JSON.parse(localStorage.getItem('settings'));
    //this.windowCloseHandler();
    this.appservice.userSettings = JSON.parse(
      localStorage.getItem('user_settings')
    );
    this.timeTrackingDurationInMinObj = this.appservice.userSettings.find(
      (o) => o.name === 'Abp.TrackingManagement.TimeTrackingDuration'
    );
    const idleTimeObj = this.appservice.userSettings.find(
      (p) => p.name === 'Abp.TrackingManagement.IdleTime'
    );
    this.appservice.idleTime = idleTimeObj.value * 60;
    //this.appservice.idleTime = (IdleTimeObj.value);

    // this.systemIdleTimeChecker();
    this.powerMonitorActivities();

    const idleModalOpenTimeObj = this.appservice.userSettings.find(
      (q) => q.name === 'Abp.TrackingManagement.idleModalOpenTime'
    );
    if (this.timeTrackingDurationInMinObj) {
      this.appservice.timeTrackingDurationInMin = parseInt(
        this.timeTrackingDurationInMinObj.value
      );
    } else {
      this.appservice.timeTrackingDurationInMin = 10;
    }
    this.appservice.timeTrackingDurationInSec =
      this.appservice.timeTrackingDurationInMin * 60;
    if (idleTimeObj) {
      this.appservice.idleTime1 = parseInt(idleTimeObj.value) * 60;
    } else {
      this.appservice.idleTime1 = 60;
    }

    if (idleModalOpenTimeObj) {
      this.appservice.idleModalOpenTime = parseInt(idleModalOpenTimeObj.value);
    } else {
      this.appservice.idleModalOpenTime = 60;
    }

    this.appservice.idleModalOpenTime = 10;
    this.appservice.timeZoneOffset = new Date().getTimezoneOffset();
    this.getAllSource();
    this.systemIdleTimeChecker();
    this.getRecentTasks();
    this.shortcutRefresh();
    this.electronService.ipcRenderer.on('timer-stopped', () => {
      this.timerStoppedAt = new Date();
    });
    // this.getIssueListOnPageLoad();
    // this.getProjects(this.appservice.lastSourceCode);
  }
  async getUtcTimeFromApi() {
    try {
      const res: GetUtcTimeResponse = await this.appservice.getUtcTime();
      const dateObject = new Date(res.result);
      if (!isNaN(dateObject.getTime())) {
        this.getUtcTimeFromApiResult.year = dateObject.getFullYear();
        this.getUtcTimeFromApiResult.month = dateObject.getMonth();
        this.getUtcTimeFromApiResult.day = dateObject.getDate();
        this.getUtcTimeFromApiResult.hour = dateObject.getHours();
        this.getUtcTimeFromApiResult.minute = dateObject.getMinutes();
        this.getUtcTimeFromApiResult.second = dateObject.getSeconds();
      } else {
        console.error('Invalid date string:', res.result);
      }
    } catch (error) {
      try {
        const res: GetUtcTimeResponse = await this.appservice.getUtcTime();
        const dateObject = new Date(res.result);
        if (!isNaN(dateObject.getTime())) {
          console.log('dateObject.getTime api: ', dateObject);
          this.getUtcTimeFromApiResult.year = dateObject.getFullYear();
          this.getUtcTimeFromApiResult.month = dateObject.getMonth();
          this.getUtcTimeFromApiResult.day = dateObject.getDate();
          this.getUtcTimeFromApiResult.hour = dateObject.getHours();
          this.getUtcTimeFromApiResult.minute = dateObject.getMinutes();
          this.getUtcTimeFromApiResult.second = dateObject.getSeconds();
        } else {
          console.error('Invalid date string:', res.result);
        }
      } catch (err) {
        try {
          //Response handle for worldclockapi
          // this.dateTimeService.getCurrentDateTime()
          //   .then((utcDateTimeString) => {
          //     const currentDateTime = utcDateTimeString;
          //     console.log('Current UTC Date and Time:', currentDateTime);
          //   })
          //   .catch((errr) => {
          //     console.error('Error fetching UTC Date and Time:', errr);
          //   });

          const timeoutDuration = 1000; // 1 second

          const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('Request timed out'));
            }, timeoutDuration);
          });
          Promise.race([
            this.dateTimeService.getCurrentDateTime(),
            timeoutPromise,
          ])
            .then(() => {
              const currentDateTime = this.dateTimeService.utcDateTimeString;
              const dateObject = new Date(currentDateTime);
              if (!isNaN(dateObject.getTime())) {
                this.getUtcTimeFromApiResult.year = dateObject.getFullYear();
                this.getUtcTimeFromApiResult.month = dateObject.getMonth();
                this.getUtcTimeFromApiResult.day = dateObject.getDate();
                this.getUtcTimeFromApiResult.hour = dateObject.getHours();
                this.getUtcTimeFromApiResult.minute = dateObject.getMinutes();
                this.getUtcTimeFromApiResult.second = dateObject.getSeconds();
              } else {
                console.error('Invalid date string:', currentDateTime);
              }
            })
            .catch((errro) => {
              if (errro.message === 'Request timed out') {
                console.error('Request timed out');
                this.openModalForNoInternetAndManualTime();
              } else {
                console.error('Error fetching UTC Date and Time:', errro);
                this.openModalForNoInternetAndManualTime();
              }
            });
        }
        catch (e) {
          this.openModalForNoInternetAndManualTime();
        }
      }
    }
  }

  async getUtcTimeFromSystem() {
    const currentUTCTime: string = new Date().toISOString();
    const dateObject = new Date(currentUTCTime);
    if (!isNaN(dateObject.getTime())) {
      this.getUtcTimeFromSystemResult.year = dateObject.getFullYear();
      this.getUtcTimeFromSystemResult.month = dateObject.getMonth();
      this.getUtcTimeFromSystemResult.day = dateObject.getDate();
      this.getUtcTimeFromSystemResult.hour = dateObject.getHours();
      this.getUtcTimeFromSystemResult.minute = dateObject.getMinutes();
      this.getUtcTimeFromSystemResult.second = dateObject.getSeconds();
    } else {
      console.error('Invalid date string:', currentUTCTime);
    }
  }

  handleTimerEvent(event) {
    if (event.action === 'done') {
      this.timerstart(
        'stop',
        this.appservice.activeIssueId,
        this.appservice.activeIssueName,
        this.appservice.activeProjectName,
        this.appservice.activeProjectId,
        this.appservice.activeBaseUrlId
      );
    }
  }
  async getRecentTasks() {
    const takingTasksNum = 5;
    const res: RecentTasks = await this.appservice.getRecentTasks(
      takingTasksNum
    );
    this.appservice.recentTasksData = res.result;
  }
  /* This function is for checking the userInactivty when app open.*/
  checkInactivityUser() {
    if (this.appservice.checkInactiveUser) {
      this.appservice.checkInactiveUser.unsubscribe();
    }
    this.appservice.checkInactiveUser = interval(600000).subscribe((x) => {
      const currentTime = new Date();
      if (!this.timerRunning && this.timerStoppedAt) {
        const elapsedMillis =
          currentTime.getTime() - this.timerStoppedAt.getTime();
        const elapsedSeconds = elapsedMillis / 1000;
        if (elapsedSeconds >= 600) {
          this.electronService.ipcRenderer.send('app_bring_to_front');
          this.openModal();
        }
      }
    });
  }
  openModal() {
    if (!this.modalService.hasOpenModals()) {
      this.modalReference = this.modalService.open(this.modalViewContent, {
        backdrop: 'static',
        keyboard: false,
      });
      this.modalReference.result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          this.timerStoppedAt = new Date();
          this.checkInactivityUser();
          this.modalReference = null; // Clear the modal reference when it's closed
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          this.checkInactivityUser();
          this.modalReference = null; // Clear the modal reference when it's closed
        }
      );
    }
  }
  openModalForManualTime() {
    if (this.appservice.isDashboard) {
      this.electronService.ipcRenderer.send('app_bring_to_front');
      if (this.isModalOpen) {
        return;
      }
      this.isModalOpen = true;
      this.modalService
        .open(this.modalManualTimeContent, {
          backdrop: 'static',
          keyboard: false,
        })
        .result.then(
          (result) => {
            this.closeResult = `Closed with: ${result}`;
            this.isModalOpen = false;
          },
          (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            this.isModalOpen = false;
          }
        );
    }
  }

  openModalForNoInternetAndManualTime() {
    if (this.appservice.isDashboard) {
      this.electronService.ipcRenderer.send('app_bring_to_front');
      if (this.isModalOpen) {
        return;
      }
      this.isModalOpen = true;
      this.modalService
        .open(this.modalNoInternetContent, {
          backdrop: 'static',
          keyboard: false,
        })
        .result.then(
          (result) => {
            this.closeResult = `Closed with: ${result}`;
            this.isModalOpen = false;
          },
          (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            this.isModalOpen = false;
          }
        );
    }
  }
  onScroll(event: any) {
    const container = event.target;
    const scrollPosition = container.offsetHeight + container.scrollTop;
    const totalHeight = container.scrollHeight;
    const buffer = 200;
    if (
      scrollPosition >= totalHeight - buffer &&
      this.appservice.offset < this.appservice.totalProject
    ) {
      this.appservice.offset += 40;

      if (this.appservice.offset < this.appservice.totalProject) {
        this.getMoreProjects(
          this.appservice.userSourceCode,
          this.appservice.offset
        );
      }
    }
  }

  async getMoreProjects(userSourceCode, page) {
    try {
      this.appservice.userId = localStorage.getItem('user_id');
      const obj = {
        Offset: page,
        Limit: 150,
        SourceCode: userSourceCode,
      };
      if (!this.appservice.getProjectsLoading) {
        this.appservice.getProjectsLoading = true;
        const res = await this.appservice.getProjects(obj);
        res.result.items.forEach((p) => {
          this.appservice.projects.push(p);
        });
        this.appservice.issues = [];
        this.appservice.projects.forEach((p) => {
          p.baseUrl = userSourceCode;
        });
        this.appservice.getProjectsLoading = false;
      } else {
        this.appservice.getProjectsLoading = false;
      }
    } catch (err) {
      // Handle error if needed
    }
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  windowCloseHandler() {
    if (isElectron()) {
      this.electronService.ipcRenderer.on('app_quit', () => {
        if (this.appservice.runningIssueId) {
          this.timerstart(
            'stop',
            this.appservice.lastTrackDtl.lastTaskID,
            this.appservice.activeIssueName,
            this.appservice.activeProjectName,
            this.appservice.activeProjectId,
            this.appservice.activeBaseUrlId
          ).then(() => {
            setTimeout(() => {
              this.electronService.ipcRenderer.send('windowClose');
            }, 7000);
          });
        } else {
          this.electronService.ipcRenderer.send('windowClose');
        }
      });
    }
  }
  updateRoute(): void {
    const currentRouteTitle = this.router.url;
    if (currentRouteTitle === '/home') {
    } else {
      this.appservice.isRefreshingIcon = true;
      this.appservice.checkAfterHibernate = true;
      if (this.isModalOpen) {
        this.modalService.dismissAll('closing all modals');
        this.isModalOpen = false;
      }
      setTimeout(() => {
        this.getUnsavedDataFromlocalDb();
        this.getIssueListOnPageLoad();
        this.getAllSource();
        this.getUtcTimeFromApi();
        async () => {
          try {
            this.appservice.isSkeletonLoading = true;
            const date = moment().format('YYYY/MM/DD');
            const time = '00:00';
            const dateTime = moment(date + ' ' + time, 'YYYY/MM/DD HH:mm')
              .utc()
              .format();
            const obj = {
              StartDate: dateTime,
              EndDate: moment.utc().format(),
            };
            if (
              this.appservice.setting[
              'Pages.Redmine.Projects.LastProjectTrackTime'
              ] === 'true'
            ) {
              const res: GetProjectLastTrackedTime =
                await this.appservice.getTotalTimeAndLastTrackTime(obj);
              this.appservice.lastTrackDtl = res.result;
              this.appservice.lastSourceCode = res.result.sourceCode;
              if (res.result.totalTrackedTime) {
                const durationInSeconds = moment
                  .duration(this.appservice.activeTimerValue)
                  .asSeconds();
                this.appservice.totalTimeWorked = moment(
                  res.result.totalTrackedTime,
                  'HH:mm:ss'
                )
                  .add(durationInSeconds, 'seconds')
                  .format('HH:mm:ss');
              } else {
                this.appservice.totalTimeWorked = '00:00:00';
              }

              this.visability = false;
              this.appservice.isSkeletonLoading = false;
            } else {
              this.issue = 'You dont have permissions';
              this.modalService
                .open(this.modalPermission, {
                  ariaLabelledBy: 'modal-basic-title',
                })
                .result.then(
                  (result) => {
                    this.closeResult = `Closed with: ${result}`;
                  },
                  (reason) => { }
                );
              this.appservice.isSkeletonLoading = false; // Make sure to set isSkeletonLoading to false in this case as well
            }
          } catch (err) {
            // this.messages = err.error.error.message + '   Please Refresh Again';
            this.messages =
              'Internal server error ' + '   Please Refresh Again';
            this.visability = true;
            this.appservice.isSkeletonLoading = false;
            setTimeout(() => {
              this.visability = false;
            }, 5000);
          }
        };
        this.getIssueListOnPageLoad();
        this.appservice.isRefreshingIcon = false;
      }, 15000);
    }
  }

  powerMonitorActivities() {
    if (isElectron()) {
      this.electronService.ipcRenderer.on('system-suspend', () => {
        if (this.appservice.runningIssueId) {
          this.timerstart(
            'stop',
            this.appservice.lastTrackDtl.lastTaskID,
            this.appservice.activeIssueName,
            this.appservice.activeProjectName,
            this.appservice.activeProjectId,
            this.appservice.activeBaseUrlId
          );
        }
      });

      this.electronService.ipcRenderer.on('system-lock-screen', () => {
        if (this.appservice.runningIssueId) {
          this.timerstart(
            'stop',
            this.appservice.lastTrackDtl.lastTaskID,
            this.appservice.activeIssueName,
            this.appservice.activeProjectName,
            this.appservice.activeProjectId,
            this.appservice.activeBaseUrlId
          );
        }
      });
      this.electronService.ipcRenderer.on('system-resume', () => {
        this.updateRoute();
      });
      // this.electronService.ipcRenderer.on('system-unlock-screen', () => {
      //   this.updateRouteForUnlockScreen();
      // });
    }
  }
  convertTimeToMinutes(timeString: string): number {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    // Convert hours and seconds to minutes and sum up
    //const totalMinutes = Math.ceil(hours * 60 + minutes + seconds / 60);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const remainingSeconds = totalSeconds % 60;

    let totalMinutes = Math.floor(totalSeconds / 60);
    if (remainingSeconds > 30) {
      totalMinutes = Math.ceil(totalSeconds / 60);
    }
    return totalMinutes;
  }

  activityLogHandle(trackTimeInMin: number) {
    this.activity = null;
    if (isElectron()) {
      this.electronService.ipcRenderer.on('pythonData', (event, data) => {
        if (data) {
          const lines = data.trim().split('\n');
          const lastObject = lines[lines.length - 1];
          const mouseData = JSON.parse(lastObject);
          const keyboardData = Object.keys(mouseData)
            .filter(
              (key) =>
                !['left_click', 'right_click', 'move', 'scroll'].includes(key)
            )
            .reduce((obj, key) => {
              obj[key] = mouseData[key];
              return obj;
            }, {} as Record<string, number>);

          const totalKeyPresses: number = Object.values(keyboardData).reduce(
            (total: number, count: unknown) => total + (count as number),
            0
          );
          const distinctKeys: number = Object.keys(keyboardData).length;
          const keyPresss = totalKeyPresses / trackTimeInMin;
          const diffKeys = distinctKeys / trackTimeInMin;
          const mouseClick =
            (mouseData['left_click'] + mouseData['right_click']) /
            trackTimeInMin;
          const mouseMove = mouseData['move'] / trackTimeInMin;
          const mouseScroll = mouseData['scroll'] / trackTimeInMin;
          this.activity = {
            keyboard: {
              keyPressPerMin: keyPresss,
              diffKeyPerMin: diffKeys,
            },
            mouse: {
              clickPerMin: mouseClick,
              movePerMin: mouseMove,
              scrollPerMin: mouseScroll,
            },
          };
          if (!this.isActivityLogged) {
            this.isActivityLogged = true;
          } else {
            // Reset the flag for the next time you start
            this.isActivityLogged = false;
          }
          this.activity = null;
        } else {
          this.activity = {
            keyboard: {
              keyPressPerMin: 0,
              diffKeyPerMin: 0,
            },
            mouse: {
              clickPerMin: 0,
              movePerMin: 0,
              scrollPerMin: 0,
            },
          };
        }
      });
    }
    this.activity = null;
  }

  // activityLogHandle(trackTimeInMin: number) {
  //   this.activity = null;
  //   if (isElectron()) {
  //     this.electronService.ipcRenderer.on('pythonData', (event, data) => {
  //       if (typeof data === 'string') { // Check if data is a string
  //         const trimmedData = data.trim();
  //         if (trimmedData.length > 0) { // Ensure trimmedData is not an empty string
  //           const lines = trimmedData.split('\n');
  //           const lastObject = lines[lines.length - 1];
  //           const mouseData = JSON.parse(lastObject);
  //           const keyboardData = Object.keys(mouseData).filter(key => !['left_click', 'right_click', 'move', 'scroll'].includes(key))
  //             .reduce((obj, key) => {
  //               obj[key] = mouseData[key];
  //               return obj;
  //             }, {} as Record<string, number>);

  //           const totalKeyPresses: number = Object.values(keyboardData).reduce((total: number, count: unknown) => total + (count as number), 0);
  //           const distinctKeys: number = Object.keys(keyboardData).length;
  //           console.log('trackTimeInMin: ', trackTimeInMin);
  //           const keyPresses = totalKeyPresses / trackTimeInMin;
  //           const diffKeys = distinctKeys / trackTimeInMin;
  //           const mouseClick = (mouseData['left_click'] + mouseData['right_click']) / trackTimeInMin;
  //           const mouseMove = mouseData['move'] / trackTimeInMin;
  //           const mouseScroll = mouseData['scroll'] / trackTimeInMin;
  //           this.activity = {
  //             keyboard: {
  //               keyPressPerMin: keyPresses,
  //               diffKeyPerMin: diffKeys,
  //             },
  //             mouse: {
  //               clickPerMin: mouseClick,
  //               movePerMin: mouseMove,
  //               scrollPerMin: mouseScroll,
  //             }
  //           };
  //           if (!this.isActivityLogged) {
  //             console.log('activity', this.activity);
  //             this.isActivityLogged = true;
  //           } else {
  //             // Reset the flag for the next time you start
  //             this.isActivityLogged = false;
  //           }
  //           this.activity = null;
  //         } else {
  //           // Handle empty trimmedData if needed
  //           console.error('Received empty data');
  //         }
  //       } else {
  //         // Handle cases where data is not a string
  //         console.error('Received data is not a string');
  //       }
  //     });
  //   }
  //   this.activity = null;
  // }
  // checkProjectById(idToCheck: number) {
  //   // Assuming you want to check if a specific ID exists in projectsArray
  //   const foundProject = this.appservice.projects.find(
  //     (project) => project.id === idToCheck
  //   );
  //   if (foundProject) {
  //     this.appservice.addtimeSourceCode = this.appservice.selectedSourcecode;
  //   } else {
  //     this.appservice.addtimeSourceCode =
  //       this.appservice.selectIssueInTopSecSourceCode;
  //     console.log('this.appservice.selectIssueInTopSecSourceCode 3: ', this.appservice.selectIssueInTopSecSourceCode);
  //   }
  // }
  checkProjectById(idToCheck: number) {
    // Assuming you want to check if a specific ID exists in projectsArray
    const foundProject = this.appservice.projects.find(
      (project) => project.id === idToCheck
    );
    if (foundProject) {
      this.appservice.addtimeSourceCode = this.appservice.selectedSourcecode;
    } else {
      console.log('this.appservice.selectTasksFromRecenTasks: ', this.appservice.selectTasksFromRecenTasks);
      if (this.appservice.selectTasksFromRecenTasks) {
        if (this.appservice.selectIssueInTopSecSourceCode === undefined) {
          console.log('this.appservice.selectIssueInTopSecSourceCode is undefined');
          this.appservice.addtimeSourceCode = this.appservice.sourceCodeRecentTasks;
          console.log('this.appservice.addtimeSourceCode: ', this.appservice.addtimeSourceCode);
        }
        else {
          if (this.appservice.selectIssueInTopSecSourceCode !== this.appservice.sourceCodeRecentTasks) {
            this.appservice.selectIssueInTopSecSourceCode = this.appservice.sourceCodeRecentTasks;
          }
          this.appservice.addtimeSourceCode = this.appservice.selectIssueInTopSecSourceCode;
          console.log('this.appservice.selectIssueInTopSecSourceCode 3: ', this.appservice.selectIssueInTopSecSourceCode);
        }
        this.appservice.selectTasksFromRecenTasks = false;
      }
      else {
        if (this.appservice.selectIssueInTopSecSourceCode === undefined) {
          console.log('this.appservice.selectIssueInTopSecSourceCode is undefined 1');
          this.appservice.addtimeSourceCode = this.appservice.selectedSourcecode;
          console.log('this.appservice.addtimeSourceCode else: ', this.appservice.addtimeSourceCode);
        }
        else {
          this.appservice.addtimeSourceCode = this.appservice.selectIssueInTopSecSourceCode;
          console.log('this.appservice.selectIssueInTopSecSourceCode 3: ', this.appservice.selectIssueInTopSecSourceCode);
        }
      }
    }
    this.appservice.selectTasksFromRecenTasks = false;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  timerstart(type, issue_id, issue_name, projectname, projectid, baseUrlId) {
    try {
      const promise = new Promise((resolve, reject) => {
        if (this.appservice.activeIssueId) {
          this.issueIdForSave = this.appservice.activeIssueId;
          this.appservice.previousIssueId = this.issueIdForSave;
        } else {
          this.issueIdForSave = issue_id;
        }
        if (this.appservice.timerStatus) {
          if (this.appservice.tt) {
            this.appservice.tt.unsubscribe();
          }
          if (this.appservice.dd) {
            this.appservice.dd.unsubscribe();
          }
          let objForSaveTime = {};
          const trackTimeInMinutes = this.convertTimeToMinutes(
            this.appservice.activeTimerValue
          );
          this.appservice.currentDate = moment.utc().format();
          const trackStartTime = new Date(this.appservice.trackStartTime);
          const trackCurrentDate = new Date(this.appservice.currentDate);
          const timeDifferenceMilliseconds =
            trackCurrentDate.getTime() - trackStartTime.getTime();
          objForSaveTime['projectId'] = this.appservice.activeProjectId;
          objForSaveTime['projectName'] = this.appservice.activeProjectName;
          objForSaveTime['taskId'] = this.issueIdForSave;
          objForSaveTime['taskname'] = this.appservice.activeIssueName;
          objForSaveTime['sourceCode'] = this.appservice.addtimeSourceCode;
          objForSaveTime['baseUrlId'] = this.appservice.activeBaseUrlId;
          objForSaveTime['startTime'] = this.appservice.trackStartTime;
          objForSaveTime['endTime'] = this.appservice.currentDate;
          objForSaveTime['trackTime'] = this.appservice.activeTimerValue;
          objForSaveTime['isIdleTime'] = this.appservice.isIdleTime;
          objForSaveTime['TimeOffsetInMins'] = this.appservice.timeZoneOffset;
          this.appservice.activeTimerValue = '00:00:00';
          this.appservice.runningIssueTrackTime = '00:00:00';
          this.electronService.ipcRenderer.send('activityStop');
          this.activityLogHandle(trackTimeInMinutes);
          console.log('this.appservice.addtimeSourceCode: ', this.appservice.addtimeSourceCode);
          //objForSaveTime["baseUrlId"] = this.appservice.baseUrlId;
          //TIME SAVING PROCESS START
          // When we pause the timer this takeDesktopScreenshot() called.
          this.takeDesktopScreenshot().then(async (res) => {
            if (isElectron()) {
              (objForSaveTime['imageName'] = 'screenshot.png'),
                (objForSaveTime['imageSource'] =
                  this.appservice.base64EncodedImage);
            } else {
              objForSaveTime['imageName'] = '';
              objForSaveTime['imageSource'] = '';
            }
            this.appservice.selectIssueInTopSecSourceCode = this.appservice.addtimeSourceCode;
            console.log('this.appservice.selectIssueInTopSecSourceCode 4: ', this.appservice.selectIssueInTopSecSourceCode);
            console.log('objForSaveTime: ', objForSaveTime);
            await this.saveTime2(objForSaveTime).then((res) => {
              objForSaveTime = null;
            });
            //await this.getIssueListOnPageLoad();
            this.objForSaveTime1 = objForSaveTime;
          });
          //TIME SAVING PROCESS END
        }
        this.appservice.showTopDiv = true;
        this.appservice.selectedProjectId = projectid; // for top div
        this.appservice.selectedBaseUrlId = baseUrlId;
        this.appservice.selectedIssueProjectName = projectname; // for top div
        this.appservice.selectedIssueId = issue_id; // for top div
        this.appservice.selectedIssueName = issue_name; // for top div
        if (type === 'start') {
          this.electronService.ipcRenderer.send('activityStart');
          this.appservice.addtimeSourceCode =
            this.appservice.selectedSourcecode;
          this.checkProjectById(projectid);
          this.appservice.timeZoneOffset = new Date().getTimezoneOffset();
          this.timerRunning = true;
          if (this.appservice.checkInactiveUser) {
            this.appservice.checkInactiveUser.unsubscribe();
          }
          this.timerStoppedAt = null;
          endTime = undefined;
          this.appservice.trackStartTime = moment.utc().format();
          this.appservice.timerStatus = true;
          this.appservice.activeProjectId = projectid;
          this.appservice.activeBaseUrlId = baseUrlId;
          this.appservice.activeProjectName = projectname;
          this.appservice.activeIssueId = issue_id;
          this.appservice.activeIssueName = issue_name;
          this.appservice.runningIssueId = issue_id;
          this.appservice.selectedissueclass = issue_id;
          this.appservice.runningIssue.next('true');
          //let trackedTime = '00:00:00';
          //let trackedTime = this.appservice.totalTimeInSec;
          //TIME TRACKING INTERVAL START
          startTime = moment(this.appservice.trackStartTime).format();
          // if(this.appservice.timerStatus === true){
          //   // this.systemIdleTimeChecker();
          // }
          this.appservice.tt = interval(1000).subscribe((x) => {
            const today = this.updateCurrentDate();
            if (today === this.appservice.today) {
              const trackedissueObj = this.appservice.userTimerRecord.find(
                (xy) => xy.id === issue_id
              );
              // if(trackedissueObj){
              // //   trackedissueObj.trackTime = trackedTime;
              // }
              //trackedissueObj.trackTime = this.appservice.timePerSec;
              if (trackedissueObj) {
                this.trackedTime = this.convertStrToTime(
                  trackedissueObj.trackTime
                );
              }
            } else {
              this.saveTime();
              this.appservice.totalTimeWorked = '00:00:00';
              this.appservice.activeTimerValue = '00:00:00';
              this.trackedTime = this.convertStrToTime('00:00:00');
              this.appservice.issuesProjectWise.find(
                (xy) => xy.id === issue_id
              ).trackTime = '00:00:00';
              this.appservice.userTimerRecord.forEach((issue) => {
                issue.trackTime = '00:00:00';
              });
              setTimeout(async () => {
                await this.getAllSource();
                await this.getLastTrackedData(this.appservice.userSourceCode);
              }, 1000);
              this.appservice.userTimerRecord.find(
                (xy) => xy.id === issue_id
              ).trackTime = new Date();
              this.appservice.today = today;
            }
            endTime = moment(this.appservice.currentDate).format();
            const __duration = moment.duration(moment(endTime).diff(startTime));
            this.second = __duration.asSeconds();
            startTime = endTime;
            ///UPDATE TOTAL TIME

            let totalTime = this.convertStrToTime(
              this.appservice.totalTimeWorked
            );
            totalTime = moment(totalTime)
              .add(1, 'seconds')
              .format('HH:mm:ss')
              .toString();
            this.appservice.totalTimeWorked = totalTime;

            //Update Active Timer value
            const activeTimerValue = this.convertStrToTime(
              this.appservice.activeTimerValue
            );
            this.appservice.activeTimerValue = moment(activeTimerValue)
              .add(1, 'seconds')
              .format('HH:mm:ss')
              .toString();

            //Update Timer Arr
            this.trackedTime = moment(this.trackedTime)
              .add(1, 'seconds')
              .format('HH:mm:ss')
              .toString();
            this.appservice.selectedIssueTrackedTime = this.trackedTime;
            this.updateIssueTime(
              issue_id,
              this.trackedTime,
              projectid,
              baseUrlId
            );
          });
          //TIME TRACKING INTERVAL START
          //AUTO SAVE START
          const autosaveTimer =
            this.appservice.timeTrackingDurationInMin * 60 * 1000;
          this.appservice.dd = interval(autosaveTimer).subscribe((x) => {
            let objForSaveTime = {};
            this.appservice.currentDate = moment.utc().format();
            const trackStartTime = new Date(this.appservice.trackStartTime);
            const trackCurrentDate = new Date(this.appservice.currentDate);
            const timeDifferenceMilliseconds =
              trackCurrentDate.getTime() - trackStartTime.getTime();
            objForSaveTime['projectId'] = this.appservice.activeProjectId;
            objForSaveTime['projectName'] = this.appservice.activeProjectName;
            objForSaveTime['taskId'] = this.appservice.activeIssueId;
            objForSaveTime['taskname'] = this.appservice.activeIssueName;
            objForSaveTime['baseUrlId'] = this.appservice.activeBaseUrlId;
            objForSaveTime['sourceCode'] = this.appservice.addtimeSourceCode;
            objForSaveTime['startTime'] = this.appservice.trackStartTime;
            objForSaveTime['endTime'] = this.appservice.currentDate;
            objForSaveTime['trackTime'] = this.appservice.activeTimerValue;
            objForSaveTime['isIdleTime'] = this.appservice.isIdleTime;
            objForSaveTime['TimeOffsetInMins'] = this.appservice.timeZoneOffset;
            //objForSaveTime["baseUrlId"] = this.appservice.baseUrlId;
            const trackTimeInMinutes = this.convertTimeToMinutes(
              this.appservice.activeTimerValue
            );
            this.electronService.ipcRenderer.send('activityStopForAutoSave');
            this.activityLogHandle(trackTimeInMinutes);
            this.appservice.activeTimerValue = '00:00:00';
            this.appservice.runningIssueTrackTime = '00:00:00';
            this.appservice.newtrackStartTime = objForSaveTime['endTime'];
            this.appservice.trackStartTime = this.appservice.newtrackStartTime;
            //When auto save is happening that time screenshot.
            this.takeDesktopScreenshot().then(async (res) => {
              if (isElectron()) {
                (objForSaveTime['imageName'] = 'screenshot.png'),
                  (objForSaveTime['imageSource'] =
                    this.appservice.base64EncodedImage);
                startTime = undefined;
                endTime = undefined;
              } else {
                startTime = undefined;
                endTime = undefined;
                objForSaveTime['imageName'] = '';
                objForSaveTime['imageSource'] = '';
              }
              this.appservice.selectIssueInTopSecSourceCode = this.appservice.addtimeSourceCode;
              console.log('this.appservice.selectIssueInTopSecSourceCode 5: ', this.appservice.selectIssueInTopSecSourceCode);
              await this.saveTimeForAutoSave(objForSaveTime).then((res) => {
                startTime = undefined;
                endTime = undefined;
                // this.appservice.trackStartTime =
                //   this.appservice.newtrackStartTime;
                objForSaveTime = null;
              });
              //await this.getIssueListOnPageLoad();
            });
          });
          //AUTO SAVE END
        } else if (type === 'stop') {
          // this.electronService.ipcRenderer.send('activityStop');
          // this.activityLogHandle();
          // this.electronService.ipcRenderer.on('pythonData', (event, data) => {
          // });
          this.timerRunning = false;
          this.checkInactivityUser();
          this.timerStoppedAt = new Date();
          startTime = undefined;
          endTime = undefined;
          this.appservice.timerStatus = false;
          this.appservice.currentDate = moment.utc().format();
          this.appservice.trackStartTime = this.appservice.currentDate - 1;
          this.appservice.selectedprojectclass =
            this.appservice.selectedprojectclass;
          this.appservice.selectedBaseurlIdClass =
            this.appservice.selectedBaseurlIdClass;
          this.appservice.timerStatus = false;
          this.appservice.runningIssue.next('false');
          if (this.appservice.tt) {
            this.appservice.tt.unsubscribe();
          }
          if (this.appservice.dd) {
            this.appservice.dd.unsubscribe();
          }
          this.appservice.lastTrackDtl.lastTaskID =
            this.appservice.selectedIssueId;
          this.appservice.runningIssueId = null;
          this.appservice.activeIssueId = null;
          startTime = undefined;
          endTime = undefined;
          //this.checkForInactivity();
        }
        resolve(true);
      });
      return promise;
    } catch (err) {
      // this.messages = err.error.error.message + '   Please Refresh Again';
      this.messages = 'Internal server error ' + '   Please Refresh Again';
      throw new Error('Error in timer start stop');
    }
  }
  updateIssueTime(issueid, trackedTime, projectid, baseUrlId) {
    try {
      ///UPDATE userTimerRecord TIME
      const trackedissueObj = this.appservice.userTimerRecord.find(
        (x) => x.id === issueid
      );
      const index = this.appservice.userTimerRecord.indexOf(trackedissueObj);
      // trackedissueObj.trackTime = trackedTime;
      trackedissueObj.trackTime = trackedTime;
      this.appservice.userTimerRecord[index] = trackedissueObj;
      ///UPDATE issuesProjectWise TIME
      if (
        this.appservice.selectedProjectId === projectid &&
        this.appservice.selectedBaseUrlId === baseUrlId &&
        Array.isArray(this.appservice.issuesProjectWise) &&
        this.appservice.issuesProjectWise.find((x) => x.id === issueid)
      ) {
        const objfromissuesProjectWise = this.appservice.issuesProjectWise.find(
          (x) => x.id === issueid
        );
        const indexfromissuesProjectWise =
          this.appservice.issuesProjectWise.indexOf(objfromissuesProjectWise);
        if (objfromissuesProjectWise) {
          objfromissuesProjectWise.trackTime = trackedTime;
          this.appservice.issuesProjectWise[indexfromissuesProjectWise] =
            objfromissuesProjectWise;
          this.appservice.issues = this.appservice.issuesProjectWise;
        } else {
          this.appservice.timerStatus = false;
          this.appservice.runningIssue.next('false');
          this.appservice.showTopDiv = false;
          if (this.appservice.tt) {
            this.appservice.tt.unsubscribe();
          }
          if (this.appservice.dd) {
            this.appservice.dd.unsubscribe();
          }
          this.appservice.selectedprojectclass =
            this.appservice.selectedProjectId;
          this.appservice.selectedBaseurlIdClass =
            this.appservice.selectedBaseUrlId;
          // this.takeDesktopScreenshot();//OLD CODE
          // this.saveTime();//OLD CODE
          let objForSaveTime = {};
          this.appservice.currentDate = moment.utc().format();
          objForSaveTime['projectId'] = this.appservice.activeProjectId;
          objForSaveTime['projectName'] = this.appservice.activeProjectName;
          objForSaveTime['taskId'] = this.issueIdForSave;
          objForSaveTime['taskname'] = this.appservice.activeIssueName;
          objForSaveTime['sourceCode'] = this.appservice.addtimeSourceCode;
          objForSaveTime['startTime'] = this.appservice.trackStartTime;
          objForSaveTime['endTime'] = this.appservice.currentDate;
          objForSaveTime['baseUrlId'] = this.appservice.activeBaseUrlId;
          objForSaveTime['trackTime'] = this.appservice.activeTimerValue;
          objForSaveTime['isIdleTime'] = this.appservice.isIdleTime;
          objForSaveTime['TimeOffsetInMins'] = this.appservice.timeZoneOffset;
          const trackTimeInMinutes = this.convertTimeToMinutes(
            this.appservice.activeTimerValue
          );
          this.electronService.ipcRenderer.send('activityStop');
          this.activityLogHandle(trackTimeInMinutes);
          this.takeDesktopScreenshot().then(async (res) => {
            if (isElectron()) {
              (objForSaveTime['imageName'] = 'screenshot.png'),
                (objForSaveTime['imageSource'] =
                  this.appservice.base64EncodedImage);
            } else {
              objForSaveTime['imageName'] = '';
              objForSaveTime['imageSource'] = '';
            }
            this.appservice.selectIssueInTopSecSourceCode =
              this.appservice.addtimeSourceCode;
            console.log('this.appservice.selectIssueInTopSecSourceCode 6: ', this.appservice.selectIssueInTopSecSourceCode);
            await this.saveTime2(objForSaveTime).then((res) => {
              objForSaveTime = null;
            });
            //await this.getIssueListOnPageLoad();
          });
          this.appservice.activeTimerValue = '00:00:00';
          this.appservice.showTopDiv = false;
          this.appservice.runningIssueId = null;
          this.appservice.activeIssueId = null;
        }
      }
    } catch (err) {
      // this.messages = err.error.error.message + '   Please Refresh Again';
      this.messages = 'Internal server error ' + '   Please Refresh Again';
      throw new Error('Error in Updating issue time');
    }
  }
  callingsave() { }
  updateCurrentDate() {
    let currentDateTime = new Date();
    let currentDate = moment(currentDateTime).format('YYYY/MM/DD');
    return currentDate;
  }
  saveTime() {
    try {
      return new Promise((resolve, reject) => {
        // HERE CALLING API IN  SHORT TIME INTRVAL
        const obj = {};
        this.appservice.currentDate = moment.utc().format();
        if (isElectron()) {
          (obj['imageName'] = 'screenshot.png'),
            (obj['imageSource'] = this.appservice.base64EncodedImage);
        } else {
          obj['imageName'] = '';
          obj['imageSource'] = '';
        }
        obj['projectId'] = this.appservice.activeProjectId;
        obj['baseUrlId'] = this.appservice.activeBaseUrlId;
        obj['projectName'] = this.appservice.activeProjectName;
        obj['taskId'] = this.issueIdForSave;
        obj['taskname'] = this.appservice.activeIssueName;
        obj['sourceCode'] = this.appservice.userSourceCode;
        obj['startTime'] = this.appservice.trackStartTime;
        obj['endTime'] = this.appservice.currentDate;
        obj['trackTime'] = this.appservice.activeTimerValue;
        obj['isIdleTime'] = this.appservice.isIdleTime;
        this.appservice.activeTimerValue = '00:00:00';
        this.appservice.runningIssueTrackTime = '00:00:00';
        this.appservice.saveData(obj).subscribe(
          (res) => {
            const endTimee = new Date(this.appservice.currentDate); // Parse the startTime
            endTimee.setSeconds(endTimee.getSeconds() + 3); // Add 2 seconds
            this.appservice.trackStartTime = endTimee
              .toISOString()
              .replace(/\.\d{3}Z$/, 'Z');
            this.appservice.currentDate;
            this.appservice.isIdleTime = false;
            this.appservice.userTimerRecord = [];
            resolve(null);
            // startTime = undefined;
            // endTime = undefined;
            // this.appservice.trackStartTime =
            //   this.appservice.newtrackStartTime;
          },
          (err) => { }
        );
        // this.appservice.issues = [];
        // this.appservice.issuesProjectWise = [];
      });
    } catch (err) {
      // this.messages = err.error.error.message + '   Please Refresh Again';
      this.messages = 'Internal server error ' + '   Please Refresh Again';
      throw new Error('Error in saving time funtion 1');
    }
  }
  onKeyDownPopup(event: Event) {
    event.preventDefault();
  }
  convertStrToTime(inputtime) {
    const time = inputtime;
    if (isNaN(time)) {
      const timeobj = time?.split(':');
      const housobj = Number(timeobj[0]);
      const minobj = Number(timeobj[1]);
      const secobj = Number(timeobj[2]);
      const traveltime = new Date();
      let travelTime = traveltime.setSeconds(secobj);
      travelTime = traveltime.setMinutes(minobj);
      travelTime = traveltime.setHours(housobj);
      return travelTime;
    } else {
      return inputtime;
    }
  }
  async getUserProfile() {
    if (!this.appservice.getProfileLoading) {
      this.appservice.getProfileLoading = true;
      const res: UserProfileResponse = await this.appservice.getProfile();
      localStorage.setItem(
        'profile_picture',
        JSON.stringify(res.result.profilePicture)
      );
      this.appservice.userDetailsData = JSON.parse(
        localStorage.getItem('user_detail')
      );
      this.appservice.profilePicture = JSON.parse(
        localStorage.getItem('profile_picture')
      );
      this.appservice.imageSource =
        this.sanitizer.bypassSecurityTrustResourceUrl(
          this.appservice.profilePicture
        );
      this.appservice.profileImage = this.appservice.imageSource;
      this.appservice.userProfileName =
        this.appservice.userDetailsData.userName;
      this.appservice.getProfileLoading = false;
    } else {
      this.appservice.getProfileLoading = false;
    }
  }
  // async refresh() {
  //   this.getUtcTimeFromApi();
  //   this.getUtcTimeFromSystem();
  //   this.systemIdleTimeChecker();
  //   this.appservice.isRefreshing = true;
  //   this.appservice.isRefreshingIcon = true;
  //   if (this.appservice.runningIssueId) {
  //     //this.appservice.isRefreshingIcon = true;
  //     this.timerstart(
  //       'stop',
  //       this.appservice.lastTrackDtl.lastTaskID,
  //       this.appservice.activeIssueName,
  //       this.appservice.activeProjectName,
  //       this.appservice.activeProjectId,
  //       this.appservice.activeBaseUrlId
  //     ).then(() => {
  //       setTimeout(async () => {
  //         localStorage.removeItem('projects');
  //         localStorage.removeItem('running_Issue_track_time');
  //         localStorage.removeItem('user_profile_picture');
  //         localStorage.removeItem('profile_picture');
  //         this.appservice.setEmptyProjects();
  //         this.appservice.setEmptyIssue();
  //         this.appservice.selectedIssueId = null;
  //         this.appservice.selectedIssueName = null;
  //         this.appservice.activeProjectName = null;
  //         this.appservice.activeProjectId = null;
  //         //this.appservice.showTopDiv = true;
  //         this.appservice.totalTimeWorked = null;
  //         this.appservice.activeTimerValue = '00:00:00';
  //         this.appservice.runningIssueTrackTime = '00:00:00';
  //         this.appservice.selectedIssueTrackedTime = '00:00:00';
  //         this.appservice.runningIssueId = null;
  //         this.appservice.timerArr = [];
  //         this.appservice.userTimerRecord = [];
  //         this.appservice.currentDate = undefined;
  //         this.appservice.totalTimeWorked = '00:00:00';
  //         this.appservice.offset = 0;
  //         this.appservice.searchBy = '';
  //         this.appservice.searchByProj = '';
  //         this.appservice.settingSource = [];
  //         try {
  //           this.getUserProfile();
  //           this.getIssueListOnPageLoad();
  //           this.getAllSource();
  //         }
  //         catch (err) {
  //           this.appservice.isRefreshingIcon = false;
  //           this.appservice.isRefreshing = false;
  //         }
  //         this.appservice.isRefreshingIcon = false;
  //         this.appservice.isRefreshing = false;
  //       }, 7000);
  //     });
  //   } else {
  //     this.appservice.isRefreshing = true;
  //     this.appservice.isRefreshingIcon = true;
  //     this.appservice.refreshSourceCode = this.appservice.selectedSourcecode;
  //     this.appservice.offset = 0;
  //     localStorage.removeItem('projects');
  //     localStorage.removeItem('running_Issue_track_time');
  //     localStorage.removeItem('user_profile_picture');
  //     localStorage.removeItem('profile_picture');
  //     this.appservice.setEmptyProjects();
  //     this.appservice.selectedIssueId = null;
  //     this.appservice.selectedIssueName = null;
  //     this.appservice.activeProjectName = null;
  //     this.appservice.activeProjectId = null;
  //     this.appservice.totalTimeWorked = null;
  //     this.appservice.showTopDiv = true;
  //     this.appservice.totalTimeWorked = '00:00:00';
  //     this.appservice.activeTimerValue = '00:00:00';
  //     this.appservice.runningIssueTrackTime = '00:00:00';
  //     this.appservice.selectedIssueTrackedTime = '00:00:00';
  //     this.appservice.runningIssueId = null;
  //     this.appservice.timerArr = [];
  //     this.appservice.userTimerRecord = [];
  //     this.appservice.currentDate = undefined;
  //     this.appservice.searchBy = '';
  //     this.appservice.searchByProj = '';
  //     // try {
  //       this.getUserProfile();
  //       this.getIssueListOnPageLoad();
  //       this.getAllSource();
  //     // }
  //     // catch (err) {
  //     //   this.appservice.isRefreshingIcon = false;
  //     //   this.appservice.isRefreshing = false;
  //     // }
  //     // this.appservice.lastSourceCode = this.appservice.refreshSourceCode;
  //     // await this.getProjects(this.appservice.refreshSourceCode);
  //     this.appservice.isRefreshingIcon = false;
  //     this.appservice.isRefreshing = false;
  //     // setTimeout(async () => {
  //     //   //await this.getProjects(this.appservice.lastSourceCode);
  //     //   await this.getIssueListOnPageLoad();
  //     // }, 1000);
  //   }
  //   //this.appservice.isRefreshingIcon = false;
  // }
  shortcutRefresh() {
    if (isElectron()) {
      this.electronService.ipcRenderer.on('on-refresh', () => {
        const refreshButton = document.getElementById(
          'refreshButton'
        ) as HTMLButtonElement;
        if (refreshButton) {
          refreshButton.click();
        }
      });
    }
  }
  async refresh() {
    this.searchText = '';
    this.getUtcTimeFromApi();
    this.getUtcTimeFromSystem();
    this.systemIdleTimeChecker();
    this.appservice.isRefreshing = true;
    this.appservice.isRefreshingIcon = true;
    //this.issueListComponent.clearSearchInput();
    if (this.appservice.runningIssueId) {
      //this.appservice.isRefreshingIcon = true;
      this.timerstart(
        'stop',
        this.appservice.lastTrackDtl.lastTaskID,
        this.appservice.activeIssueName,
        this.appservice.activeProjectName,
        this.appservice.activeProjectId,
        this.appservice.activeBaseUrlId
      ).then(() => {
        setTimeout(async () => {
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
          //this.appservice.showTopDiv = true;
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
          try {
            await this.getUserProfile();
            await this.getIssueListOnPageLoad();
            await this.getAllSource();
          } catch (err) {
            this.appservice.isRefreshingIcon = false;
            this.appservice.isRefreshing = false;
          }
          this.appservice.isRefreshingIcon = false;
          this.appservice.isRefreshing = false;
        }, 7000);
      });
    } else {
      this.appservice.refreshSourceCode = this.appservice.selectedSourcecode;
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
      this.appservice.showTopDiv = true;
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
      try {
        await this.getUserProfile();
        await this.getIssueListOnPageLoad();
        await this.getAllSource();
      } catch (err) {
        this.appservice.isRefreshingIcon = false;
        this.appservice.isRefreshing = false;
      }
      this.appservice.lastSourceCode = this.appservice.refreshSourceCode;
      await this.getProjects(this.appservice.refreshSourceCode);
      this.appservice.isRefreshingIcon = false;
      this.appservice.isRefreshing = false;
      // setTimeout(async () => {
      //   //await this.getProjects(this.appservice.lastSourceCode);
      //   await this.getIssueListOnPageLoad();
      // }, 1000);
    }
    //this.appservice.isRefreshingIcon = false;
  }
  async saveTime2(obj) {
    console.log('savetime2');
    await this.getUtcTimeFromApi();
    await this.getUtcTimeFromSystem();
    const minuteBuffer = 1; // Set the buffer to 1 minute
    const minuteDifference = Math.abs(
      this.getUtcTimeFromSystemResult.minute -
      this.getUtcTimeFromApiResult.minute
    );
    if (
      (this.getUtcTimeFromSystemResult.year ===
        this.getUtcTimeFromApiResult.year &&
        this.getUtcTimeFromSystemResult.month ===
        this.getUtcTimeFromApiResult.month &&
        this.getUtcTimeFromSystemResult.day ===
        this.getUtcTimeFromApiResult.day &&
        this.getUtcTimeFromSystemResult.hour ===
        this.getUtcTimeFromApiResult.hour &&
        minuteDifference <= minuteBuffer) ||
      (this.getUtcTimeFromSystemResult.year ===
        this.getUtcTimeFromApiResult.year &&
        this.getUtcTimeFromSystemResult.month ===
        this.getUtcTimeFromApiResult.month &&
        this.getUtcTimeFromSystemResult.day ===
        this.getUtcTimeFromApiResult.day &&
        this.getUtcTimeFromSystemResult.hour ===
        this.getUtcTimeFromApiResult.hour &&
        minuteDifference <= minuteBuffer)
    ) {
      try {
        return new Promise(async (resolve, reject) => {
          this.appservice.currentDate = undefined;
          // Store pending API requests
          const pendingRequests = {};
          let timeCount = 0;
          if (
            this.appservice.setting['Pages.EditTrackTime.AddTimeTracker'] ===
            'true'
          ) {
            const currentTaskId = obj.taskId;
            // Store the pending API request for the current taskId
            pendingRequests[currentTaskId] = this.appservice
              .saveData(obj)
              .toPromise();
            try {
              const res = await pendingRequests[currentTaskId];
              if (res && res.result && res.result.endTime) {
                let timeCount1 = 0;
                timeCount1 = timeCount;
                timeCount = 0;
                const totalSeconds = res.result.totalTimeInSec;
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                const formattedTime = `${hours
                  .toString()
                  .padStart(2, '0')}:${minutes
                    .toString()
                    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                // Update the tracked time only if the response taskId matches the current taskId
                //if (res.result.taskId === currentTaskId) {
                const trackedissueObj = this.appservice.userTimerRecord.find(
                  (xy) => xy.id === currentTaskId
                );
                trackedissueObj.trackTime = formattedTime;
                this.trackedTime = trackedissueObj.trackTime;
                //}
                // Clean up the pending request after processing
                delete pendingRequests[currentTaskId];

                if (!this.appservice.savedIssueIds.includes(obj.taskId)) {
                  this.appservice.savedIssueIds.push(obj.taskId);
                }
                startTime = undefined;
                endTime = undefined;
                this.deleteFromLocalDb(obj.endTime);
                this.appservice.isIdleTime = false;
                resolve(null);
                // timeCount1 = 0;
                const diff =
                  new Date(this.appservice.currentDate).getTime() -
                  new Date(this.appservice.trackStartTime).getTime();
                const differenceinTime = moment
                  .utc(diff)
                  .format('HH:mm:ss')
                  .toString();
                const slicediff = differenceinTime.slice(0, 5);
                const objdiff = obj.trackTime.toString();
                const sliceobjdiff = objdiff.slice(0, 5);
                if (slicediff !== sliceobjdiff) {
                  // ... handle the time difference if needed ...
                }
                this.getRecentTasks();
                // await this.getUtcTimeFromApi();
                // await this.getUtcTimeFromSystem();
              }
              resolve(null);
            } catch (err) {
              endTime = undefined;
              this.appservice.trackStartTime = moment.utc().format();
              // this.appservice.currentDate = moment.utc().format();
              // this.appservice.trackStartTime =
              // new Date(this.appservice.currentDate);
              this.electronService.ipcRenderer.send(
                'saveText',
                '\n Error in in save time 2' + err
              );
              await this.systemIdleTimeChecker();
              reject(err);
              await this.getUtcTimeFromApi();
              await this.getUtcTimeFromSystem();
            }
          } else {
            this.issue = 'You dont have permissions for saving time';
            this.modalService
              .open(this.modalPermission, {
                ariaLabelledBy: 'modal-basic-title',
              })
              .result.then(
                (result) => {
                  this.closeResult = `Closed with: ${result}`;
                },
                (reason) => {
                  //this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                }
              );
            startTime = undefined;
            endTime = undefined;
            this.appservice.trackStartTime = this.appservice.currentDate;
          }
        });
      } catch (err) {
        startTime = undefined;
        endTime = undefined;
        // this.appservice.trackStartTime = new Date(this.appservice.currentDate);
        this.appservice.trackStartTime = moment.utc().format();
        // this.messages = err.error.error.message + '   Please Refresh Again';
        this.messages = 'Internal server error ' + '   Please Refresh Again';
        //throw new Error('Error in saving time');
        // Sentry.captureException(err);
        // const eventId = Sentry.lastEventId();
        // if (eventId && !this.errorDialogService.isDialogOpenForEvent(eventId)) {
        //   // Show a Sentry error dialog for the user to provide more information
        //   Sentry.showReportDialog({ eventId });
        //   // Mark the dialog as open for this event
        //   this.errorDialogService.openDialogForEvent(eventId);
        // }
      }
    } else {
      if (this.appservice.runningIssueId) {
        this.timerstart(
          'stop',
          this.appservice.lastTrackDtl.lastTaskID,
          this.appservice.activeIssueName,
          this.appservice.activeProjectName,
          this.appservice.activeProjectId,
          this.appservice.activeBaseUrlId
        );
      }
      setTimeout(() => {
        this.openModalForManualTime();
      }, 2000);
      //resolve(null);
    }
    // await this.getUtcTimeFromApi();
    // await this.getUtcTimeFromSystem();
  }

  async saveTimeForAutoSave(obj) {
    await this.getUtcTimeFromApi();
    await this.getUtcTimeFromSystem();
    const minuteBuffer = 1; // Set the buffer to 1 minute
    const minuteDifference = Math.abs(
      this.getUtcTimeFromSystemResult.minute -
      this.getUtcTimeFromApiResult.minute
    );
    if (
      (this.getUtcTimeFromSystemResult.year ===
        this.getUtcTimeFromApiResult.year &&
        this.getUtcTimeFromSystemResult.month ===
        this.getUtcTimeFromApiResult.month &&
        this.getUtcTimeFromSystemResult.day ===
        this.getUtcTimeFromApiResult.day &&
        this.getUtcTimeFromSystemResult.hour ===
        this.getUtcTimeFromApiResult.hour &&
        minuteDifference <= minuteBuffer) ||
      (this.getUtcTimeFromSystemResult.year ===
        this.getUtcTimeFromApiResult.year &&
        this.getUtcTimeFromSystemResult.month ===
        this.getUtcTimeFromApiResult.month &&
        this.getUtcTimeFromSystemResult.day ===
        this.getUtcTimeFromApiResult.day &&
        this.getUtcTimeFromSystemResult.hour ===
        this.getUtcTimeFromApiResult.hour &&
        minuteDifference <= minuteBuffer)
    ) {
      try {
        let startTimeAutoSave: number;
        let endTimeAutoSave: number;
        startTimeAutoSave = performance.now();
        return new Promise(async (resolve, reject) => {
          this.appservice.currentDate = undefined;
          // Store pending API requests
          const pendingRequests = {};
          if (
            this.appservice.setting['Pages.EditTrackTime.AddTimeTracker'] ===
            'true'
          ) {
            const currentTaskId = obj.taskId;
            this.appservice.isAddtimeTracker = false;
            // Store the pending API request for the current taskId
            pendingRequests[currentTaskId] = this.appservice
              .saveData(obj)
              .toPromise();
            try {
              const res = await pendingRequests[currentTaskId];
              if (res && res.result && res.result.endTime) {
                this.appservice.isAddtimeTracker = true;
                endTimeAutoSave = performance.now();
                const elapsedTimeInSeconds =
                  (endTimeAutoSave - startTimeAutoSave) / 1000;

                const totalSeconds = res.result.totalTimeInSec;
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                const formattedTime = `${hours
                  .toString()
                  .padStart(2, '0')}:${minutes
                    .toString()
                    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                // Update the tracked time only if the response taskId matches the current taskId
                //if (res.result.taskId === currentTaskId) {
                const trackedissueObj = this.appservice.userTimerRecord.find(
                  (xy) => xy.id === currentTaskId
                );
                const [hoursStr, minutesStr, secondsStr] =
                  formattedTime.split(':');
                const newSeconds = seconds + Math.floor(elapsedTimeInSeconds);
                const carryoverMinutes = Math.floor(newSeconds / 60);
                const updatedMinutes = minutes + carryoverMinutes;
                const updatedSeconds = newSeconds % 60;
                const updatedTime = `${hours
                  .toString()
                  .padStart(2, '0')}:${updatedMinutes
                    .toString()
                    .padStart(2, '0')}:${updatedSeconds
                      .toString()
                      .padStart(2, '0')}`;
                trackedissueObj.trackTime = updatedTime;
                this.trackedTime = trackedissueObj.trackTime;
                //}
                // Clean up the pending request after processing
                delete pendingRequests[currentTaskId];

                if (!this.appservice.savedIssueIds.includes(obj.taskId)) {
                  this.appservice.savedIssueIds.push(obj.taskId);
                }
                startTime = undefined;
                endTime = undefined;
                this.deleteFromLocalDb(obj.endTime);
                this.appservice.isIdleTime = false;
                resolve(null);
                // timeCount1 = 0;
                const diff =
                  new Date(this.appservice.currentDate).getTime() -
                  new Date(this.appservice.trackStartTime).getTime();
                const differenceinTime = moment
                  .utc(diff)
                  .format('HH:mm:ss')
                  .toString();
                const slicediff = differenceinTime.slice(0, 5);
                const objdiff = obj.trackTime.toString();
                const sliceobjdiff = objdiff.slice(0, 5);
                if (slicediff !== sliceobjdiff) {
                  // ... handle the time difference if needed ...
                }
                this.getRecentTasks();
                await this.getUtcTimeFromApi();
                await this.getUtcTimeFromSystem();
              }
              resolve(null);
            } catch (err) {
              startTime = undefined;
              endTime = undefined;
              this.appservice.trackStartTime =
                this.appservice.newtrackStartTime;
              this.savedatatoLocalDb(obj);
              this.electronService.ipcRenderer.send(
                'saveText',
                '\n Error in in save time 2' + err
              );
              await this.systemIdleTimeChecker();
              reject(err);
              await this.getUtcTimeFromApi();
              await this.getUtcTimeFromSystem();
            }
          } else {
            this.issue = 'You dont have permissions for saving time';
            this.modalService
              .open(this.modalPermission, {
                ariaLabelledBy: 'modal-basic-title',
              })
              .result.then(
                (result) => {
                  this.closeResult = `Closed with: ${result}`;
                },
                (reason) => {
                  //this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                }
              );
            await this.getUtcTimeFromApi();
            await this.getUtcTimeFromSystem();
          }
        });
      } catch (err) {
        // this.messages = err.error.error.message + '   Please Refresh Again';
        startTime = undefined;
        endTime = undefined;
        //this.appservice.trackStartTime = new Date(this.appservice.currentDate);
        this.appservice.trackStartTime = this.appservice.newtrackStartTime;
        this.messages = 'Internal server error ' + '   Please Refresh Again';
        await this.getUtcTimeFromApi();
        await this.getUtcTimeFromSystem();
      }
    } else {
      this.timerstart(
        'stop',
        this.appservice.lastTrackDtl.lastTaskID,
        this.appservice.activeIssueName,
        this.appservice.activeProjectName,
        this.appservice.activeProjectId,
        this.appservice.activeBaseUrlId
      );
      setTimeout(() => {
        this.openModalForManualTime();
      }, 2000);
      //resolve(null);
    }
  }

  // async takeDesktopScreenshot() {
  //   this.electronService.ipcRenderer.send('screenshot');
  //   this.electronService.ipcRenderer.on('asynchronous-reply', (_event, arg) => {
  //     this.appservice.base64EncodedImage = arg;
  //     return this.appservice.base64EncodedImage;
  //   });
  // }

  async takeDesktopScreenshot() {
    try {
      const screenshotPromise = new Promise<string | null>((resolve) => {
        this.electronService.ipcRenderer.on(
          'asynchronous-reply',
          (_event, arg) => {
            resolve(arg);
          }
        );
      });
      this.electronService.ipcRenderer.send('screenshot');
      const newScreenshot = await screenshotPromise;
      if (newScreenshot) {
        this.appservice.base64EncodedImage = newScreenshot;
      } else {
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  }

  systemIdleTimeChecker() {
    interval(1000).subscribe(() => {
      if (navigator.onLine) {
        // this.appservice.isRefreshingIcon = false;
        // this.appservice.isRefreshing = false;
        if (this.appservice.isOnline !== navigator.onLine) {
          this.getUnsavedDataFromlocalDb();
        }
        this.appservice.isOnline = true;
      } else {
        this.appservice.isOnline = false;
        if (
          this.appservice.runningIssueId === this.appservice.selectedIssueId
        ) {
          this.appservice.activeIssueId,
            this.appservice.activeIssueName,
            this.appservice.activeProjectName,
            this.appservice.activeProjectId,
            this.appservice.activeBaseUrlId;
        }
      }
      const idleTime: number = this.appservice.idleTime;
      this.electronService.ipcRenderer.send(
        'requestSystemIdleStatus',
        idleTime.toString()
      ); // Send IPC message to request system idle status
      this.electronService.ipcRenderer.on(
        'systemIdleStatus',
        (event, isSystemIdle) => {
          if (isSystemIdle === 1) {
            if (
              !this.modalService.hasOpenModals() &&
              this.appservice.runningIssueId
            ) {
              this.stopTracking();
            }
          }
        }
      );
    });
  }
  startTimer() {
    this.idleTimeCounter = 100;
    this.timerInterval ? this.timerInterval.unsubscribe() : null;
    this.timerInterval = timer(1, 1000).subscribe((time) => {
      if (this.idleTimeCounter >= 2) {
        this.idleTimeCounter = parseInt(
          (
            ((this.appservice.idleModalOpenTime - time) /
              this.appservice.idleModalOpenTime) *
            100
          ).toFixed(0)
        );
      } else {
        this.timerInterval.unsubscribe();
      }
    });
  }
  stopTracking() {
    try {
      this.electronService.ipcRenderer.send('app_bring_to_front');
      this.appservice.isIdleTime = true;
      this.startTimer();
      this.modalService.open(this.modalContent).result.then(
        async (result) => {
          //this.countdown.begin();
          this.closeResult = `Closed with: ${result}`;
          console.log('result: ', result);
          if (result === 'yes') {
            console.log('yes');
            this.timerstart(
              'start',
              this.appservice.selectedIssueId,
              this.appservice.activeIssueName,
              this.appservice.activeProjectName,
              this.appservice.activeProjectId,
              this.appservice.activeBaseUrlId
            );
          } else {
            this.timerstart(
              'stop',
              this.appservice.selectedIssueId,
              this.appservice.activeIssueName,
              this.appservice.activeProjectName,
              this.appservice.activeProjectId,
              this.appservice.activeBaseUrlId
            );
            this.timerInterval.unsubscribe();
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
    } catch (err) {
      // this.messages = err.error.error.message + '   Please Refresh Again';
      this.messages = 'Internal server error ' + '   Please Refresh Again';
      // throw new Error('Error in stopping timer during idle state');
    }
  }
  // d(action: string) {
  //   if (action === 'Cross click') {
  //     // Perform custom logic on close button click
  //     // This function won't close the modal by default
  //   }
  // }

  // stopTracking() {
  //   try {
  //     this.electronService.ipcRenderer.send('app_bring_to_front');
  //     this.appservice.isIdleTime = true;
  //     this.startTimer();
  //     this.modalService.open(this.modalContent).result.then(
  //       (result) => {
  //         //this.countdown.begin();
  //         this.closeResult = `Closed with: ${result}`;
  //         if (result === 'yes') {
  //           this.timerstart(
  //             'start',
  //             this.appservice.selectedIssueId,
  //             this.appservice.activeIssueName,
  //             this.appservice.activeProjectName,
  //             this.appservice.activeProjectId,
  //             this.appservice.activeBaseUrlId
  //           );
  //         } else {
  //           this.timerstart(
  //             'stop',
  //             this.appservice.selectedIssueId,
  //             this.appservice.activeIssueName,
  //             this.appservice.activeProjectName,
  //             this.appservice.activeProjectId,
  //             this.appservice.activeBaseUrlId
  //           );
  //         }
  //       },
  //       (reason) => {
  //         this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //       }
  //     );
  //   } catch (err) {
  //     this.messages = err.error.error.message + '   Please Refresh Again';
  //     throw new Error('Error in stopping timer during idle state');
  //   }
  // }

  async getAllSource() {
    try {
      this.appservice.showTopDiv = true;
      this.appservice.settingSource = [];
      this.appservice.projects = [];
      this.appservice.totalProject = undefined;

      if (!this.appservice.getAllSourceTypeLoading) {
        this.appservice.getAllSourceTypeLoading = true;
        const res: GetAllSourceType = await this.appservice.getAllSourceType();
        if (res.result.items.length > 0) {
          this.appservice.settingSource = res.result.items;
          let flag = 0;
          for (const element of this.appservice.settingSource) {
            const payload = element.sourceCode;
            if (!this.appservice.getUserApiKeysLoading) {
              this.appservice.getUserApiKeysLoading = true;
              const res1: UserApiResponse | EmptyResponse =
                await this.appservice.getUserApiKeys(payload);
              if (res1.result.length === 0) {
                this.router.navigate(['/detail/settings']);
              } else {
                flag++;
                //break;
              }
              this.appservice.getUserApiKeysLoading = false;
            }
          }
          //await this.getProjects(this.appservice.lastSourceCode, 0);
          if (flag >= 1) {
            this.router.navigate(['/detail/dashboard']);
            if (this.appservice.lastSourceCode) {
              await this.getProjects(this.appservice.lastSourceCode, 0);
            } else {
              await this.getProjects(res.result.items[0].sourceCode, 0);
            }
          }
        } else {
          this.router.navigate(['/detail/setting']);
        }
        this.appservice.getAllSourceTypeLoading = false;
      } else {
        this.appservice.getAllSourceTypeLoading = false;
      }
    } catch (err) {
      this.messages = err.error.error.message + '   Please Refresh Again';
      this.visability = true;
      setTimeout(() => {
        this.visability = false;
      }, 5000);
      this.appservice.isSkeletonLoading = false;
    }
  }
  getLogoPath(sourceName: string): string {
    return this.logoMapping[sourceName] || 'default/logo.png';
  }
  ngAfterViewInit() {
    this.getIssueListOnPageLoad();
  }
  getIssueListOnPageLoad = async () => {
    try {
      this.appservice.isSkeletonLoading = true;
      const date = moment().format('YYYY/MM/DD');
      const time = '00:00';
      const dateTime = moment(date + ' ' + time, 'YYYY/MM/DD HH:mm')
        .utc()
        .format();
      const obj = {
        StartDate: dateTime,
        EndDate: moment.utc().format(),
      };
      if (
        this.appservice.setting[
        'Pages.Redmine.Projects.LastProjectTrackTime'
        ] === 'true'
      ) {
        // if (!this.appservice.getTotalTimeAndLastTrackTimeLoading) {
        //   this.appservice.getTotalTimeAndLastTrackTimeLoading = true;
        const res: GetProjectLastTrackedTime =
          await this.appservice.getTotalTimeAndLastTrackTime(obj);
        this.appservice.lastTrackDtl = res.result;
        this.appservice.lastSourceCode = res.result.sourceCode;
        if (res.result.totalTrackedTime) {
          const durationInSeconds = moment
            .duration(this.appservice.activeTimerValue)
            .asSeconds();
          this.appservice.totalTimeWorked = moment(
            res.result.totalTrackedTime,
            'HH:mm:ss'
          )
            .add(durationInSeconds, 'seconds')
            .format('HH:mm:ss');
        } else {
          this.appservice.totalTimeWorked = '00:00:00';
        }
        //this.appservice.getTotalTimeAndLastTrackTimeLoading = false;
        //}
        this.visability = false;
        this.appservice.isSkeletonLoading = false;
      } else {
        this.issue = 'You dont have permissions';
        this.modalService
          .open(this.modalPermission, { ariaLabelledBy: 'modal-basic-title' })
          .result.then(
            (result) => {
              this.closeResult = `Closed with: ${result}`;
            },
            (reason) => { }
          );
        this.appservice.isSkeletonLoading = false; // Make sure to set isSkeletonLoading to false in this case as well
      }
    } catch (err) {
      this.messages = err.error.error.message + '   Please Refresh Again';
      this.visability = true;
      this.appservice.isSkeletonLoading = false;
      setTimeout(() => {
        this.visability = false;
      }, 5000);
    }
  };

  async getProjects(userSourceCode, page?) {
    try {
      this.appservice.projects = [];
      endTime = undefined;
      startTime = undefined;
      this.appservice.userSourceCode = userSourceCode;

      if (this.appservice.setting['Pages.Redmine.Projects'] === 'true') {
        this.appservice.userId = localStorage.getItem('user_id');
        const obj = {
          Offset: page || 0,
          Limit: 150,
          SourceCode: userSourceCode,
        };
        this.appservice.selectedSourcecode = userSourceCode;
        if (!this.appservice.getProjectsLoading) {
          this.appservice.getProjectsLoading = true;
          this.appservice.projects = [];
          const res: ProjectResponse = await this.appservice.getProjects(obj);
          if (res.success && res.result) {
            this.appservice.totalProjectCount = res.result.totalCount;
            if (this.appservice.totalProjectCount === 0) {
              this.messages = 'No project found for the current search.';
              this.appservice.totalIssueCount = 0;
              this.appservice.issues = [];
              this.appservice.issuesProjectWise = [];
            }
            this.appservice.issues = [];
            const names = res.result.items.map((item) => item.name);
            res.result.items.forEach((p) => {
              this.searchedProject = p.name;
              p.baseUrl = userSourceCode;
              this.searchedProjectSourceCode = p.baseUrl;
            });
            this.appservice.baseUrlId = null;
            this.appservice.projects = res.result.items;
            const responseLength = res.result.items.length;
            if (responseLength > 0) {
              const matchingProjectSourcecode =
                this.appservice.projects[0].sourceCode;
              if (
                matchingProjectSourcecode === this.appservice.selectedSourcecode
              ) {
              } else {
                this.getProjects(this.appservice.selectedSourcecode);
              }
            } else {
              this.appservice.projects = [];
            }
            this.appservice.baseUrlId =
              res.result.items[0].baseUrlId.toString();
            // Assuming getLastTrackedData is an asynchronous function, you should await it
            await this.getLastTrackedData(userSourceCode);
          } else {
            this.appservice.isSkeletonLoading = false;
            this.appservice.isAssignedProject = false;
            this.loading = false; 
          }
        } else {
          this.appservice.getProjectsLoading = false;
        }
        this.visability = false;
      } else {
        this.issue = 'You dont have permissions';
        this.modalService
          .open(this.modalPermission, { ariaLabelledBy: 'modal-basic-title' })
          .result.then(
            (result) => {
              this.closeResult = `Closed with: ${result}`;
            },
            (reason) => { }
          );
      }
      this.appservice.getProjectsLoading = false;
    } catch (err) {
      //this.visability = true;
      this.messages = err.error.error.message + '   Please Refresh Again';
      this.appservice.isSkeletonLoading = false;
      setTimeout(() => {
        //this.visability = false;
      }, 10000);
      // this.modalService.open(this.modalPermission);
    }
  }

  async getProjectsForRecentTask(userSourceCode, page?) {
    try {
      endTime = undefined;
      startTime = undefined;
      this.appservice.userSourceCode = userSourceCode;
      if (this.appservice.setting['Pages.Redmine.Projects'] === 'true') {
        this.appservice.userId = localStorage.getItem('user_id');
        const obj = {
          Offset: page || 0,
          Limit: 150,
          SourceCode: userSourceCode,
        };
        this.appservice.selectedSourcecode = userSourceCode;
        if (!this.appservice.getProjectsLoading) {
          this.appservice.getProjectsLoading = true;
          this.appservice.projects = [];
          const res: ProjectResponse = await this.appservice.getProjects(obj);
          if (res.success && res.result) {
            this.appservice.totalProjectCount = res.result.totalCount;
            if (this.appservice.totalProjectCount === 0) {
              this.messages = 'No project found for the current search.';
              this.appservice.totalIssueCount = 0;
            }
            this.appservice.issues = [];
            // if (this.appservice.totalIssueCount === 0) {
            //   this.appservice.runningIssueId = null;
            //   // No issues for the current project
            //   this.appservice.issues = null; // Set issues to null to indicate no issues
            // }
            const names = res.result.items.map((item) => item.name);
            res.result.items.forEach((p) => {
              this.searchedProject = p.name;
              p.baseUrl = userSourceCode;
              this.searchedProjectSourceCode = p.baseUrl;
            });
            this.appservice.baseUrlId = null;
            this.appservice.projects = res.result.items;
            this.appservice.baseUrlId =
              res.result.items[0].baseUrlId.toString();

            // Alternatively, you can use a forEach loop to set the baseUrlId:
            // this.appservice.projects.forEach((p) => {
            //   this.appservice.baseUrlId = p.baseUrlId;
            // });

            // Assuming getLastTrackedData is an asynchronous function, you should await it
            //await this.getLastTrackedData(userSourceCode);
          } else {
            this.appservice.isSkeletonLoading = false;
            this.appservice.isAssignedProject = false;
            this.loading = false;
          }
        } else {
          this.appservice.getProjectsLoading = false;
        }
        this.visability = false;
      } else {
        this.issue = 'You dont have permissions';
        this.modalService
          .open(this.modalPermission, { ariaLabelledBy: 'modal-basic-title' })
          .result.then(
            (result) => {
              this.closeResult = `Closed with: ${result}`;
            },
            (reason) => { }
          );
      }
      this.appservice.getProjectsLoading = false;
    } catch (err) {
      this.visability = true;
      this.messages = err.error.error.message + '   Please Refresh Again';
      this.appservice.isSkeletonLoading = false;
      setTimeout(() => {
        this.visability = false;
      }, 10000);
      // this.modalService.open(this.modalPermission);
    }
  }
  async getLastTrackedData(userSourceCode) {
    try {
      if (
        this.appservice.lastTrackDtl &&
        this.appservice.lastTrackDtl.lastProjectId
      ) {
        const trackedprojectObj = this.appservice.projects.find(
          (xy) => xy.id === this.appservice.lastTrackDtl.lastProjectId
        );
        if (trackedprojectObj === undefined) {
          const projectsLength = this.appservice.projects.length;
          if (projectsLength === 0) {
            this.appservice.totalIssueCount = 0;
          } else {
            const trackedprojectObj = this.appservice.projects.find(
              (xy) => xy.id === this.appservice.projects[0].id
            );
            this.selectIssue(
              trackedprojectObj.id,
              userSourceCode,
              trackedprojectObj.name,
              trackedprojectObj.baseUrlId
            );
          }
        } else {
          this.selectIssue(
            trackedprojectObj.id,
            userSourceCode,
            trackedprojectObj.name,
            trackedprojectObj.baseUrlId
          );
        }
      } else {
        const trackedprojectObj = this.appservice.projects.find(
          (xy) => xy.id === this.appservice.projects[0].id
        );
        await this.selectIssue(
          trackedprojectObj.id,
          trackedprojectObj.baseUrl,
          trackedprojectObj.name,
          trackedprojectObj.baseUrlId
        );
      }
    } catch (err) {
      this.messages = err.error.error.message + '   Please Refresh Again';
      throw new Error('Error in fetching last tracked data');
    }
  }
  scrollToDivProject() {
    var targetDiv = document.getElementById('project');
    if (targetDiv) {
      targetDiv.scrollIntoView({ behavior: 'smooth' });
    }
  }
  scrollToDivIssue() {
    var targetDiv = document.getElementById('issue');
    if (targetDiv) {
      targetDiv.scrollIntoView({ behavior: 'smooth' });
    }
  }
  async selectTasksFromRecentTasks(id, taskId, source, projectname, baseUrlId) {
    this.appservice.selectTasksFromRecenTasks = true;
    this.appservice.checkSourcecodeForRecentTasks = false;
    if (source !== this.appservice.lastSourceCode) {
      this.appservice.checkSourcecodeForRecentTasks = true;
      this.appservice.lastSourceCode = source;
    }
    const event = {
      panelId: source, // Provide the appropriate panelId
      nextState: true, // Set the desired nextState value
    };
    this.appservice.sourceCodeRecentTasks = source;
    await this.toggleAccordian2(event);
    //await this.getProjectsForRecentTask(source);
    this.appservice.recentSelectedTaskId = taskId;
    this.appservice.selectedissueclass = this.appservice.recentSelectedTaskId;
    this.appservice.selectProject = true;
    this.appservice.issuesProjectWise = [];
    this.loading = true;
    this.appservice.isSkeletonLoading = true;
    this.appservice.issues = [];
    this.appservice.offset = 0;
    this.appservice.issueoffest = 0;
    if (this.appservice.runningIssueId) {
      if (
        this.appservice.runningIssueId !== this.appservice.recentSelectedTaskId
      ) {
        this.issueIdForSave = this.appservice.runningIssueId;
        this.appservice.activeIssueId = this.appservice.recentSelectedTaskId;
        this.appservice.timerStatus = false;
        this.appservice.runningIssue.next('false');
        this.appservice.showTopDiv = false;
        if (this.appservice.tt) {
          this.appservice.tt.unsubscribe();
        }
        if (this.appservice.dd) {
          this.appservice.dd.unsubscribe();
        }
        this.appservice.selectedprojectclass =
          this.appservice.selectedProjectId;
        this.appservice.selectedBaseurlIdClass =
          this.appservice.selectedBaseUrlId;
        // this.takeDesktopScreenshot();//OLD CODE
        // this.saveTime();//OLD CODE
        let objForSaveTime = {};
        this.appservice.currentDate = moment.utc().format();
        const trackStartTime = new Date(this.appservice.trackStartTime);
        const trackCurrentDate = new Date(this.appservice.currentDate);
        const timeDifferenceMilliseconds =
          trackCurrentDate.getTime() - trackStartTime.getTime();
        objForSaveTime['projectId'] = this.appservice.activeProjectId;
        objForSaveTime['projectName'] = this.appservice.activeProjectName;
        objForSaveTime['taskId'] = this.issueIdForSave;
        objForSaveTime['taskname'] = this.appservice.activeIssueName;
        objForSaveTime['sourceCode'] = this.appservice.addtimeSourceCode;
        objForSaveTime['startTime'] = this.appservice.trackStartTime;
        objForSaveTime['endTime'] = this.appservice.currentDate;
        objForSaveTime['baseUrlId'] = this.appservice.activeBaseUrlId;
        objForSaveTime['trackTime'] = this.appservice.activeTimerValue;
        objForSaveTime['isIdleTime'] = this.appservice.isIdleTime;
        objForSaveTime['TimeOffsetInMins'] = this.appservice.timeZoneOffset;
        const trackTimeInMinutes = this.convertTimeToMinutes(
          this.appservice.activeTimerValue
        );
        this.electronService.ipcRenderer.send('activityStop');
        this.activityLogHandle(trackTimeInMinutes);
        this.takeDesktopScreenshot().then(async (res) => {
          if (isElectron()) {
            (objForSaveTime['imageName'] = 'screenshot.png'),
              (objForSaveTime['imageSource'] =
                this.appservice.base64EncodedImage);
          } else {
            objForSaveTime['imageName'] = '';
            objForSaveTime['imageSource'] = '';
          }
          this.appservice.selectIssueInTopSecSourceCode = this.appservice.addtimeSourceCode;
          console.log('this.appservice.selectIssueInTopSecSourceCode: ', this.appservice.selectIssueInTopSecSourceCode);
          await this.saveTime2(objForSaveTime).then((res) => {
            objForSaveTime = null;
          });
          //await this.getIssueListOnPageLoad();
        });
        this.appservice.activeTimerValue = '00:00:00';
        this.appservice.showTopDiv = false;
        this.appservice.runningIssueId = null;
        this.appservice.activeIssueId = null;
      }
    } else {
      this.appservice.activeIssueId = this.appservice.recentSelectedTaskId;
    }

    this.appservice.selectedissueclass = this.appservice.recentSelectedTaskId;
    this.scrollToDivProject();
    setTimeout(() => {
      this.getIssuesByProjectId(
        id,
        source,
        projectname,
        baseUrlId,
        this.appservice.offset
      );
      this.getIssuesByProjectId(
        id,
        source,
        projectname,
        baseUrlId,
        this.appservice.offset
      );
    }, 2000);
    console.log('this.appservice.lastSourceCode: ', this.appservice.lastSourceCode);
    console.log('this.appservice.sourceCodeRecentTasks: ', this.appservice.sourceCodeRecentTasks);
    setTimeout(async () => {
      if (this.appservice.lastSourceCode !== this.appservice.sourceCodeRecentTasks) {
        await this.getProjects(this.appservice.lastSourceCode);
        console.log('this.appservice.projects: ', this.appservice.projects);
        setTimeout(() => {
          console.log('this.appservice.projects 1: ', this.appservice.projects);
          if (this.appservice.projects.length == 0) {
            this.appservice.totalIssueCount = 0;
            this.appservice.issues = [];
            this.appservice.issuesProjectWise = [];
          }
        }, 2000);
      }
    }, 3000);

    setTimeout(() => {
      console.log('this.appservice.projects 2: ', this.appservice.projects);
      if (this.appservice.projects.length == 0) {
        this.appservice.totalIssueCount = 0;
        this.appservice.issues = [];
        this.appservice.issuesProjectWise = [];
      }
    }, 4000);
  }
  async selectIssueFromSearch(id, taskId, source, projectname, baseUrlId) {
    this.appservice.issuesProjectWise = [];
    this.appservice.issues = [];
    this.appservice.searchSelectTaskId = taskId;
    this.appservice.selectedissueclass = this.appservice.searchSelectTaskId;
    this.appservice.selectIssue = true;
    this.loading = true;
    this.appservice.isSkeletonLoading = true;
    this.appservice.offset = 0;
    this.appservice.issueoffest = 0;
    if (this.appservice.runningIssueId) {
      if (
        this.appservice.runningIssueId !== this.appservice.searchSelectTaskId
      ) {
        this.issueIdForSave = this.appservice.runningIssueId;
        this.appservice.activeIssueId = this.appservice.searchSelectTaskId;
        this.appservice.timerStatus = false;
        this.appservice.runningIssue.next('false');
        this.appservice.showTopDiv = false;
        if (this.appservice.tt) {
          this.appservice.tt.unsubscribe();
        }
        if (this.appservice.dd) {
          this.appservice.dd.unsubscribe();
        }
        this.appservice.selectedprojectclass =
          this.appservice.selectedProjectId;
        this.appservice.selectedBaseurlIdClass =
          this.appservice.selectedBaseUrlId;
        // this.takeDesktopScreenshot();//OLD CODE
        // this.saveTime();//OLD CODE
        let objForSaveTime = {};
        this.appservice.currentDate = moment.utc().format();
        const trackStartTime = new Date(this.appservice.trackStartTime);
        const trackCurrentDate = new Date(this.appservice.currentDate);
        const timeDifferenceMilliseconds = trackCurrentDate.getTime() - trackStartTime.getTime();
        objForSaveTime['projectId'] = this.appservice.activeProjectId;
        objForSaveTime['projectName'] = this.appservice.activeProjectName;
        objForSaveTime['taskId'] = this.issueIdForSave;
        objForSaveTime['taskname'] = this.appservice.activeIssueName;
        objForSaveTime['sourceCode'] = this.appservice.addtimeSourceCode;
        objForSaveTime['startTime'] = this.appservice.trackStartTime;
        objForSaveTime['endTime'] = this.appservice.currentDate;
        objForSaveTime['baseUrlId'] = this.appservice.activeBaseUrlId;
        objForSaveTime['trackTime'] = this.appservice.activeTimerValue;
        objForSaveTime['isIdleTime'] = this.appservice.isIdleTime;
        objForSaveTime['TimeOffsetInMins'] = this.appservice.timeZoneOffset;
        const trackTimeInMinutes = this.convertTimeToMinutes(
          this.appservice.activeTimerValue
        );
        this.electronService.ipcRenderer.send('activityStop');
        this.activityLogHandle(trackTimeInMinutes);
        this.takeDesktopScreenshot().then(async (res) => {
          if (isElectron()) {
            (objForSaveTime['imageName'] = 'screenshot.png'),
              (objForSaveTime['imageSource'] =
                this.appservice.base64EncodedImage);
          } else {
            objForSaveTime['imageName'] = '';
            objForSaveTime['imageSource'] = '';
          }
          this.appservice.selectIssueInTopSecSourceCode = this.appservice.addtimeSourceCode;
          console.log('this.appservice.selectIssueInTopSecSourceCode 2: ', this.appservice.selectIssueInTopSecSourceCode);
          await this.saveTime2(objForSaveTime).then((res) => {
            objForSaveTime = null;
          });
        });
        this.appservice.activeTimerValue = '00:00:00';
        this.appservice.showTopDiv = false;
        this.appservice.runningIssueId = null;
        this.appservice.activeIssueId = null;
      }
    } else {
      this.appservice.activeIssueId = this.appservice.searchSelectTaskId;
    }
    this.searchShowResults = false;
    this.appservice.filteredIssues = [];
    this.appservice.selectedissueclass = this.appservice.searchSelectTaskId;
    this.getIssuesByProjectId(
      id,
      this.appservice.userSourceCode,
      projectname,
      baseUrlId,
      this.appservice.offset
    );
    this.getIssuesByProjectId(
      id,
      this.appservice.userSourceCode,
      projectname,
      baseUrlId,
      this.appservice.offset
    );
  }

  async selectIssue(id, source, projectname, baseUrlId) {
    this.appservice.issuesProjectWise = [];
    this.appservice.issues = [];
    this.appservice.selectIssue = true;
    this.loading = true;
    this.appservice.isSkeletonLoading = true;
    this.appservice.offset = 0;
    this.appservice.issueoffest = 0;
    await this.getIssuesByProjectId(
      id,
      this.appservice.userSourceCode,
      projectname,
      baseUrlId,
      this.appservice.offset
    );
  }

  async getIssuesByProjectId(id, source, projectname, baseUrlId?, offset?) {
    try {
      this.appservice.selectedprojectclass = id;
      this.appservice.selectedBaseurlIdClass = baseUrlId;
      this.appservice.userSourceCode = source;
      const userid = localStorage.getItem('user_id');
      //this.appservice.isSkeletonLoading = true;
      const date = moment().format('YYYY/MM/DD');
      const time = '00:00';
      const StartTime = moment(date + ' ' + time, 'YYYY/MM/DD HH:mm')
        .utc()
        .format();
      this.loading = false;
      const EndTime = moment.utc().format();
      this.appservice.issues = [];
      // if (!this.appservice.getIssuesByProjectIdLoading) {
      //   this.appservice.getIssuesByProjectIdLoading = true;
      const res: GetTasksWithTimeByUsersAndProject =
        await this.appservice.getIssuesByProjectId(
          id,
          userid,
          source,
          StartTime,
          EndTime,
          baseUrlId,
          offset
        );
      if (res.success) {
        this.appservice.isSkeletonLoading = false;
        if (res.result.items.length >= 0) {
          this.scrollToDivProject();
          this.scrollToDivIssue();
          this.appservice.isAssignedIssue = true;
          this.visability = false;
          this.appservice.totalIssueCount = res.result.totalCount;
          if (this.appservice.totalIssueCount === 0) {
            this.appservice.issuesProjectWise = [];
          }
          res.result.items.forEach((ele) => {
            if (this.appservice.issuesProjectWise.length > 0) {
              const matchingProject =
                this.appservice.issuesProjectWise[0].projectid;
              if (matchingProject === id) {
                const existingIssue = this.appservice.issuesProjectWise.find(
                  (issue) => issue.id === ele.id
                );
                if (existingIssue) {
                  // Skip adding the issue again
                  return;
                }
              } else {
                this.appservice.issuesProjectWise = [];
              }
            } else {
              this.appservice.issuesProjectWise = [];
            }
            if (this.appservice.runningIssueId === ele.id) {
              const trackInSeconds = moment
                .duration(this.appservice.runningIssueTrackTime)
                .asSeconds();
              ele.trackTime = moment(ele.trackTime, 'HH:mm:ss')
                .add(trackInSeconds, 'seconds')
                .format('HH:mm:ss');
            } else {
              ele.trackTime = ele.trackTime;
            }
            const isVisible = this.appservice.isVisible;
            this.appservice.issuesProjectWise.push({
              id: ele.id,
              issuename: ele.subject,
              trackTime: ele.trackTime,
              projectname: ele.project.name,
              projectid: ele.project.id,
              baseUrlId: baseUrlId,
              isVisible: true,
            });
            const obj = {};
            obj['id'] = ele.id;
            obj['issuename'] = ele.subject;
            obj['trackTime'] = ele.trackTime;
            const isPresent = this.appservice.timerArr.some(function (el) {
              return el.id === ele.id;
            });

            if (!isPresent) {
              this.appservice.timerArr.push(obj);
            }
          });
          if (this.appservice.totalIssueCount === 0) {
            this.appservice.issuesProjectWise = [];
          }
          this.appservice.issuesProjectWise.sort(
            (a, b) => Number(b.id) - Number(a.id)
          );
          if (this.appservice.timerStatus) {
            this.appservice.showTopDiv = true;
            this.appservice.selectedProjectId = this.appservice.activeProjectId;
            this.appservice.selectedBaseUrlId = this.appservice.activeBaseUrlId;
            this.appservice.selectedIssueProjectName =
              this.appservice.activeProjectName;
            this.appservice.selectedIssueId = this.appservice.activeIssueId;
            this.appservice.selectedIssueName = this.appservice.activeIssueName;
            this.appservice.selectedissueclass = this.appservice.activeIssueId;
          } else {
            if (
              this.appservice.selectedissueclass ===
              this.appservice.lastTrackDtl.lastTaskID
            ) {
              const trackedissueObj = this.appservice.issuesProjectWise.find(
                (xy) => xy.id === this.appservice.lastTrackDtl.lastTaskID
              );
              if (trackedissueObj) {
                this.appservice.showTopDiv = true;
                this.appservice.selectedProjectId = trackedissueObj.projectid;
                this.appservice.selectedBaseUrlId = trackedissueObj.baseUrlId;
                this.appservice.selectedIssueProjectName =
                  trackedissueObj.projectname;
                this.appservice.selectedIssueId = trackedissueObj.id;
                this.appservice.selectedIssueName = trackedissueObj.issuename;
                this.appservice.selectedIssueTrackedTime =
                  trackedissueObj.trackTime;
                this.appservice.selectedissueclass = trackedissueObj.id;
              }
            } else {
              if (this.appservice.selectedissueclass === null) {
                this.appservice.selectedissueclass =
                  this.appservice.lastTrackDtl.lastTaskID;
              }
              console.log('(this.appservice.selectedissueclass: ', this.appservice.selectedissueclass);
              console.log('this.appservice.lastTrackDtl.lastTaskID: ', this.appservice.lastTrackDtl.lastTaskID);
              if (this.appservice.checkAfterHibernate) {
                if (this.appservice.selectedissueclass !== this.appservice.lastTrackDtl.lastTaskID) {
                  this.appservice.selectedissueclass =
                    this.appservice.lastTrackDtl.lastTaskID;
                  this.appservice.checkAfterHibernate = false;
                  console.log('this.appservice.checkAfterHibernate: ', this.appservice.checkAfterHibernate);
                  console.log('(this.appservice.selectedissueclass 2: ', this.appservice.selectedissueclass);
                }
              }
              const trackedissueObj = this.appservice.issuesProjectWise.find(
                (xy) => xy.id === this.appservice.selectedissueclass
              );
              if (trackedissueObj) {
                this.appservice.showTopDiv = true;
                this.appservice.selectedProjectId = trackedissueObj.projectid;
                this.appservice.selectedBaseUrlId = trackedissueObj.baseUrlId;
                this.appservice.selectedIssueProjectName =
                  trackedissueObj.projectname;
                this.appservice.selectedIssueId = trackedissueObj.id;
                this.appservice.selectedIssueName = trackedissueObj.issuename;
                this.appservice.selectedIssueTrackedTime =
                  trackedissueObj.trackTime;
                this.appservice.selectedissueclass = trackedissueObj.id;
              }
            }
          }
          this.appservice.updateissueTimmerArr(this.appservice.timerArr);
          this.appservice.userTimerRecord = this.appservice.timerArr;
          this.appservice.issues = this.appservice.issuesProjectWise;
          if (
            this.appservice.totalIssueCount >
            this.appservice.issuesProjectWise.length &&
            res.result.items.length !== 0
          ) {
            this.appservice.issueoffest = this.appservice.issueoffest + 100;
            setTimeout(() => {
              this.getIssuesByProjectId(
                id,
                source,
                projectname,
                baseUrlId,
                this.appservice.issueoffest
              );
            }, 1000);
          }
        } else {
          this.appservice.isSkeletonLoading = false;
          this.appservice.isAssignedIssue = false;
          if (this.appservice.activeIssueId === null) {
            // Handle the case where there are no issues and no active issue
          }
        }
        this.loading = false;
        this.appservice.allowScrolling = true;
      } else {
        this.appservice.isSkeletonLoading = false;
      }
      //this.appservice.getIssuesByProjectIdLoading = false;
      //}
    } catch (err) {
      this.messages = err.error.error.message + '   Please Refresh Again';
      this.visability = true;
      this.appservice.isSkeletonLoading = false;
      setTimeout(() => {
        this.visability = false;
      }, 10000);
    }
  }

  //const date = this.appservice.moment.format("YYYY/MM/DD");
  getUnsavedDataFromlocalDb = async () => {
    try {
      const date = moment().format('YYYY/MM/DD');
      const time = '00:00';
      let starttime = moment(date + ' ' + time, 'YYYY/MM/DD HH:mm')
        .utc()
        .format();
      let endtime = moment.utc(new Date()).format();
      const founddata = await this.db.requestData
        .where('endTime')
        .between(starttime, endtime)
        .toArray();
      founddata.forEach((obj) => {
        this.appservice.saveData(obj).subscribe(
          (res) => {
            this.deleteFromLocalDb(obj.endTime);
          },
          (err) => {
            // Sentry.captureException(err);
            // const eventId = Sentry.lastEventId();
            // if (eventId && !this.errorDialogService.isDialogOpenForEvent(eventId)) {
            //   // Show a Sentry error dialog for the user to provide more information
            //   Sentry.showReportDialog({ eventId });
            //   // Mark the dialog as open for this event
            //   this.errorDialogService.openDialogForEvent(eventId);
            // }
          }
        );
      });
    } catch (err) {
      this.messages = 'Internal server error ' + '   Please Refresh Again';
      console.error('Error while fetching data from LocalDB:', err);
      //throw new Error('Unable to fetch data from LocalDB');
      // Sentry.captureException(err);
      // const eventId = Sentry.lastEventId();
      // if (eventId && !this.errorDialogService.isDialogOpenForEvent(eventId)) {
      //   // Show a Sentry error dialog for the user to provide more information
      //   Sentry.showReportDialog({ eventId });
      //   // Mark the dialog as open for this event
      //   this.errorDialogService.openDialogForEvent(eventId);
      //}
    }
  };
  async toggleAccordian(event) {
    this.appservice.lastSourceCode =
      this.appservice.lastSourceCode === event.panelId ? '' : event.panelId;
    this.removeProject = event.nextState;
    if (this.removeProject === true) {
      this.getProjects(this.appservice.lastSourceCode);
    }
    this.appservice.projects = [];
    this.appservice.issues = [];
  }
  toggleAccordian2(event) {
    this.appservice.lastSourceCode =
      this.appservice.lastSourceCode === event.panelId ? '' : event.panelId;
    this.removeProject = event.nextState;
    if (this.removeProject === true) {
      this.appservice.lastSourceCode = event.panelId;
      setTimeout(async () => {
        await this.getProjectsForRecentTask(event.panelId);
        await this.getProjectsForRecentTask(
          this.appservice.sourceCodeRecentTasks
        );
      }, 50);
      //this.getProjectsForRecentTask(this.appservice.sourceCodeRecentTasks);
    }
    this.appservice.projects = [];
    this.appservice.issues = [];
  }
  async click() {
    setTimeout(() => {
      this.electronService.ipcRenderer.send('screenshot', true);
    }, 5000);
  }
  /************************************************************************/
  handleStream(stream) {
    let x: any;
    x = this.video.nativeElement;
    x.srcObject = stream;
    x.onloadedmetadata = (e) => {
      x.play();
    };
  }
  savedatatoLocalDb = async (data) => {
    try {
      this.db.transaction('rw', this.db.requestData, async () => {
        const id = await this.db.requestData.add(data);
      });
    } catch (err) {
      // this.messages = err.error.error.message + '   Please Refresh Again';
      this.messages = 'Internal server error ' + '   Please Refresh Again';
      throw new Error('Error in saving data to local db');
    }
  };
  deleteFromLocalDb = async (endTime) => {
    try {
      const founddata = await this.db.requestData
        .where({ endTime: endTime })
        .delete(); //.toArray();////
    } catch (err) {
      this.messages = err.error.error.message + '   Please Refresh Again';
      throw new Error('Unable to delete data from LocalDB');
    }
  };
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

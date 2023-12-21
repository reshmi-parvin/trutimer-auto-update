import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  Observable,
  throwError,
  firstValueFrom,
  map,
  switchMap,
  takeUntil,
  Subject,
} from 'rxjs';
import { APP_CONFIG } from '../../../environments/environment';
import { ProjectResponse } from '../model/projectResponse.model';
import {
  UserProfileResponse,
  GetProjectLastTrackedTime,
  GetAllSourceType,
  UserApiResponse,
  EmptyResponse,
  DeleteResponse,
  CreateOrUpdateUserKeyResponse,
  SearchProjectResponse,
  RecentTasks,
  SearchTaskResponse,
  GetUtcTimeResponse,
  IssuesProjectWise,
} from '../model/AllResponse.model';
import { GetAllResponse } from '../model/GetAllResponse.model';
import * as moment from 'moment';
//import { AuthService } from '../auth/service/auth.service';
@Injectable({
  providedIn: 'root',
})
export class DetailService {
  public baseUrlId: string;
  moment;
  projects: any[] = [];
  // issuesProjectWise: IssuesProjectWise[];
  issuesProjectWise: any[] = [];
  searchResults: any[] = [];
  searchTasks: any[] = [];
  recentTasksData: any[] = [];
  userDetailsData;
  isVisible = true;
  recentSelectedTaskId = null;
  searchSelectTaskId = null;
  filteredIssues: any[] = [];
  base64EncodedImage;
  userSettings;
  offset = 0;
  isSearchedInputFocused = false;
  searchText = '';
  timeTrackingDurationInMin;
  totalProject;
  totalProjectCount = null;
  totalIssueCount = null;
  isAssignedProject = true;
  selectedprojectclass = '';
  issuesCheck = false;
  isAssignedIssue = true;
  timerStatus = false;
  selectedProjectId = null;
  savedIssueIds: number[] = [];
  selectedIssueProjectName: '';
  selectIssueInTopSecSourceCode: '';
  totalTimeInSec = '00:00:00';
  selectedissueclass: number | null = null;
  activeBaseUrlId = null;
  selectIssue = false;
  selectProject = false;
  issueoffest = 0;
  lastSourceCode;
  timeTrackingDurationInSec;
  isSkeletonLoading = true;
  userSourceCode = '';
  activeIssueName = '';
  lastTrackDtl = null;
  searchBy: any;
  userId;
  searchByProj: any;
  activeIssueId = null;
  isOnline = false;
  settingSource = [];
  sources = [];
  checkSourcecodeForRecentTasks = false;
  openSourcecodeForRecentTasks;
  setting;
  previousIssueId: number | null = null;
  runningIssueId: number | null = null;
  activeTimerValue = '00:00:00';
  runningIssueTrackTime;
  timerArr = [];
  userTimerRecord;
  timePerSec;
  currentDate;
  totalWorkingshowDiv = true;
  idleModalOpenTime;
  selectedBaseUrlId = null;
  selectedBaseurlIdClass = '';
  showTopDiv: boolean;
  profilePicture;
  profileImage;
  imageSource;
  timeZoneOffset;
  totalTimeWorked = null;
  issues = [];
  selectedIssueId: number | null = null;
  selectedIssueName = null;
  activeProjectName = null;
  baseUrlid = null;
  checkAfterHibernate = false;
  date = new Date();
  selectedIssueTrackedTime = null;
  activeProjectId = null;
  today;
  profilepic: any;
  dd = null;
  timerPaused = false;
  trackStartTime;
  isIdleTime = false;
  isRefreshing = false;
  isRefreshingIcon = false;
  public runningIssue = new BehaviorSubject('');
  newtrackStartTime;
  tt = null;
  checkInactiveUser = null;
  selectedSourcecode;
  refreshSourceCode;
  addtimeSourceCode;
  platform = '';
  sourceTypeId;
  sourceCodeRecentTasks;
  id = [];
  getProfileLoading = false;
  getIssuesByProjectIdLoading = false;
  getTotalTimeAndLastTrackTimeLoading = false;
  getUserApiKeysLoading = false;
  getAllSourceTypeLoading = false;
  isDashboard = false;
  createOrUpdateUserKeyLoading = false;
  addTimeTrackerLoading = false;
  deleteUserApiKeyLoading = false;
  getProjectsLoading = false;
  idleTime1;
  isLoginPage = false;
  isAddtimeTracker = true;
  allowScrolling = false;
  selectTasksFromRecenTasks = false;
  sourcenameLogo;
  settingPageLoading = false;
  userProfileName;

  public idleTime: number;

  constructor(private http: HttpClient) { }
  private cancelGetProjects$ = new Subject<void>();
  private cancelGetIssues$ = new Subject<void>();
  public issueTimmerArr = new BehaviorSubject([]);
  async getPermission(): Promise<GetAllResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });
    const url = localStorage.getItem('dynamicBaseURL')
      ? localStorage.getItem('dynamicBaseURL')
      : APP_CONFIG.url;
    return await firstValueFrom(
      this.http.get<GetAllResponse>(url + '/AbpUserConfiguration/GetAll', {
        headers: headers,
      })
    );
  }

  async getProfile(): Promise<UserProfileResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });
    const url = localStorage.getItem('dynamicBaseURL') || APP_CONFIG.url;
    return await firstValueFrom(
      this.http.get<UserProfileResponse>(
        url + '/api/services/app/MyAccount/GetUserProfile',
        {
          headers: headers,
        }
      )
    );
  }

  async getUtcTime(): Promise<GetUtcTimeResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });
    const url = localStorage.getItem('dynamicBaseURL') || APP_CONFIG.url;
    return await firstValueFrom(
      this.http.get<GetUtcTimeResponse>(
        url + '/api/services/app/EditTrackTimeService/GetUtcTime',
        {
          headers: headers,
        }
      )
    );
  }
  async getUtcTimee(): Promise<GetUtcTimeResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });
    const url = localStorage.getItem('dynamicBaseURL') || APP_CONFIG.url;
    return await firstValueFrom(
      this.http.get<GetUtcTimeResponse>(
        url + '/api/services/app//EditTrackTimeService/GetUtcTime',
        {
          headers: headers,
        }
      )
    );
  }
  
  async getIssuesByProjectId(
    id,
    userid,
    source,
    startTime,
    endTime,
    baseUrlId?,
    offset = '0',
    limit = '100'
  ): Promise<any> {
    this.cancelGetIssues$.next();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });
    const url = localStorage.getItem('dynamicBaseURL')
      ? localStorage.getItem('dynamicBaseURL')
      : APP_CONFIG.url;
    const payload = {
      userId: userid,
      SourceCode: source,
      ProjectId: id,
      Subproject_id: '!*',
      startTime: startTime,
      endTime: endTime,
      assigned_to_id: 'me',
      offset: offset,
      limit: limit,
      baseUrlId: baseUrlId,
    };
    this.baseUrlId = baseUrlId;
    const observable = this.http.get<any>(
      url + '/api/services/app/Projects/GetTasksWithTimeByUserAndProject',
      {
        params: payload,
        headers: headers,
      }
    ).pipe(
      switchMap(response => {
        return [response];
      }),
      takeUntil(this.cancelGetIssues$)
    );
    return await firstValueFrom(observable);
  }

  // async getIssuesByProjectId(
  //   id,
  //   userid,
  //   source,
  //   startTime,
  //   endTime,
  //   baseUrlId?,
  //   offset = '0',
  //   limit = '100'
  // ): Promise<any> {
  //   // Emit a signal to cancel the previous request
  //   this.cancelPreviousRequest$.next();

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  //   });

  //   const url = localStorage.getItem('dynamicBaseURL')
  //     ? localStorage.getItem('dynamicBaseURL')
  //     : APP_CONFIG.url;

  //   const payload = {
  //     userId: userid,
  //     SourceCode: source,
  //     ProjectId: id,
  //     Subproject_id: '!*',
  //     startTime: startTime,
  //     endTime: endTime,
  //     assigned_to_id: 'me',
  //     offset: offset,
  //     limit: limit,
  //     baseUrlId: baseUrlId,
  //   };

  //   this.baseUrlId = baseUrlId;

  //   const observable = this.http.get<any>(
  //     url + '/api/services/app/Projects/GetTasksWithTimeByUserAndProject',
  //     {
  //       params: payload,
  //       headers: headers,
  //     }
  //   ).pipe(
  //     switchMap(response => {
  //       return [response];
  //     }),
  //     takeUntil(this.cancelPreviousRequest$)
  //   );

  //   return await firstValueFrom(observable);
  // }

  saveData(payload): Observable<any> {
    const payLoad = JSON.stringify(payload);
    const url = localStorage.getItem('dynamicBaseURL')
      ? localStorage.getItem('dynamicBaseURL')
      : APP_CONFIG.url;
    return this.http.post<any>(
      url + '/api/services/app/EditTrackTimeService/AddTimeTracker',
      payLoad
    );
  }
  // async saveData(payload): Promise<any> {
  //   const payLoad = JSON.stringify(payload);
  //   const url = localStorage.getItem('dynamicBaseURL')
  //     ? localStorage.getItem('dynamicBaseURL')
  //     : APP_CONFIG.url;
  //   return await firstValueFrom(
  //     this.http.post<any>(
  //       url + '/api/services/app/EditTrackTimeService/AddTimeTracker',
  //       payLoad
  //     )
  //   );
  // }
  setEmptyProjects() {
    this.projects = [];
  }
  setEmptyIssue() {
    this.issues = [];
  }
  stopTimmer() {
    if (this.timerStatus) {
      this.saveTime();
      this.timerStatus = false;
      this.runningIssue.next('false');
      this.runningIssueId = null;
      this.activeTimerValue = '00:00:00';
    }
    this.timerStatus = false;
    this.runningIssue.next('false');
    if (this.tt) {
      this.tt.unsubscribe();
    }
    if (this.dd) {
      this.dd.unsubscribe();
    }
    this.runningIssueId = null;
  }
  saveTime() {
    // HERE CALLING API IN  SHORT TIME INTRVAL
    const obj = {};
    obj['imageName'] = '';
    obj['imageSource'] = '';
    obj['projectId'] = this.activeProjectId;
    obj['projectName'] = this.activeProjectName;
    obj['taskId'] = this.activeIssueId;
    obj['taskname'] = this.activeIssueName;
    obj['sourceCode'] = this.userSourceCode;
    obj['startTime'] = this.trackStartTime;
    obj['endTime'] = this.currentDate;
    obj['trackTime'] = this.activeTimerValue;
    obj['baseUrlId'] = this.baseUrlId;
    this.activeTimerValue = '00:00:00';
    this.runningIssueTrackTime = '00:00:00';
    this.timeTrackingDurationInMin;
    this.saveData(obj).subscribe(
      (res) => {
        this.trackStartTime;
      },
      (err) => { }
    );
  }
  async getTotalTimeAndLastTrackTime(
    payload
  ): Promise<GetProjectLastTrackedTime> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });
    const url = localStorage.getItem('dynamicBaseURL')
      ? localStorage.getItem('dynamicBaseURL')
      : APP_CONFIG.url;
    return await firstValueFrom(
      this.http.get<GetProjectLastTrackedTime>(
        url +
        '/api/services/app/Projects/GetProjectLastTrackedTime?' +
        'StartDate=' +
        payload.StartDate +
        '&EndDate=' +
        payload.EndDate,
        { headers: headers }
      )
    );
  }
  async getRecentTasks(take: number) {
    const url = localStorage.getItem('dynamicBaseURL') || APP_CONFIG.url;
    const params = new HttpParams()
      .set('take', take);
    return await firstValueFrom(
      this.http.get<RecentTasks>(
        `${url}/api/services/app/EditTrackTimeService/GetRecentTasks`,
        { params }
      )
    );
  }

  // async getProjects(data): Promise<ProjectResponse> {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  //   });
  //   const url = localStorage.getItem('dynamicBaseURL')
  //     ? localStorage.getItem('dynamicBaseURL')
  //     : APP_CONFIG.url;
  //   return await firstValueFrom(
  //     this.http.get<ProjectResponse>(
  //       url + '/api/services/app/Projects/GetAllProjects',
  //       {
  //         params: data,
  //         headers: headers,
  //       }
  //     )
  //   );
  // }

  async getProjects(data): Promise<ProjectResponse> {
    this.cancelGetProjects$.next();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });
    const url = localStorage.getItem('dynamicBaseURL')
      ? localStorage.getItem('dynamicBaseURL')
      : APP_CONFIG.url;
    const observable = this.http.get<ProjectResponse>(
      url + '/api/services/app/Projects/GetAllProjects',
      {
        params: data,
        headers: headers,
      }
    ).pipe(
      switchMap(response => {
        return [response];
      }),
      takeUntil(this.cancelGetProjects$)
    );
    return await firstValueFrom(observable);
  }

  async getAllSearchedProjects(projectName: string, sourceCode: string) {
    const url = localStorage.getItem('dynamicBaseURL') || APP_CONFIG.url;
    const params = new HttpParams()
      .set('ProjectName', projectName)
      .set('SourceCode', sourceCode);

    return await firstValueFrom(
      this.http.get<SearchProjectResponse>(
        `${url}/api/services/app/Projects/GetAllSearchedProjects`,
        { params }
      )
    );
  }
  updateissueTimmerArr(data) {
    this.issueTimmerArr.next(data);
  }
  saveUserToken(): boolean {
    return true;
  }
  async getUserApiKeys(
    sourceCode = null
  ): Promise<UserApiResponse | EmptyResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });
    const url = localStorage.getItem('dynamicBaseURL')
      ? localStorage.getItem('dynamicBaseURL')
      : APP_CONFIG.url;
    if (sourceCode) {
      return await firstValueFrom(
        this.http.get<UserApiResponse>(
          url +
          '/api/services/app/MyAccount/GetUserApiKeys?SourceCode=' +
          sourceCode,
          { headers: headers }
        )
      );
    } else {
      return await firstValueFrom(
        this.http.get<EmptyResponse>(
          url + '/api/services/app/MyAccount/GetUserApiKeys',
          {
            headers: headers,
          }
        )
      );
    }
  }
  async getAllSourceType(): Promise<GetAllSourceType> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });
    const url = localStorage.getItem('dynamicBaseURL')
      ? localStorage.getItem('dynamicBaseURL')
      : APP_CONFIG.url;
    const options = { headers: headers };
    return await firstValueFrom(
      this.http.get<GetAllSourceType>(
        url + '/api/services/app/GeneralSettings/GetAllSourceType',
        options
      )
    );
  }
  async getAllSearchedTasks(taskName: string, sourceCode: string, projectId: string) {
    const url = localStorage.getItem('dynamicBaseURL') || APP_CONFIG.url;
    const params = new HttpParams()
      .set('TaskName', taskName)
      .set('SourceCode', sourceCode)
      .set('ProjectId', projectId);

    return await firstValueFrom(
      this.http.get<SearchTaskResponse>(
        `${url}/api/services/app/Projects/GetAllSearchedTasks`,
        { params }
      )
    );
  }
  async createOrUpdateUserApiKey(
    payload
  ): Promise<CreateOrUpdateUserKeyResponse> {
    const url = localStorage.getItem('dynamicBaseURL')
      ? localStorage.getItem('dynamicBaseURL')
      : APP_CONFIG.url;
    return await firstValueFrom(
      this.http.post<CreateOrUpdateUserKeyResponse>(
        url + '/api/services/app/MyAccount/CreateOrUpdateUserApiKey',
        JSON.stringify(payload)
      )
    );
  }
  async deleteUserApiKey(SourceTypeId, BaseUrlId): Promise<DeleteResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });
    const options = {
      headers: headers,
      params: {
        SourceTypeId: SourceTypeId,
        BaseUrlId: BaseUrlId,
      },
    };
    const url = localStorage.getItem('dynamicBaseURL')
      ? localStorage.getItem('dynamicBaseURL')
      : APP_CONFIG.url;
    return await firstValueFrom(
      this.http.delete<DeleteResponse>(
        url + '/api/services/app/MyAccount/DeleteUserApiKey',
        options
      )
    );
  }
}

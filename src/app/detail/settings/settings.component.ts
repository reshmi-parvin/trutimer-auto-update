import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { enableDebugTools } from '@angular/platform-browser';
import {
  NgbDropdownConfig,
  NgbModal,
  ModalDismissReasons,
} from '@ng-bootstrap/ng-bootstrap';
import { HomeService } from '../../home/home-services/home.service';
import { DetailService } from '../detail-service/detail.service';
import {
  GetAllSourceType,
  UserApiResponse,
  EmptyResponse,
  DeleteResponse,
  CreateOrUpdateUserKeyResponse,
} from '../model/AllResponse.model';
import { DasboardComponent } from '../dasboard/dasboard.component';
export interface baseApiUrls {
  apiKey: string | '';
  baseUrl: string | '';
  id: number;
}
@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  @ViewChild('permission') modalPermission: TemplateRef<any>;
  @ViewChild('content') modalContent: TemplateRef<any>;
  settingForm: FormGroup;
  issueError = '';
  issueResponse = '';
  disable = true;
  submitted = false;
  sourceType = [];
  messages = '';
  sourceList = [];
  selectedSource: any;
  selectedSourceJira: any;
  selectedSourceOther: any;
  alerttype = '';
  forId;
  visability = false;
  isModalOpen = false;
  hasAtLeastOneValue: boolean;
  showContent = false;
  display = '';
  disabled = true;
  userDetails;
  SourceTypeId = '';
  constructor(
    private authservice: HomeService,
    private router: Router,
    private modalService: NgbModal,
    public appservice: DetailService,
    public dashboardcomponent: DasboardComponent
  ) { }

  async ngOnInit(): Promise<void> {
    this.settingForm = new FormGroup({});
    this.appservice.settingPageLoading = true;
    this.userDetails = JSON.parse(localStorage.getItem('user_detail'));
    try {
      // CALLING API TO GET SOURCE TYPE
      if (!this.appservice.getAllSourceTypeLoading) {
        this.appservice.getAllSourceTypeLoading = true;
        const res: GetAllSourceType = await this.appservice.getAllSourceType();
        this.appservice.sources = res.result.items;

        for (const element of this.appservice.sources) {
          const payload = element.sourceCode;
          if (!this.appservice.getUserApiKeysLoading) {
            this.appservice.getUserApiKeysLoading = true;
            const res1: UserApiResponse | EmptyResponse =
              await this.appservice.getUserApiKeys(payload);
            this.sourceList.push(res1.result);
            if (res1.result.length > 0) {
              element.onswitch = false;
              res1.result.forEach((option) => {
                if (option.sourceCode === element.sourceCode) {
                  element.onswitch = true;
                  element.baseApiUrls = option.baseApiUrls;
                  element.sourceTypeId = option.sourceTypeId;
                  element.baseApiUrls.forEach((p) => {
                    this.forId = p.id;
                    this.appservice.id.push(this.forId);
                  });
                  //this.appservice.id = this.forId;
                }
                this.appservice.sourceTypeId = element.sourceTypeId;
                // this.appservice.id = element.baseApiUrls[0].id;
              });
            }
            else {
              element.baseApiUrls = [];
              // let baseApiUrls = {
              //   apiKey: '',
              //   baseUrl: '',
              //   id: undefined,
              // };
              element.sourceTypeId = '';
              //element.baseApiUrls.push(baseApiUrls);
            }
            this.appservice.getUserApiKeysLoading = false;
          }
        }
        if (this.appservice.sources.length >= 0) {
          this.selectedSource = this.appservice.sources[0]; // Set the first source as selected by default
          if (this.selectedSource.sourceCode === 'jira') {
            this.selectedSourceJira = this.selectedSource;
            this.selectedSourceOther = '';
          }
          else {
            this.selectedSourceOther = this.selectedSource;
            this.selectedSourceJira = '';
          }
        }
        this.appservice.getAllSourceTypeLoading = false;
      }
    } catch (err) {
      this.messages = err.error.error.message;
      this.alerttype = 'alert-danger';
      this.visability = true;
      setTimeout(() => {
        this.visability = false;
      }, 7000);
    }
  }

  selectSource(source: any) {
    this.selectedSource = source;
    if (this.selectedSource.sourceCode === 'jira') {
      this.selectedSourceJira = source;
      this.selectedSource = this.selectedSourceJira;
      this.selectedSourceOther = '';
    }
    else {
      this.selectedSourceOther = source;
      this.selectedSource = this.selectedSourceOther;

      this.selectedSourceJira = '';
    }
  }

  onKeydown(sourceCode) {
    this.appservice.sources.forEach((element) => {
      if (sourceCode === element.sourceCode) {
        let baseApiUrls = {
          apiKey: '',
          baseUrl: '',
          id: undefined,
        };
        element.sourceTypeId = '';
        element.baseApiUrls.push(baseApiUrls);
      }
    });
  }
  get f() {
    return this.settingForm.controls;
  }

  async onHandleSwitch(source, event, content) {
    source.onswitch = event;

    if (source.apiKey) {
      if (!this.appservice.getUserApiKeysLoading) {
        this.appservice.getUserApiKeysLoading = true;
        const res: UserApiResponse | EmptyResponse =
          await this.appservice.getUserApiKeys(source.sourceCode);
        if (res.result.length > 0) {
          this.SourceTypeId = source.id;
          //  source.onswitch = true;
        }
        this.appservice.getUserApiKeysLoading = true;
      };

      this.modalService
        .open(content, { ariaLabelledBy: 'modal-basic-title' })
        .result.then(
          (result) => {
            // this.closeResult = `Closed with: ${result}`;
            this.SourceTypeId = source.id;
            source.onswitch = true;
          },
          (reason) => {
            this.SourceTypeId = source.id;
            //  source.onswitch = true;
            //this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          }
        );
    }
  }

  ChangeApiToken(event, source) {
    source.apiKey = event.target.value;
  }
  ChangeURL(event, source) {
    source.url = event.target.value;
  }
  async callApies() {
    if (!this.appservice.getAllSourceTypeLoading) {
      this.appservice.getAllSourceTypeLoading = true;
      const res: GetAllSourceType = await this.appservice.getAllSourceType();
      this.appservice.sources = res.result.items;

      for (const element of this.appservice.sources) {
        const payload = element.sourceCode;
        if (!this.appservice.getUserApiKeysLoading) {
          this.appservice.getUserApiKeysLoading = true;
          const res1: UserApiResponse | EmptyResponse =
            await this.appservice.getUserApiKeys(payload);
          this.sourceList.push(res1.result);
          if (res1.result.length > 0) {
            element.onswitch = false;
            res1.result.forEach((option) => {
              if (option.sourceCode === element.sourceCode) {
                element.onswitch = true;
                element.baseApiUrls = option.baseApiUrls;
                element.sourceTypeId = option.sourceTypeId;
                element.baseApiUrls.forEach((p) => {
                  this.forId = p.id;
                  this.appservice.id.push(this.forId);
                });
                //this.appservice.id = this.forId;
              }
              this.appservice.sourceTypeId = element.sourceTypeId;
              // this.appservice.id = element.baseApiUrls[0].id;
            });
          }
          else {
            element.baseApiUrls = [];
            // let baseApiUrls = {
            //   apiKey: '',
            //   baseUrl: '',
            //   id: undefined,
            // };
            element.sourceTypeId = '';
            //element.baseApiUrls.push(baseApiUrls);
          }
          this.appservice.getUserApiKeysLoading = false;
        }
      }
      if (this.appservice.sources.length >= 0) {
        this.selectedSource = this.appservice.sources[0]; // Set the first source as selected by default
        if (this.selectedSource.sourceCode === 'jira') {
          this.selectedSourceJira = this.selectedSource;
          this.selectedSource = this.selectedSourceJira;
          this.selectedSourceOther = '';
        }
        else {
          this.selectedSourceOther = this.selectedSource;
          this.selectedSource = this.selectedSourceOther;

          this.selectedSourceJira = '';
        }
      }
      this.appservice.getAllSourceTypeLoading = false;
    }
  }
  async createUserApiKeyOther(sourceCode, apiKey, url, id) {
    // if (apiKey === '' || url === '') {
    //   this.disable = true;
    // } else if (apiKey === ' ' || url === ' ') {
    //   this.disable = true;
    // } else {
    const obj = {
      apiKey: apiKey,
      baseUrl: url,
      sourceCode: sourceCode,
      baseUrlId: id,
    };

    if (this.appservice.runningIssueId) {
      this.modalService.dismissAll();
      this.issueError =
        'We will not process this action because tracker time is already running.';
      this.modalService
        .open(this.modalPermission, { ariaLabelledBy: 'modal-basic-title' })
        .result.then((result) => { });
      setTimeout(() => { }, 7000);
    } else {
      try {
        this.issueError = '';
        this.appservice.createOrUpdateUserKeyLoading = false;
        if (!this.appservice.createOrUpdateUserKeyLoading) {
          this.appservice.createOrUpdateUserKeyLoading = true;
          const res: CreateOrUpdateUserKeyResponse =
            await this.appservice.createOrUpdateUserApiKey(obj);

            if (res.success === true) {
              this.appservice.setEmptyProjects();
              this.appservice.setEmptyIssue();
              this.issueResponse = 'Your API data is successfully saved';
              this.modalService
                .open(this.modalPermission, {
                  ariaLabelledBy: 'modal-basic-title',
                })
                .result.then((result) => { });
              setTimeout(() => { }, 7000);
            }
            this.appservice.createOrUpdateUserKeyLoading = false;
            await this.callApies();
          }
        // } catch (err) {
        //   if (err.error.success === false) {
        //     this.issueResponse = '';
        //     this.messages = err.error.error.message;
        //     this.issueError = this.messages;
        //     this.modalService
        //       .open(this.modalPermission, {
        //         ariaLabelledBy: 'modal-basic-title',
        //       })
        //       .result.then((result) => { });
        //     setTimeout(() => { }, 7000);
        //   }
        //   this.appservice.createOrUpdateUserKeyLoading = false;
        //   await this.callApies();
        // }
      }
        catch (err) {
          if (err.error.success === false) {
            this.issueResponse = '';
            this.messages = err.error.error.message;
            this.issueError = this.messages;
            this.modalService
              .open(this.modalPermission, {
                ariaLabelledBy: 'modal-basic-title',
              })
              .result.then((result) => {
                this.ngOnInit();
              });
          }
        }
      } 
    //}
  }

  async createUserApiKeyJira(sourceCode, apiKey, url, id, username) {
    // if (apiKey === '' || url === '') {
    //   this.disable = true;
    // } else if (apiKey === ' ' || url === ' ') {
    //   this.disable = true;
    // } else {
    const obj = {
      apiKey: apiKey,
      baseUrl: url,
      sourceCode: sourceCode,
      baseUrlId: id,
      username: username,
    };
    if (this.appservice.runningIssueId) {
      this.modalService.dismissAll();
      this.issueError =
        'We will not process this action because tracker time is already running.';
      this.modalService
        .open(this.modalPermission, { ariaLabelledBy: 'modal-basic-title' })
        .result.then((result) => { });
      setTimeout(() => { }, 7000);
    } else {
      try {
        this.issueError = '';
        this.appservice.createOrUpdateUserKeyLoading = false;
        if (!this.appservice.createOrUpdateUserKeyLoading) {
          this.appservice.createOrUpdateUserKeyLoading = true;
          const res: CreateOrUpdateUserKeyResponse =
            await this.appservice.createOrUpdateUserApiKey(obj);

          if (res.success === true) {
            this.appservice.setEmptyProjects();
            this.appservice.setEmptyIssue();
            this.issueResponse = 'Your API data is successfully saved';
            this.modalService
              .open(this.modalPermission, {
                ariaLabelledBy: 'modal-basic-title',
              })
              .result.then((result) => { });
            setTimeout(() => { }, 7000);
          }
          this.appservice.createOrUpdateUserKeyLoading = false;
          await this.callApies();
        }
      } catch (err) {
        if (err.error.success === false) {
          this.issueResponse = '';
          this.messages = err.error.error.message;
          this.issueError = this.messages;
          this.modalService
            .open(this.modalPermission, {
              ariaLabelledBy: 'modal-basic-title',
            })
            .result.then((result) => {
              this.ngOnInit();
            });
        }
      }
    }
    //}
  }

  DeleteUserApiKey(sourceTypeId, id) {
    // if (!this.field.apiKey) {
    //   // Field is blank, close the modal
    //   this.modalService.dismissAll();
    //   return;
    // }
    if (this.appservice.runningIssueId) {
      this.modalService.dismissAll();
      this.issueError =
        'We will not process this action because tracker time is already running.';
      this.modalService
        .open(this.modalPermission, { ariaLabelledBy: 'modal-basic-title' })
        .result.then((result) => { });
      setTimeout(() => { }, 7000);
    } else {
      this.issueError = '';
      this.modalService.dismissAll(); // Close any open modals
      this.isModalOpen = false; // Reset modal state

      this.modalService
        .open(this.modalContent, { ariaLabelledBy: 'modal-basic-title' })
        .result.then((result) => {
          // Modal closed
          this.isModalOpen = false;
          if (result === 'Savee click') {
            // User clicked on "Yes"
            this.confirmDelete(sourceTypeId, id);
          }
        });
      this.isModalOpen = true;
    }
  }

  async confirmDelete(sourceTypeId, id) {
    try {
      this.issueError = '';
      sourceTypeId = this.appservice.sourceTypeId;
      this.appservice.deleteUserApiKeyLoading = false;
      if (!this.appservice.deleteUserApiKeyLoading) {
        this.appservice.deleteUserApiKeyLoading = true;
        const res: DeleteResponse = await this.appservice.deleteUserApiKey(
          sourceTypeId,
          id
        );

        if (res) {
          this.modalService.dismissAll();
          this.sourceType = this.sourceType.filter((e) => {
            if (e.id !== sourceTypeId) {
              return true;
            } else {
              e.onswitch = false;
              e.apiKey = '';
              e.existingKey = '';
              return false;
            }
          });
          this.appservice.setEmptyProjects();
          this.appservice.setEmptyIssue();
          this.appservice.selectedIssueId = null;
          this.appservice.selectedIssueName = null;
          this.appservice.activeProjectName = null;
          this.appservice.activeProjectId = null;
          this.appservice.selectedIssueTrackedTime = null;
          this.appservice.issuesProjectWise = [];
          this.issueResponse = 'Your Api data is successfully deleted';
          this.modalService
            .open(this.modalPermission, { ariaLabelledBy: 'modal-basic-title' })
            .result.then((result) => { });
          setTimeout(() => {
            this.visability = false;
            this.ngOnInit();
          }, 3000);
        }
        this.appservice.deleteUserApiKeyLoading = false;
      }
      this.appservice.deleteUserApiKeyLoading = false;
    } catch (err) {
      // Handle deletion error
      this.issueResponse = '';
      this.issueError = err.statusText;
      this.modalService.open(this.modalPermission, { ariaLabelledBy: 'modal-basic-title' })
        .result.then(() => {
          this.ngOnInit();
        })
        .catch((modalErr) => {
          this.ngOnInit();
        });
    }
  }
}

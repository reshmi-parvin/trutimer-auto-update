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
export interface baseApiUrls {
  apiKey: string | '';
  baseUrl: string | '';
  id: number;
}
@Component({
  selector: 'user-settings',
  templateUrl: './usersettings.component.html',
  styleUrls: ['./usersettings.component.scss'],
})
export class UsersettingsComponent implements OnInit {
  settingForm: FormGroup;
  issue = "";
  disable : boolean = true;
  submitted = false;
  sourceType = [];
  messages = "";
  sourceList = [];
  alerttype = "";
  visability = false;
  display = "";
  disabled:boolean = true;
  SourceTypeId = "";
  @ViewChild("permission") modalPermission: TemplateRef<any>;
  constructor(
    private authservice: HomeService,
    private router: Router,
    private modalService: NgbModal,
    public appservice: DetailService
  ) {}

  ngOnInit(): void {
    this.settingForm = new FormGroup({});

    // CALLING API TO GET SOURCE TYPE
    this.appservice.getAllSourceType().subscribe(
      (res) => {
        this.appservice.sources = res.result.items;
        this.appservice.sources.forEach((element) => {
          let payload = element.sourceCode;
          this.appservice.getUserApiKeys(payload).subscribe(
            (res1) => {
              this.sourceList.push(res1.result);
              if (res1.result.length > 0) {
                element.onswitch = false;
                res1.result.forEach((option) => {
                  if (option.sourceCode === element.sourceCode) {
                    element.onswitch = true;
                    element.baseApiUrls = option.baseApiUrls;
                    element.sourceTypeId = option.sourceTypeId;
                  }
                });
              } else {
                element.baseApiUrls = [];
                let baseApiUrls = {
                  apiKey: "",
                  baseUrl: "",
                  id: undefined,
                };
                element.sourceTypeId = "";
                element.baseApiUrls.push(baseApiUrls);
              }
            },
            (err) => {
            }
          );
        });
      },
      (err) => {
        this.messages = err.error.error.message;
        // this.visability = true;
        this.alerttype = "alert-danger";
        setTimeout(() => {
          this.visability = false;
        }, 7000);
      }
    );
  }
  onKeydown(sourceCode) {
    this.appservice.sources.forEach((element) => {
      if (sourceCode === element.sourceCode) {
        let baseApiUrls = {
          apiKey: "",
          baseUrl: "",
          id: undefined,
        };
        element.sourceTypeId = "";
        element.baseApiUrls.push(baseApiUrls);
      }
    });
  }
  get f() {
    return this.settingForm.controls;
  }

  onHandleSwitch(source, event, content) {
    source.onswitch = event;

    if (source.apiKey) {
      this.appservice.getUserApiKeys(source.sourceCode).subscribe((res) => {
        if (res.result.length > 0) {
          this.SourceTypeId = source.id;
          //  source.onswitch = true;
        }
      });
      this.modalService
        .open(content, { ariaLabelledBy: "modal-basic-title" })
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
  createUserApiKey(sourceCode, apiKey, url, id) {
    if (apiKey == "" || url == "") {
      this.disable = true;
    }else if(apiKey == " " || url == " "){
      this.disable = true;
    }
     else {
      const obj = {
        apiKey: apiKey,
        baseUrl: url,
        sourceCode: sourceCode,
        baseUrlId: id,
      };
      //const isSwitchSelect = source.onswitch;
      if (this.appservice.runningIssueId) {
        this.modalService.dismissAll();
        this.issue =
          "We will not process this action because tracker time is already running.";
        this.modalService
          .open(this.modalPermission, { ariaLabelledBy: "modal-basic-title" })
          .result.then((result) => {});
        setTimeout(() => {}, 7000);
      } else {
        this.appservice.createOrUpdateUserApiKey(obj).subscribe(
          (res) => {
            if (res.success === true) {
              this.appservice.setEmptyProjects();
              this.appservice.setEmptyIssue();
              this.issue = "Your API data is successfully saved";
              this.modalService
                .open(this.modalPermission, {
                  ariaLabelledBy: "modal-basic-title",
                })
                .result.then((result) => {});
              setTimeout(() => {}, 7000);
            }
          },
          (err) => {
            if (err.error.success === false) {
              this.messages = err.error.error.message;
              this.issue = this.messages;
              this.modalService
                .open(this.modalPermission, {
                  ariaLabelledBy: "modal-basic-title",
                })
                .result.then((result) => {
                  this.ngOnInit();
                });
              // this.visability = true;
              // this.alerttype = "alert-danger";
              // setTimeout(() => {
              //   this.visability = false;
              // }, 7000);
            }
          }
        );
      }
    }
  }

  DeleteUserApiKey(sourceTypeId, id?) {
    if (this.appservice.runningIssueId) {
      this.issue =
        "We will not process this action because tracker time is already running.";
      // this.visability = true;
      this.alerttype = "alert-danger";
      setTimeout(() => {
        this.visability = false;
      }, 7000);
    } else {
      //this.appservice.showTopDiv = false;
      const userId = Number(localStorage.getItem("user_id"));
      this.appservice.deleteUserApiKey(sourceTypeId, userId, id).subscribe(
        (res) => {
          if (res) {
            this.modalService.dismissAll();
            this.sourceType = this.sourceType.filter(function (e) {
              if (e.id !== sourceTypeId) {
              } else {
                e.onswitch = false;
                e.apiKey = "";
                e.existingKey = "";
              }
              return e;
            });

            this.appservice.setEmptyProjects();
            this.appservice.setEmptyIssue();
            this.appservice.selectedIssueId = null;
            this.appservice.selectedIssueName = null;
            this.appservice.activeProjectName = null;
            this.appservice.activeProjectId = null;
            this.appservice.selectedIssueTrackedTime = null;
            this.appservice.issuesProjectWise = [];
            // this.appservice.showTopDiv = false;
            this.issue = "Your Api Data Delete Sucessfully";
            this.modalService
              .open(this.modalPermission, {
                ariaLabelledBy: "modal-basic-title",
              })
              .result.then((result) => {});
            setTimeout(() => {
              this.visability = false;
              this.ngOnInit();
            }, 3000);
          }
        },
        (err) => {
          this.issue = err.statusText;

          this.modalService
            .open(this.modalPermission, {
              ariaLabelledBy: "modal-basic-title",
            })
            .result.then((result) => {
              this.ngOnInit();
            });
        }
      );
    }
  }
}

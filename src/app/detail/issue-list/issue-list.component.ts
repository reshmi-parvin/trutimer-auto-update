import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HomeService } from '../../home/home-services/home.service';
import { DasboardComponent } from '../dasboard/dasboard.component';
import { DetailService } from '../detail-service/detail.service';
import { SearchTaskResponse } from '../model/AllResponse.model';
import { ElectronService } from '../../core/services/electron/electron.service';
function isElectron(): boolean {
  return window && window.process && window.process.type;
}
@Component({
  selector: 'app-issue-list',
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.scss']
})
export class IssueListComponent implements OnInit {
  @ViewChild('issueListContainer') issueListContainer: ElementRef;
  isSearchFormVisible = false;
  multipleMatchesArray = [];
  multipleMatchesArrayIds = [];
  searchTextOn = false;
  //searchText: any;
  searchedProjectSourceCode: any;
  constructor(
    private authservice: HomeService,
    private router: Router,
    public appservice: DetailService,
    private electronService: ElectronService,
    public dashboardcomponent: DasboardComponent,
  ) { }
  ngOnInit(): void {
    // if (this.issueListContainer && this.issueListContainer.nativeElement) {
    //   this.issueListContainer.nativeElement.scrollTop = 0;
    // }
    this.shortcutSearch();
  }
  parseTime(timeString: string): number {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }
  toggleSearch() {
    this.isSearchFormVisible = !this.isSearchFormVisible;
  }
  // async search() {
  //   const searchText = this.searchQuery;
  //   const sourceCode = this.dashboardcomponent.searchedProjectSourceCode;
  //   const projectId = this.appservice.selectedprojectclass;
  //   if (searchText.length >= 2 ) {
  //     this.dashboardcomponent.searchShowResults = true;
  //     // const response: SearchProjectResponse =
  //     //   await this.appservice.getAllSearchedProjects(searchText, sourceCode);
  //       const response: SearchTaskResponse =
  //       await this.appservice.getAllSearchedTasks(searchText, sourceCode, projectId);
  //     if (response.result && response.result.length > 0) {
  //       this.appservice.searchTasks = response.result;
  //     } else {
  //       this.appservice.searchTasks = [];
  //     }
  //   }
  //   else {
  //     this.dashboardcomponent.searchShowResults = false;
  //     this.appservice.searchResults = [];
  //     //this.getAllSource();
  //   }
  // }

  search(): void {
    if (this.dashboardcomponent.searchText.length >= 2) {
      this.searchTextOn = true;
      this.appservice.filteredIssues = this.appservice.issuesProjectWise.filter(issue =>
        issue.issuename.toLowerCase().includes(this.dashboardcomponent.searchText.toLowerCase())
      );

      this.multipleMatchesArrayIds = this.appservice.filteredIssues.map(issue => issue.id);

      this.appservice.issuesProjectWise.forEach(issue => {
        if (this.multipleMatchesArrayIds.includes(issue.id)) {
          issue.isVisible = true;
        } else {
          issue.isVisible = false;
        }
      });
    } else {
      this.searchTextOn = false;
      this.appservice.filteredIssues = [];
      this.multipleMatchesArrayIds = [];
      // Set isVisible to default value when search text is empty
      this.appservice.issuesProjectWise.forEach(issue => {
        issue.isVisible = true; // Or set to your default value for visibility
      });
    }
  }

  shortcutSearch() {
    if (isElectron()) {
      this.electronService.ipcRenderer.on('on-search', () => {
        const searchInput = document.getElementById('searchInput') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      });
    }
  }
  clearSearchInput() {
    //console.log('this.appservice.searchText.length after refresh: ', this.appservice.searchText.length);
    // if(this.appservice.searchText.length >= 1){

    // }
  }
}


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HomeService } from '../../home/home-services/home.service';
import { DasboardComponent } from '../dasboard/dasboard.component';
import { DetailService } from '../detail-service/detail.service';
import { SearchProjectResponse } from '../model/AllResponse.model';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  searchTerm: string;
  constructor(
    private authservice: HomeService,
    private router: Router,
    public appservice: DetailService,
    public dashboardcomponent: DasboardComponent
  ) { }

  ngOnInit(): void {
  }

  async handleInputChange() {
    const projectName = this.searchTerm;
    const sourceCode = this.dashboardcomponent.searchedProjectSourceCode;

    if (this.searchTerm !== '') {
      const response: SearchProjectResponse = await this.appservice.getAllSearchedProjects(projectName, sourceCode);
          if (response.result && response.result.length > 0) {
            this.appservice.projects = response.result;
          } else {
            this.appservice.projects = [];
          }
    } else {
      this.appservice.searchResults = [];
      this.dashboardcomponent.getAllSource();
    }
  }
}

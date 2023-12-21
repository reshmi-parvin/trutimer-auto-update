import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailRoutingModule } from './detail-routing.module';

import { DetailComponent } from './detail.component';
import { DasboardComponent } from './dasboard/dasboard.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { IssueListComponent } from './issue-list/issue-list.component';
import { SettingsComponent } from './settings/settings.component';
import { FooterComponent } from '../shared/components/footer/footer.component';

import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GenericFilterPipe } from '../pipes/generic-filter.pipe';
import { TimeContainerComponent } from '../shared/time-container/time-container.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CountdownModule } from 'ngx-countdown';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { HttpClientModule } from '@angular/common/http';
import { AppVersionDirective } from '../shared/directives';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    DetailComponent,
    DasboardComponent,
    AppVersionDirective,
    FooterComponent,
    ProjectListComponent,
    TimeContainerComponent,
    IssueListComponent,
    SettingsComponent,
    SidebarComponent,
    NavbarComponent,
    GenericFilterPipe,
  ],
  imports: [
    CommonModule,
    DetailRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgxSkeletonLoaderModule,
    //NgxSkeletonLoaderModule.forRoot(),
    BrowserAnimationsModule,
    NgbModule,
    BrowserAnimationsModule,
    CountdownModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#78C000',
      innerStrokeColor: '#C7E596',
      animationDuration: 300,
    }),
  ],
  exports: [DasboardComponent],
  providers: [SidebarComponent, DatePipe],
})
export class DetailModule {}

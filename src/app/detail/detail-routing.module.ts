import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DetailComponent } from './detail.component';
import { SettingsComponent } from './settings/settings.component';
import { DasboardComponent } from './dasboard/dasboard.component';

const routes: Routes = [
  {
    path: 'detail',
    component: DetailComponent,
    children:[
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'dashboard',
        component: DasboardComponent
      }
    ],
  },

];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetailRoutingModule {}

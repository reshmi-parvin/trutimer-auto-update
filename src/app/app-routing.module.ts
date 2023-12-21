import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeRoutingModule } from './home/home-routing.module';
import { DetailRoutingModule } from './detail/detail-routing.module';
import { DetailComponent } from './detail/detail.component';
import { RouterGuard } from './home/guard/router.guard';
import { SettingsComponent } from './detail/settings/settings.component';
import { DasboardComponent } from './detail/dasboard/dasboard.component';

const routes: Routes = [
  { path: '',
  redirectTo: 'home',
   pathMatch: 'full' },
  { path: 'details',
    component: DetailComponent,
    canActivateChild: [RouterGuard],
    children: [
    { path : '', redirectTo: 'setting', pathMatch : 'full'},
    { path : 'setting', component: SettingsComponent},
    { path: 'dashboard', component: DasboardComponent}
  ]},
  {path: '**', redirectTo: '/login'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    HomeRoutingModule,
    DetailRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import {Router} from '@angular/router';
import { DetailService } from '../../detail/detail-service/detail.service';


@Injectable({
    providedIn: 'root'
  })
  export class RouterGuard implements CanActivateChild {
    constructor(private router: Router,
      public appservice: DetailService) {
    }
    canActivateChild(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (localStorage.getItem('access_token') == null) {
        // alert('token empty');
        this.appservice.isLoginPage = true;
        this.router.navigate(['/login']);
      } else {
        // alert('token availiable');
        return true;
      }
    }
  }

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { HomeService } from '../home-services/home.service';
import { DetailService } from '../../detail/detail-service/detail.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authservice: HomeService, private appservice: DetailService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // if (this.authservice.userAction === 'login') {
    //   request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
    // } else {
      request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
      // request=request.clone({headers:request.headers.set('X-Redmine-API-Key',localStorage.getItem('user_api_token'))});
      // request=request.clone({headers:request.headers.set('Accept','application/json')});
      request = request.clone({ headers: request.headers.set('Authorization', `Bearer ${localStorage.getItem('access_token')}`) });
    //}
        return next.handle(request);
  }
}

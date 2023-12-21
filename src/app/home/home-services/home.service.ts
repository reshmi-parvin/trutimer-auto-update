import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { APP_CONFIG } from '../../../environments/environment';
import {Login} from '../model/authResponse.model';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  userAction = '';
  constructor(private http: HttpClient) {}
  async login(data): Promise<Login> {
    const url = localStorage.getItem('dynamicBaseURL') || APP_CONFIG.url;
    return await firstValueFrom(
      this.http.post<Login>(url + '/api/TokenAuth/TenantLogin', data)
    );
  }
}

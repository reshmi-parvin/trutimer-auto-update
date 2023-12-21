import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {
  utcDateTimeString;
private apiKey = 'AIzaSyCSGz6vw1MtMcMpc0ddedCyIwXx01u4AAc';
  constructor(private http: HttpClient) { }

  getUtcTime(latitude: number, longitude: number): Observable<any> {
    const apiUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${Math.floor(
      Date.now() / 1000
    )}&key=${this.apiKey}`;

    return this.http.get(apiUrl);
  }

  getCurrentDateTime(): Promise<Date> {
    return new Promise((resolve, reject) => {
      this.http.get('http://worldclockapi.com/api/json/utc/now')
        .subscribe(
          (response: any) => {
            this.utcDateTimeString = new Date(response.currentDateTime);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }
  //https://timeapi.io/api/Time/current/zone?timeZone=utc
  getCurrentDateTimeTimeApi(): Promise<Date> {
    return new Promise((resolve, reject) => {
      this.http.get('http://timeapi.com/api/Time/current/zone?timeZone=utc')
        .subscribe(
          (response: any) => {
            const utcDateTimeString = response.dateTime;
          },
          (error) => {
            reject(error);
          }
        );
    });
  }
  getCurrentDateTimeWorldTimeApi(): Promise<Date> {
    const headers = new HttpHeaders()
    .set('content-Type', 'application/json')
    .set('Access-Control-Allow-Origin', '*');
    return new Promise((resolve, reject) => {
      this.http.get('http://worldtimeapi.org/api/timezone/Asia/Kolkata',{ headers })
        .subscribe(
          (response: any) => {
            const utcDateTimeString = response.datetime;
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  getServerDateTimeFromGoogle(): Promise<Date> {
    return new Promise((resolve, reject) => {
      this.http.get('http://www.google.com').subscribe(
        (response: any) => {
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  // getServerDateTimeFromMicrosoft(): Observable<Date> {
  //   return this.http.get('http://www.microsoft.com', { observe: 'response' })
  //     .pipe(
  //       map(response => {
  //         const dateHeaderValue = response.headers.get('date');
  //         return new Date(dateHeaderValue);
  //       })
  //     );
  // }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserData } from '../interfaces/user-data';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  get _url() {
    return environment.api_1;
  }

  get _newUrl() {
    return environment.newUrl;
  }

  get urlToUse() {
    // let url = environment.api;
    return environment.api;
  }

  getLoginUser(value: UserData) {
    return this.http.post<UserData>(
      `${this._newUrl}/user/authenticate`,
      value,
      { reportProgress: true, observe: 'events' }
    );
  } // END METHOD
}

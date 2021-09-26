import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  setAdminStatus(value: boolean) {
    if (value) {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('loggedIn', 'true');
    } else {
      localStorage.setItem('isAdmin', 'false');
    }
  }

  get isAdminLogin() {
    return JSON.parse(localStorage.getItem('loggedIn') || 'false');
  }

  get loggedIn() {
    return !!localStorage.getItem('token');
  }

  get getToken() {
    return localStorage.getItem('token');
  }
}

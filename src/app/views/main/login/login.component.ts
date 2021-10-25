import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserData } from 'src/app/util/interfaces/user-data';
import { AuthService } from 'src/app/util/service/auth.service';
import { DataService } from 'src/app/util/service/data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  version: string = '0.3.8';
  incorrectDetials: boolean = false;
  loading: boolean = false;
  networkError: boolean = false;
  hide = true;
  imgLoc = environment.logo;
  errorMsg: string = '';

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastrService,
    private _data: DataService
  ) {}

  ngOnInit(): void {
    this.checkLoggedIn();
  }

  get username() {
    return this.loginForm.get('username');
  }
  get password() {
    return this.loginForm.get('password');
  }

  checkLoggedIn() {
    if (this.auth.loggedIn) {
      this.router.navigate(['/orders']);
    }
  }

  login(value: UserData) {
    // console.log(localStorage);
    this.loading = true;
    this.incorrectDetials = false;
    this.networkError = false;
    this._data.authenticate(value).subscribe(
      (data) => {
        if (data.type === HttpEventType.Response) {
          // console.log(data.body);
          if (data.body === null) {
            this.loading = false;
            this.incorrectDetials = true;
            this.networkError = false;
            return;
          }
          let user: UserData = data.body;

          this.loading = false;
          if (user.data.userType === 'Delivery') {
            return this.toast.info(
              'You do not have access to this environment; Kindly contact your supervisor.',
              'Unauthorized',
              { timeOut: 15000, closeButton: true }
            );
          }

          this.setLocalStorage(user);

          if (user.data.userType === 'Kitchen')
            this.router.navigate(['landing-page']);
          else this.router.navigate(['orders']);
          this.toast.success('Welcome ' + user.data.fullname);
          this.auth.setAdminStatus(true);
          // console.clear();
        }
      },
      (error) => {
        // console.log(error);
        this.incorrectDetials = false;
        if (error.status === 500) this.networkError = true;
        else if (error.status === 404)
          this.errorMsg = 'Could not contact the server, Please try again';
        else this.networkError = true;
        // this.newForm();
      },
      () => {
        this.loading = false;
      }
    ); //end subscribe
  }

  setLocalStorage(user: UserData) {
    localStorage.setItem('username', user.data.username);
    localStorage.setItem('institution', user.data.institutionName);
    localStorage.setItem('userType', user.data.userType);
    localStorage.setItem('fullname', user.data.fullname);
    localStorage.setItem('country', user.data.country);
    localStorage.setItem('is_head', user.data.is_head === 1 ? 'true' : 'false');
    localStorage.setItem('instCat', user.data.Category);
    localStorage.setItem('instCode', user.data.instCode);
    localStorage.setItem('instLoc', user.data.instLoc);
    localStorage.setItem('user_id', user.data.user_id);
    localStorage.setItem('inst_head', user.data.inst_head);
    localStorage.setItem('inst_head_name', user.data.inst_head_name);
    localStorage.setItem('token', user.data.token);
  }
}

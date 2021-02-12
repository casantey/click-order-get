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

  ngOnInit(): void {}

  get username() {
    return this.loginForm.get('username');
  }
  get password() {
    return this.loginForm.get('password');
  }

  login(value: UserData) {
    // console.log(localStorage);
    this.loading = true;
    this.incorrectDetials = false;
    this.networkError = false;
    this._data.getLoginUser(value).subscribe(
      (data) => {
        if (data.type === HttpEventType.Response) {
          // console.log(data.body);
          if (data.body === null) {
            this.loading = false;
            this.incorrectDetials = true;
            this.networkError = false;
          } else {
            //if data.body as has value
            this.loading = false;
            if (data.body.userType === 'Delivery')
              return this.toast.info(
                'You do not have access to this environment; Kindly contact your supervisor.',
                'Unauthorized',
                { timeOut: 15000, closeButton: true }
              );
            localStorage.setItem('username', data.body.username);
            localStorage.setItem('institution', data.body.institutionName);
            localStorage.setItem('userType', data.body.userType);
            localStorage.setItem('fullname', data.body.fullname);
            localStorage.setItem('country', data.body.country);
            localStorage.setItem(
              'is_head',
              data.body.is_head === 1 ? 'true' : 'false'
            );
            localStorage.setItem('instCat', data.body.Category);
            localStorage.setItem('instCode', data.body.instCode);
            localStorage.setItem('instLoc', data.body.instLoc);
            // localStorage.setItem("instCat", "Delivery Institution");
            localStorage.setItem('inst_head', data.body.inst_head);
            localStorage.setItem('inst_head_name', data.body.inst_head_name);
            localStorage.setItem('token', data.body.token);
            // console.log(localStorage);
            if (data.body.userType === 'Kitchen')
              this.router.navigate(['landing-page']);
            else this.router.navigate(['home']);
            this.toast.success('Welcome ' + data.body.fullname);
            this.auth.setAdminStatus(true);
            // console.clear();
          }
        }
      },
      (error) => {
        this.loading = false;
        // console.log(error);
        this.incorrectDetials = false;
        if (error.status === 500) this.networkError = true;
        else if (error.status === 404)
          this.errorMsg = 'Could not contact the server, Please try again';
        else this.networkError = true;
        // this.newForm();
      }
    ); //end subscribe
  }
}

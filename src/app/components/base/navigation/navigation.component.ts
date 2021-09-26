import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/util/service/auth.service';
import { DataService } from 'src/app/util/service/data.service';
import { ChangePasswordComponent } from '../../dialogs/change-password/change-password.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  page = this.router.url;
  head = 'BODA Community Smart City Apps';
  minHead = 'BODA';
  userType = localStorage.getItem('userType');
  imgLoc = environment.logo;
  show = !(localStorage.getItem('instCat') === 'Covid-19 Institution');
  deli =
    localStorage.getItem('instCat') === 'Delivery Institution' ? true : false;
  is_head = localStorage.getItem('is_head') === 'true' ? true : false;
  is_sAdmin = localStorage.getItem('userType') === 'Super Admin' ? true : false;
  tUser = localStorage.getItem('userType') === 'Triage' ? true : false;

  isHandset$: Observable<boolean> = this.BreakpointObserver.observe(
    Breakpoints.Handset
  ).pipe(map((result) => result.matches));

  constructor(
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private _data: DataService,
    private BreakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private toast: ToastrService
  ) {}

  ngOnInit() {}

  changePassword() {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      data: {
        service: 'Change Password',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      // console.log(result);
      if (result != undefined) {
        this._data.changeUserPass(result).subscribe(
          (data) => {
            if (data.type === HttpEventType.Response) {
              if (data.body?.code === 200) {
                this.toast.success('Password Changed!');
                this.logout();
              } else if (data.body?.code) {
                this.errorSnackBar();
                console.log(data.body);
              } else {
                this.errorSnackBar();
                console.log(data.body);
              }
            }
          },
          (error) => {
            this.errorSnackBar();
            console.log(error);
          }
        );
      }
    });
  }

  logout() {
    this.openSnackBar('Logging out...');
    localStorage.clear();
    // this.auth.setAdminStatus(false);
    this.router.navigate(['']);
    console.clear();
  }

  openSnackBar(msg: string) {
    this.snackBar.open(msg, '', {
      duration: 200,
    });
  } //end openSnackBar method

  errorSnackBar() {
    this.snackBar.open(
      "There was an issue; Please contact the System's Administrator",
      '',
      {
        horizontalPosition: 'end',
        verticalPosition: 'top',
        duration: 4000,
      }
    );
  } //END METHOD
}

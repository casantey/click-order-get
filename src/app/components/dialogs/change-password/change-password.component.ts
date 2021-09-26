import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  changePassword: FormGroup;
  hide = true;
  hide1 = true;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: { service: string },
    private fb: FormBuilder
  ) {
    this.changePassword = this.fb.group({
      // username: [null, [Validators.required]],
      oldPass: [null, [Validators.required]],
      newPass: [null, [Validators.required]],
      userId: [localStorage.getItem('username')],
      // confirmPass: [null, [
      //   Validators.required
      // ]]
    });
  }

  ngOnInit() {}

  get username() {
    return this.changePassword.get('username');
  }
  get oldPass() {
    return this.changePassword.get('oldPass');
  }
  get newPass() {
    return this.changePassword.get('newPass');
  }
  // get confirmPass(){
  //   return this.changePassword.get('confirmPass');
  // }

  check() {
    console.log(this.oldPass!.value);
  }

  onNoClick(): void {
    this.dialogRef.close();
  } //onNoClick
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-attribute',
  templateUrl: './add-attribute.component.html',
  styleUrls: ['./add-attribute.component.scss'],
})
export class AddAttributeComponent implements OnInit {
  constructor(
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this._dialogRef.close();
  } //onNoClick
}

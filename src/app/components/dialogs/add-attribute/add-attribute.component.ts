import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-attribute',
  templateUrl: './add-attribute.component.html',
  styleUrls: ['./add-attribute.component.scss'],
})
export class AddAttributeComponent implements OnInit {
  groupName: string = '';
  allowMultiple: boolean = false;
  attributes: { attributeName: string; price: number }[] = [
    { attributeName: '', price: 0 },
  ];

  constructor(
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {}

  addNewAttribute() {
    this.attributes.push({ attributeName: '', price: 0 });
  }

  removeAttribute(index: number) {
    this.attributes.splice(index, 1);
  }

  validateForm() {
    let temp = this.attributes.filter((temp) => {
      return temp.attributeName.toString().trim() == '';
    });
    return (
      this.groupName == '' || this.attributes.length == 0 || temp.length > 0
    );
  }

  addAttribute() {
    this._dialogRef.close({
      groupName: this.groupName,
      allowMultiple: this.allowMultiple,
      attributes: this.attributes,
    });
  }

  onNoClick(): void {
    this._dialogRef.close();
  } //onNoClick
}

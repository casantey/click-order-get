import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vendor } from 'src/app/util/interfaces/vendor';

@Component({
  selector: 'app-add-vendor',
  templateUrl: './add-vendor.component.html',
  styleUrls: ['./add-vendor.component.scss'],
})
export class AddVendorComponent implements OnInit {
  newVendor: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: { vendor: Vendor; type: string }
  ) {}

  ngOnInit(): void {
    this.newVendor = this._fb.group({
      vendorName: [this.data.vendor.vendorName ?? null, [Validators.required]],
      vendorLogo: [this.data.vendor.vendorLogo ?? null, [Validators.required]],
      vendorPhone: [
        this.data.vendor.vendorPhone ?? null,
        [Validators.required],
      ],
      vendorEmail: [
        this.data.vendor.vendorEmail ?? null,
        [Validators.required],
      ],
      vendorDescription: [
        this.data.vendor.vendorDescription ?? null,
        [Validators.required],
      ],
      longitude: [this.data.vendor.longitude ?? null, [Validators.required]],
      latitude: [this.data.vendor.latitude ?? null, [Validators.required]],
    });
  }

  get vendorName() {
    return this.newVendor.get('vendorName');
  }
  get vendorLogo() {
    return this.newVendor.get('vendorLogo');
  }
  get vendorPhone() {
    return this.newVendor.get('vendorPhone');
  }
  get vendorEmail() {
    return this.newVendor.get('vendorEmail');
  }
  get vendorDescription() {
    return this.newVendor.get('vendorDescription');
  }
  get longitude() {
    return this.newVendor.get('longitude');
  }
  get latitude() {
    return this.newVendor.get('latitude');
  }

  onNoClick(): void {
    this._dialogRef.close();
  } //onNoClick
}

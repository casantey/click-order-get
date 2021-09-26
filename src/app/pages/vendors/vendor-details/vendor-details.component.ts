import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Vendor } from 'src/app/util/interfaces/vendor';
import { DataService } from 'src/app/util/service/data.service';
import { dateTime } from 'src/app/util/functions/date';
import { MatDialog } from '@angular/material/dialog';
import { AddVendorComponent } from 'src/app/components/dialogs/add-vendor/add-vendor.component';
import { AddAttributeComponent } from 'src/app/components/dialogs/add-attribute/add-attribute.component';

@Component({
  selector: 'app-vendor-details',
  templateUrl: './vendor-details.component.html',
  styleUrls: ['./vendor-details.component.scss'],
})
export class VendorDetailsComponent implements OnInit {
  loading: boolean = true;
  id: string = this.route.snapshot.params['id'];
  vendor: Vendor = {
    vendorId: '',
    vendorName: '',
    vendorDescription: '',
    vendorLogo: '',
    vendorPhone: '',
    vendorEmail: '',
    vendorStatus: false,
    latitude: 0,
    longitude: 0,
    dateAdded: '',
    products: [],
  };
  panelOpenState = false;

  constructor(
    private route: ActivatedRoute,
    private _data: DataService,
    private toast: ToastrService,
    private _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getVendorDetails(this.id);
  }

  addAttribute() {
    this.loading = true;

    const dialogRef = this._dialog.open(AddAttributeComponent);

    dialogRef.afterClosed().subscribe((response) => {
      this.loading = false;
      console.log({ response });
    });
  }

  getVendorDetails(id: string) {
    this.toast.info('Getting vendor details');

    this._data.getVendorDetails(id).subscribe(
      (response) => {
        if (response.type == HttpEventType.Response) {
          let data = response.body.data;

          this.vendor = data;
        }
        this.toast.clear();
      },
      (error) => {
        this.toast.error('Could not get Vendor details', '', {
          timeOut: 15000,
          closeButton: true,
        });
        console.log({ error });
      },
      () => {
        this.loading = false;
      }
    );
  }

  modifyVendorDetails() {
    this.loading = true;

    const dialogRef = this._dialog.open(AddVendorComponent, {
      data: { vendor: this.vendor, type: 'modify' },
    });

    dialogRef.afterClosed().subscribe((response) => {
      this.loading = false;

      if (response) {
        this.loading = true;
        this.toast.info('Modifying vendor details');

        this._data.modifyVendorDetails(this.id, response).subscribe(
          (response) => {
            if (response.type == HttpEventType.Response) {
              let data = response.body.data;

              this.vendor = data;
            }
            this.toast.clear();
          },
          (error) => {
            this.toast.error('Could not modify vendor details', '', {
              timeOut: 15000,
              closeButton: true,
            });
            console.log({ error });
          },
          () => {
            this.loading = false;
          }
        );
      }
    });
  }

  formatDate(date: string) {
    return dateTime(date);
  }
}

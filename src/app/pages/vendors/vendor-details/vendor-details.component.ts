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
import { Product } from 'src/app/util/interfaces/product';
import { AddProductComponent } from 'src/app/components/dialogs/add-product/add-product.component';

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
    attributes: [],
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

  addProductDialog() {
    this.loading = true;

    const dialogRef = this._dialog.open(AddProductComponent, {
      data: { vendorId: this.vendor.vendorId },
    });

    dialogRef.afterClosed().subscribe(
      (response) => {
        if (response) {
          this.addProduct(response);
        }
      },
      (error) => {
        this.toast.error('Could not finish operation', 'Unknown Error');
        console.log({ error });
      },
      () => {
        this.loading = false;
      }
    );
  }

  addProduct(data: Product) {
    this.loading = true;
    this.toast.info('Adding product to collection');

    this._data.addProduct(data).subscribe(
      (response) => {
        if (response.type == HttpEventType.Response) {
          this.toast.clear();
          switch (response.status) {
            case 201:
              this.toast.success('Product added to collection');
              let res = response.body;
              this.vendor.products.push(res.data);
              break;
            default:
              this.toast.warning(
                'Could not add product to collection',
                'Unknown Error'
              );
              console.log({ response: response.body });
              break;
          }
        }
      },
      (error) => {
        this.toast.error('Could not add product to collection');
        console.log({ error });
      },
      () => {
        this.loading = false;
      }
    );
  }

  addAttribute() {
    this.loading = true;

    const dialogRef = this._dialog.open(AddAttributeComponent);

    dialogRef.afterClosed().subscribe((response) => {
      this.loading = false;
      if (response) {
        this.loading = true;

        this._data.addAttributes({ ...response, vendorId: this.id }).subscribe(
          (response) => {
            if (response.type == HttpEventType.Response) {
              let data = response.body;
              console.log({ data });
            }
          },
          (error) => {
            this.toast.error('Could not add attribute', '', {
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

  getVendorDetails(id: string) {
    this.toast.info('Getting vendor details');

    this._data.getVendorDetails(id).subscribe(
      (response) => {
        if (response.type == HttpEventType.Response) {
          // console.log({ data: response.body });
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

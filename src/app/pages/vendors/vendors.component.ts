import { HttpEventType } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { AddVendorComponent } from "src/app/components/dialogs/add-vendor/add-vendor.component";
import { MapComponent } from "src/app/components/dialogs/map/map.component";
import { Vendor } from "src/app/util/interfaces/vendor";
import { DataService } from "src/app/util/service/data.service";

@Component({
  selector: "app-vendors",
  templateUrl: "./vendors.component.html",
  styleUrls: ["./vendors.component.scss"],
})
export class VendorsComponent implements OnInit {
  displayedColumns: string[] = ["vendorName", "dateAdded", "action"];
  dataSource: MatTableDataSource<Vendor>;
  vendors: Vendor[] = [];
  loading = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private _data: DataService,
    private toast: ToastrService,
    private _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getVendors();
  }

  viewMap(lat: number, long: number) {
    this.loading = true;
    // console.log(lat, long);
    const dialogRef = this._dialog.open(MapComponent, {
      data: {
        long: long,
        lat: lat,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loading = false;
    });
  }

  addVendorDialog() {
    this.loading = true;

    const dialogRef = this._dialog.open(AddVendorComponent);

    dialogRef.afterClosed().subscribe(
      (response) => {
        if (response) {
          this.addVendor(response);
        }
      },
      (error) => {
        this.toast.error("Could not finish operation", "Unknown Error");
        console.log({ error });
      },
      () => {
        this.loading = false;
      }
    );
  }

  addVendor(data: Vendor) {
    this.loading = true;
    this.toast.info("Adding vendor to collection");

    this._data.addVendor(data).subscribe(
      (response) => {
        if (response.type == HttpEventType.Response) {
          this.toast.clear();
          switch (response.status) {
            case 201:
              this.toast.success("Vendor added to collection");
              let res = response.body;
              this.vendors.push(res.data);
              this.setTable(this.vendors);
              break;
            default:
              this.toast.warning(
                "Could not add vendor to collection",
                "Unknown Error"
              );
              console.log({ response: response.body });
              break;
          }
        }
      },
      (error) => {
        this.toast.error("Could not add vendor to collection");
        console.log({ error });
      },
      () => {
        this.loading = false;
      }
    );
  }

  getVendors() {
    this.loading = true;
    this.toast.info("Getting vendors...");

    this._data.getVendors().subscribe(
      (response) => {
        if (response.type == HttpEventType.Response) {
          this.toast.clear();
          let data = response.body;

          this.setTable(data);
        }
      },
      (error) => {
        this.toast.error("Could not get vendors...");
        console.log({ error });
      },
      () => {
        this.loading = false;
      }
    );
  }

  setTable(data: Vendor[] | null) {
    this.vendors = data ?? [];
    this.dataSource = new MatTableDataSource(data ?? []);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

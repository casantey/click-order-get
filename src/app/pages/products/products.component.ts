import { HttpEventType } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { AddProductComponent } from "src/app/components/dialogs/add-product/add-product.component";
import { Product } from "src/app/util/interfaces/product";
import { Vendor } from "src/app/util/interfaces/vendor";
import { DataService } from "src/app/util/service/data.service";
import { formatDate } from "src/app/util/functions/date.js";
import { formatDecimal } from "src/app/util/functions/numeral.js";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.scss"],
})
export class ProductsComponent implements OnInit {
  displayedColumns: string[] = [
    "productName",
    "productCategory",
    "productDescription",
    "unitPrice",
    "dateAdded",
    "action",
  ];
  dataSource: MatTableDataSource<Product>;
  products: Product[] = [];
  vendors: Vendor[] = [];
  vendor: string = "";
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
    this.getProducts();
  }

  parseDate(date: string) {
    return formatDate(date);
  }
  parseNumber(date: string) {
    return formatDecimal(date);
  }

  addProductDialog() {
    this.loading = true;

    const dialogRef = this._dialog.open(AddProductComponent, {
      data: { vendorId: this.vendor },
    });

    dialogRef.afterClosed().subscribe(
      (response) => {
        if (response) {
          this.addProduct(response);
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

  addProduct(data: Product) {
    this.loading = true;
    this.toast.info("Adding product to collection");

    this._data.addProduct(data).subscribe(
      (response) => {
        if (response.type == HttpEventType.Response) {
          this.toast.clear();
          switch (response.status) {
            case 201:
              this.toast.success("Product added to collection");
              let res = response.body;
              this.products.push(res.data);
              this.setTable(this.products);
              break;
            default:
              this.toast.warning(
                "Could not add product to collection",
                "Unknown Error"
              );
              console.log({ response: response.body });
              break;
          }
        }
      },
      (error) => {
        this.toast.error("Could not add product to collection");
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
          this.vendor = data[0].vendorId;
          this.vendors = data;
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

  getProducts() {
    this.loading = true;
    this.toast.info("Getting products...");

    this._data.getProducts().subscribe(
      (response) => {
        if (response.type == HttpEventType.Response) {
          this.toast.clear();
          let data = response.body;

          this.setTable(data);
        }
      },
      (error) => {
        this.toast.error("Could not get products...");
        console.log({ error });
      },
      () => {
        this.loading = false;
      }
    );
  }

  setTable(data: Product[] | null) {
    this.products = data ?? [];
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

import { HttpEventType } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Order } from "src/app/util/interfaces/order";
import { DataService } from "src/app/util/service/data.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { MapComponent } from "src/app/components/dialogs/map/map.component";

@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.scss"],
})
export class OrdersComponent implements OnInit {
  selectedReport: string = sessionStorage.getItem("selectedReport") ?? "1";
  timePeriod: string = sessionStorage.getItem("timePeriod") ?? "today";
  loading: boolean;
  orders: Order[];
  emptyTable: boolean = true;
  displayedColumns: string[] = [
    "orderNo",
    "dateCreated",
    "itemCategory",
    "itemName",
    // "recipient",
    "item_quantity",
    "phone",
    "orderStatus",
    "action",
  ];
  dataSource: MatTableDataSource<Order>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private _data: DataService,
    private toast: ToastrService,
    private _dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  getOrders() {
    this.toast.info("Getting orders");
    sessionStorage.setItem("timePeriod", this.timePeriod);
    sessionStorage.setItem("selectedReport", this.selectedReport);
    this.loading = true;
    let bod = {
      report: this.selectedReport,
      timePeriod: this.timePeriod,
    };
    // console.log(bod);
    this._data.getOrders(bod).subscribe(
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

  setTable(data: Order[] | null) {
    if (data.length > 0) this.emptyTable = false;
    this.orders = data ?? [];
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

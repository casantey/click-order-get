import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { Application } from 'src/app/util/interfaces/application';
import { DataService } from 'src/app/util/service/data.service';
import { dateTime } from 'src/app/util/functions/date';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
})
export class ApplicationsComponent implements OnInit {
  displayedColumns: string[] = [
    'applicantName',
    'gender',
    'contactEmail',
    'contactPhone',
    'status',
    'applicationDate',
    'action',
  ];
  loading: boolean = true;
  length: number = 0;
  applications: Application[] = [];
  pagedList: Application[] = [];
  pageSize = 5;
  pageSizeOptions = [5, 10, 15, 20, 30];
  dataSource: MatTableDataSource<Application>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _data: DataService, private toast: ToastrService) {}

  ngOnInit(): void {
    this.getApplications();
  }

  getName(item: Application) {
    switch (item.type) {
      case 'Rider':
        return `${item.applicantFirstName}${
          item.applicantMiddleName ? ' ' + item.applicantMiddleName : ''
        } ${item.applicantLastName}`;
      case 'Vendor':
        return item.vendorName;
    }
  }

  getApplications() {
    this.loading = false;

    this._data.getApplications().subscribe(
      (response) => {
        if (response.type == HttpEventType.Response) {
          let data = response.body.data;

          this.setTable(data);
          // this.applications = data;
          // this.setPagination();

          // console.log({ data });
        }
      },
      (error) => {
        this.toast.error('Could not get applications', '', {
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

  setTable(data: Application[] | null) {
    this.applications = data ?? [];
    this.dataSource = new MatTableDataSource(data ?? []);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  OnPageChange(event: PageEvent) {
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.length) endIndex = this.length;

    this.pagedList = this.applications.slice(startIndex, endIndex);
  }

  setPagination() {
    this.length = this.applications.length;
    this.pagedList = this.applications.slice(0, this.pageSize);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatDate(date: string) {
    return dateTime(date);
  }
}

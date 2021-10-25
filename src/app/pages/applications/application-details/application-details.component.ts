import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Application } from 'src/app/util/interfaces/application';
import { DataService } from 'src/app/util/service/data.service';
import { dateTime } from 'src/app/util/functions/date';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent implements OnInit {
  loading: boolean = true;
  applicationDetails: Application = {
    applicantFirstName: '',
    applicantLastName: '',
    applicantMiddleName: '',
    applicationDate: '',
    applicationNumber: '',
    contactEmail: '',
    contactPhone: '',
    dateOfBirth: '',
    gender: '',
    id: '',
    image: '',
    status: '',
    type: '',
    vendorName: '',
    reviewedBy: '',
  };
  id: string = this.route.snapshot.params['id'];

  constructor(
    private _data: DataService,
    private toast: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getApplicationDetails(this.id);
  }

  review(status: string) {
    this.toast.info('Updating application status');
    this.loading = true;

    let data = {
      status,
      id: this.id,
      reviewedBy: {
        id: localStorage.getItem('user_id'),
        name: localStorage.getItem('fullname'),
      },
      applicationDetails: this.applicationDetails,
    };

    this._data.updateApplication(data).subscribe(
      (response) => {
        if (response.type == HttpEventType.Response) {
          this.toast.clear();
          let data = response.body.data;
          this.toast.success(response.body.message);
          this.applicationDetails = data;

          // console.log({ data });
        }
      },
      (error) => {
        this.toast.error('Could not update application status', '', {
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

  getApplicationDetails(id: string) {
    this.toast.info('Getting application details');

    this._data.getApplicationDetails(id).subscribe(
      (response) => {
        if (response.type == HttpEventType.Response) {
          let data = response.body.data;
          this.applicationDetails = data;
          this.toast.clear();

          // console.log({ data });
        }
      },
      (error) => {
        this.toast.error('Could not get application details');
        console.log({ error });
      },
      () => {
        this.loading = false;
      }
    );
  }

  getName(item: Application) {
    switch (item.type) {
      case 'Rider':
        let name = `${item.applicantFirstName}${
          item.applicantMiddleName ? ' ' + item.applicantMiddleName : ''
        } ${item.applicantLastName}`;
        this.applicationDetails.applicantName = name;
        return name;
      case 'Vendor':
        this.applicationDetails.applicantName = item.vendorName;
        return item.vendorName;
    }
  }

  parseObject(obj: string) {
    if (!obj) return '';
    return JSON.parse(obj);
  }

  formatDate(date: string) {
    return dateTime(date);
  }
}

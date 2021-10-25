import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DataService } from 'src/app/util/service/data.service';
import { Order } from 'src/app/util/interfaces/order';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnInit {
  orderNo: string = this.route.snapshot.params['id'];
  loading: boolean = true;
  order: Order;
  flavors: [];
  @ViewChild('gmap', { static: true })
  gmapElement: any;
  map: google.maps.Map;
  marker: google.maps.Marker;

  constructor(
    private route: ActivatedRoute,
    private _data: DataService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.getOrderDetails(this.orderNo);
  }

  getOrderDetails(id: string) {
    this.flavors = [];
    // this.resetValues();
    this._data.getOrderDetails(id).subscribe(
      (data) => {
        if (data.type == HttpEventType.Response) {
          this.loading = false;
          // console.log(data.body);
          if (data.body['code']) {
            // this.openErrorSnackBar("There was an issue getting data; Please contact the system's administrator");
            this.toast.warning(
              'Could not find details for selected case',
              'Error',
              {
                closeButton: true,
                timeOut: 15000,
              }
            );
            return console.log(data.body);
          }

          this.order = data.body;

          // this.itemFlavor = this.getFlavors(this.order);
          // if (this.order.orderStatusId > 2)
          // 	this.delivery_agent = this.data.delivery_agent_name;
          // this.checkCaseAssignment(id);
          this.setMap(data.body.orderLong, data.body.orderLat);
          // this.getCurrentStatus();
          // this.patientCheck();
        }
      },
      (error) => {
        this.toast.error(
          'There was an error; Please contact the Administrator!'
        );
        console.log(error);
      },
      () => {
        this.loading = false;
      }
    );
  }

  assign() {
    this.loading = true;
    this._data
      .assignOrder({ agent: 'PBADD001', orderNo: this.orderNo })
      .subscribe(
        (data) => {
          if (data.type == HttpEventType.Response) {
            this.loading = false;
            // console.log(data.body);
            if (data.body['code']) {
              // this.openErrorSnackBar("There was an issue getting data; Please contact the system's administrator");
              this.toast.warning(
                'Could not find details for selected case',
                'Error',
                {
                  closeButton: true,
                  timeOut: 15000,
                }
              );
              return console.log(data.body);
            }
            this.toast.success('Order assigned');

            this.order = data.body;

            // this.itemFlavor = this.getFlavors(this.order);
            // if (this.order.orderStatusId > 2)
            // 	this.delivery_agent = this.data.delivery_agent_name;
            // this.checkCaseAssignment(id);
            this.setMap(data.body.orderLong, data.body.orderLat);
            // this.getCurrentStatus();
            // this.patientCheck();
          }
        },
        (error) => {
          this.toast.error(
            'There was an error; Please contact the Administrator!'
          );
          console.log(error);
        },
        () => {
          this.loading = false;
        }
      );
  }

  /*
	checkCaseAssignment(id: string) {
		this.loading = true;
		this._data.checkCaseAssignment(id).subscribe(
			(data) => {
				if (data.type === HttpEventType.Response) {
					this.loading = false;
					// console.log(data.body);
					if (data.body["code"]) {
						this.toast.warning(
							"Could not get data; Kindly contact the system's adminstrator",
							"Unknown Error",
							{
								closeButton: true,
								timeOut: 15000,
							}
						);
						console.log(data.body);
					} else if (data.body.length > 0) {
						this.assigned = false;
						this.checkMine(data.body);
						let i = 0;
						if (data.body[i]["status"] === 0) {
							this.modStatus = true;
							// this.toast.info("Case closed");
						}
					} else if (data.body.length === 0) {
						this.selected = "1";
						this.notMine = false;
						// this.modStatus = false;
					}
				}
			},
			(error) => {
				this.loading = false;
				this.errorMsg = "There was an error; Please contact the Administrator!";
				console.log(error);
			}
		);
	}
  */

  setMap(long: number, lat: number) {
    const mapProp = {
      center: new google.maps.LatLng(lat, long),
      zoom: 19,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      fullscreenControl: true,
    };

    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    this.marker = new google.maps.Marker({
      position: {
        lat: lat,
        lng: long,
      },
      map: this.map,
    });
  } //END METHOD
}

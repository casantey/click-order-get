import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit {
  @ViewChild("gmap", { static: true })
  gmapElement: any;
  map: google.maps.Map;
  marker: google.maps.Marker;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    const mapProp = {
      center: new google.maps.LatLng(this.data.lat, this.data.long),
      zoom: 19,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      fullscreenControl: true,
    };

    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    this.marker = new google.maps.Marker({
      position: {
        lat: this.data.lat,
        lng: this.data.long,
      },
      map: this.map,
    });
  }
}

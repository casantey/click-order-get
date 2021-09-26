import { HttpEventType } from "@angular/common/http";
import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { FlavorGroup } from "src/app/util/interfaces/flavor-group";
import { Vendor } from "src/app/util/interfaces/vendor";
import { DataService } from "src/app/util/service/data.service";

@Component({
  selector: "app-add-product",
  templateUrl: "./add-product.component.html",
  styleUrls: ["./add-product.component.scss"],
})
export class AddProductComponent implements OnInit {
  newProduct: FormGroup;
  loading: boolean = false;
  flavorGroups: FlavorGroup[];

  constructor(
    private _fb: FormBuilder,
    private _data: DataService,
    private toast: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: Vendor,
    private _dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {
    this.getFlavorGroups();

    this.newProduct = this._fb.group({
      productName: [null, [Validators.required]],
      productCategory: [null, [Validators.required]],
      productDescription: [null, [Validators.required]],
      unitPrice: [null, [Validators.required, Validators.min(0)]],
      imageUrl: [null, [Validators.required]],
      currency: [null, [Validators.required]],
      vendorId: [this.data.vendorId],
      flavorsId: [null, [Validators.required]],
    });
  }

  getFlavorGroups() {
    this.loading = true;
    this.toast.info("Getting flavor groups...");

    this._data.getFlavorGroups().subscribe(
      (response) => {
        if (response.type == HttpEventType.Response) {
          this.toast.clear();
          let data = response.body;
          this.flavorGroups = data;
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

  get productName() {
    return this.newProduct.get("productName");
  }
  get productCategory() {
    return this.newProduct.get("productCategory");
  }
  get productDescription() {
    return this.newProduct.get("productDescription");
  }
  get uintPrice() {
    return this.newProduct.get("uintPrice");
  }
  get imageUrl() {
    return this.newProduct.get("imageUrl");
  }
  get currency() {
    return this.newProduct.get("currency");
  }
  get flavorsId() {
    return this.newProduct.get("flavorsId");
  }

  onNoClick(): void {
    this._dialogRef.close();
  } //onNoClick
}

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Product } from "../interfaces/product";
import { UserData } from "../interfaces/user-data";
import { Vendor } from "../interfaces/vendor";
import { FlavorGroup } from "../interfaces/flavor-group";
import { Order } from "../interfaces/order";

const _api = environment._api;

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor(private http: HttpClient) {}

  checkCaseAssignment(id: string) {
    return this.http.get<[]>(`${_api}/orders/assignment/${id}`, {
      reportProgress: true,
      observe: "events",
    });
  } // END METHOD

  getVendorDetails(id:string){
    return this.http.get<{data: Vendor,message: string, error?:any}>(`${_api}/vendor/${id}`,{
      reportProgress: true,
      observe: "events",
    })
  }

  getOrderDetails(id: string) {
    return this.http.get<Order>(`${_api}/orders/order/${id}`, {
      reportProgress: true,
      observe: "events",
    });
  }

  addProduct(data: Product) {
    return this.http.post<{ data: Product; message: string }>(
      `${_api}/product`,
      data,
      {
        reportProgress: true,
        observe: "events",
      }
    );
  }

  modifyVendorDetails(id:string,data:Vendor){
    return this.http.put<{ data: Vendor; message: string }>(`${_api}/vendor/${id}`,data,
    {
      reportProgress: true,
      observe: "events",
    })
  }

  addVendor(data: Vendor) {
    return this.http.post<{ data: Vendor; message: string }>(
      `${_api}/vendor`,
      data,
      {
        reportProgress: true,
        observe: "events",
      }
    );
  }

  getOrders(data: { report: string; timePeriod: string }) {
    return this.http.post<Order[]>(`${_api}/orders`, data, {
      reportProgress: true,
      observe: "events",
    });
  }

  getFlavorGroups() {
    return this.http.get<FlavorGroup[]>(`${_api}/flavor/group`, {
      reportProgress: true,
      observe: "events",
    });
  }

  getProducts() {
    return this.http.get<Product[]>(`${_api}/product/all`, {
      reportProgress: true,
      observe: "events",
    });
  }

  getVendors() {
    return this.http.get<Vendor[]>(`${_api}/vendor/all`, {
      reportProgress: true,
      observe: "events",
    });
  }

  changeUserPass(data: any) {
    return this.http.put<UserData>(`${_api}/user/authenticate`, data, {
      reportProgress: true,
      observe: "events",
    });
  } // END METHOD

  authenticate(data: UserData) {
    return this.http.post<UserData>(`${_api}/user/authenticate`, data, {
      reportProgress: true,
      observe: "events",
    });
  } // END METHOD
}

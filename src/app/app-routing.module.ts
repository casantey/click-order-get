import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { OrderDetailsComponent } from "./pages/orders/order-details/order-details.component";
import { OrdersComponent } from "./pages/orders/orders.component";
import { ProductsComponent } from "./pages/products/products.component";
import { VendorDetailsComponent } from "./pages/vendors/vendor-details/vendor-details.component";
import { VendorsComponent } from "./pages/vendors/vendors.component";
import { LoginGuard } from "./util/guards/login.guard";
import { RouteGuard } from "./util/guards/route.guard";
import { LoginComponent } from "./views/main/login/login.component";

const routes: Routes = [
  {
    path: "orders/:id",
    component: OrderDetailsComponent,
    canActivate: [LoginGuard, RouteGuard],
  },
  {
    path: "orders",
    component: OrdersComponent,
    canActivate: [LoginGuard, RouteGuard],
  },
  {
    path: "products",
    component: ProductsComponent,
    canActivate: [LoginGuard, RouteGuard],
  },
  {
    path: "vendors",
    component: VendorsComponent,
    canActivate: [LoginGuard, RouteGuard],
  },
  {
    path: "vendors/:id",
    component: VendorDetailsComponent,
    canActivate: [LoginGuard, RouteGuard],
  },
  // {
  //   path: "dashboard",
  //   component: DashboardComponent,
  //   canActivate: [LoginGuard, RouteGuard],
  // },
  { path: "login", component: LoginComponent },
  { path: "", component: LoginComponent },
  { path: "**", component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialUiModule } from './util/modules/material-ui.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { entryComponents } from './util/modules/entryComponents';

import { FullCalendarModule } from '@fullcalendar/angular';
import { ChartsModule } from 'ng2-charts';
import { AgmCoreModule } from '@agm/core';
import { ToastrModule } from 'ngx-toastr';
import { TokenInterceptorService } from './util/service/token-interceptor.service';
import { AuthService } from './util/service/auth.service';
import { LoginComponent } from './views/main/login/login.component';
import { FooterComponent } from './views/main/footer/footer.component';
import { NavComponent } from './views/main/nav/nav.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NavigationComponent } from './components/base/navigation/navigation.component';
import { ChangePasswordComponent } from './components/dialogs/change-password/change-password.component';
import { MapComponent } from './components/dialogs/map/map.component';
import { ModifyInstitutionComponent } from './components/dialogs/modify-institution/modify-institution.component';
import { ConfirmDeleteComponent } from './components/dialogs/confirm-delete/confirm-delete.component';
import { VendorsComponent } from './pages/vendors/vendors.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ProductsComponent } from './pages/products/products.component';
import { HeadComponent } from './components/base/head/head.component';
import { AddVendorComponent } from './components/dialogs/add-vendor/add-vendor.component';
import { AddProductComponent } from './components/dialogs/add-product/add-product.component';
import { OrderDetailsComponent } from './pages/orders/order-details/order-details.component';
import { VendorDetailsComponent } from './pages/vendors/vendor-details/vendor-details.component';
import { AddAttributeComponent } from './components/dialogs/add-attribute/add-attribute.component';
import { ApplicationsComponent } from './pages/applications/applications.component';
import { ApplicationDetailsComponent } from './pages/applications/application-details/application-details.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FooterComponent,
    NavComponent,
    DashboardComponent,
    NavigationComponent,
    ChangePasswordComponent,
    MapComponent,
    ModifyInstitutionComponent,
    ConfirmDeleteComponent,
    VendorsComponent,
    OrdersComponent,
    ProductsComponent,
    HeadComponent,
    AddVendorComponent,
    AddProductComponent,
    OrderDetailsComponent,
    VendorDetailsComponent,
    AddAttributeComponent,
    ApplicationsComponent,
    ApplicationDetailsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialUiModule,
    MatDatepickerModule,
    MatNativeDateModule,
    HttpClientModule,
    FullCalendarModule,
    ChartsModule,
    ToastrModule.forRoot({
      timeOut: 5000,
    }),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBIHVcWWmBAmLTL6PSGNbdvtwrSLQRtUUQ',
      libraries: ['places'],
    }),
  ],
  providers: [
    AuthService,
    LoginComponent,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  entryComponents,
})
export class AppModule {}

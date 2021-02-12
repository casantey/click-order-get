import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialUiModule } from './util/modules/material-ui.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

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

@NgModule({
  declarations: [AppComponent, LoginComponent, FooterComponent, NavComponent],
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
  entryComponents: [],
})
export class AppModule {}

import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TokenInterceptorService implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(req: any, next: any) {
    let authService = this.injector.get(AuthService);
    let rq = req.clone({
      setHeaders: {
        Authorization: 'cG90YmVsbHk6QDIwMjA=',
        'X-Auth': `Bearer ${authService.getToken}`,
      },
    });
    return next.handle(rq);
  }
}

import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "../service/auth.service";

@Injectable({
  providedIn: "root",
})
export class RouteGuard implements CanActivate {
  constructor(private _auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this._auth.loggedIn) return true;
    else {
      this.router.navigate(["/"]);
      localStorage.clear();
      return false;
    }
  }
}

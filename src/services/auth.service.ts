import { Observable } from 'rxjs/Rx';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService implements CanActivate {

  constructor(private router: Router) {
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const isLoggedIn: boolean = this.isLoggedIn();
    if (!isLoggedIn) {
      this.router.navigate(['login']);
    }
    return isLoggedIn;

  }

  private isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}

import { RoutesRecognized } from '@angular/router';
import { provideRouterInitializer } from '@angular/router/src/router_module';
import { Observable } from 'rxjs/Rx';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService implements CanActivate {

    private authConfig = {
        facebook: {
            clientId: '285582655231533',
            redirectURI: 'http://localhost:4200/',
            authEndpoint: '~/auth/facebook'
        },
        google: {
            clientId: '',
            redirectURI: 'http://localhost:4200/',
            authEndpoint: '~/auth/google'
        }
    };

    private code;

    constructor(private router: Router) {
        if (!this.code) {
            this.code = this.extractCode();
            if (this.code) {
                this.removeFacebookHash();
            }
        }
    }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const isLoggedIn: boolean = this.isLoggedIn();
        if (!isLoggedIn && !this.code) {
            this.router.navigate(['login']);
        }
        if (this.code) {
            return this.loginProvider();
        }
        return isLoggedIn;
    }

    auth(provider: string): void {
        localStorage.setItem('provider', provider);
        switch (provider) {
            case 'facebook':
                // tslint:disable-next-line:max-line-length
                window.location.href = 'https://www.facebook.com/v2.8/dialog/oauth?client_id='
                    + this.authConfig.facebook.clientId
                    + '&redirect_uri='
                    + this.authConfig.facebook.redirectURI
                    + '&scope=email';
                break;
            case 'google':
                window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id='
                    + this.authConfig.google.clientId
                    + '&redirect_uri='
                    + this.authConfig.google.redirectURI
                    + '&scope=email%20profile';
                break;
            default:
                break;
        }
    }

    logout(): void {
        localStorage.removeItem('token');
        this.router.navigate(['login']);
    }

    private loginProvider(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const providerId = localStorage.getItem('provider');
            if (!providerId || !this.authConfig[providerId] || !this.code) {
                reject(false);
            } else {
                // TODO: do login to your server
                const provider = this.authConfig[providerId];
                const body = { 'code': this.code, 'clientId': provider.clientId, 'redirectUri': provider.redirectURI };
                // this._http.post(provider.authEndpoint, body, {})

                localStorage.setItem('token', 'express-jwt-token-here');
                resolve(true);
            }
        });
    }

    private isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    private extractCode() {
        const query = location.href.split('?')[1];
        if (query) {
            let params = new URLSearchParams(query);
            return params.get('code');
        }
    }

    private removeFacebookHash() {
        // Remove the ugly Facebook appended hash
        // <https://github.com/jaredhanson/passport-facebook/issues/12>
        if (window.location.hash && window.location.hash === '#_=_') {
            if (window.history && history.pushState) {
                window.history.pushState('', document.title, window.location.pathname);
            } else {
                // Prevent scrolling by storing the page's current scroll offset
                const _scroll = {
                    top: document.body.scrollTop,
                    left: document.body.scrollLeft
                };
                window.location.hash = '';
                // Restore the scroll offset, should be flicker free
                document.body.scrollTop = _scroll.top;
                document.body.scrollLeft = _scroll.left;
            }
        }
    }
}

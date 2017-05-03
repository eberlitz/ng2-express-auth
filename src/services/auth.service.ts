import { RoutesRecognized } from '@angular/router';
import { provideRouterInitializer } from '@angular/router/src/router_module';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpInterceptorService } from '@covalent/http';

@Injectable()
export class AuthService implements CanActivate {

    private authConfig = {
        facebook: {
            clientId: '285582655231533',
            redirectURI: 'http://localhost:4200/',
            authEndpoint: '~/auth/facebook',
        },
        google: {
            clientId: '275614897413-gk527ivpf1sg22mjlecvpjnek23dv9dv.apps.googleusercontent.com',
            redirectURI: 'http://localhost:4200/',
            authEndpoint: '~/auth/google',
        },
    };

    private code: string;

    constructor(
        private router: Router,
        private _http: HttpInterceptorService,
    ) {
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
            // .then(() => {
            //     this._http.get('~/api/')
            //         .map((res) => res.json())
            //         .subscribe((res) => {
            //             console.log(res);
            //         });
            //     return true;
            // });
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
                this._http.post(provider.authEndpoint, body, {})
                    .map((res) => res.json())
                    .subscribe((data) => {
                        localStorage.setItem('token', data.access_token);
                        resolve(true);
                    }, reject);
            }
        });
    }

    private isLoggedIn(): boolean {
        // Check if there's an unexpired JWT
        let jwt = localStorage.getItem('token');
        return !!jwt && !this.tokenNotExpired(jwt, 10);
    }

    private tokenNotExpired(jwt: string, offsetSeconds?: number) {
        const jwtHelper = new JwtHelper();
        let date = jwtHelper.getTokenExpirationDate(jwt);
        offsetSeconds = offsetSeconds || 0;
        if (date === null) {
            return false;
        }
        // Token expired?
        return !(date.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
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
                    left: document.body.scrollLeft,
                };
                window.location.hash = '';
                // Restore the scroll offset, should be flicker free
                document.body.scrollTop = _scroll.top;
                document.body.scrollLeft = _scroll.left;
            }
        }
    }
}

// Avoid TS error "cannot find name escape"
declare var escape: any;

class JwtHelper {

    public urlBase64Decode(str: string) {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0: { break; }
            case 2: { output += '=='; break; }
            case 3: { output += '='; break; }
            default: {
                throw new Error('Illegal base64url string!');
            }
        }
        return decodeURIComponent(escape(typeof window === 'undefined'
            ? atob(output)
            : window.atob(output)));
        // polyfill https://github.com/davidchambers/Base64.js
    }

    public decodeToken(token: string) {
        let parts = token.split('.');

        if (parts.length !== 3) {
            throw new Error('JWT must have 3 parts');
        }

        let decoded = this.urlBase64Decode(parts[1]);
        if (!decoded) {
            throw new Error('Cannot decode the token');
        }

        return JSON.parse(decoded);
    }

    public getTokenExpirationDate(token: string) {
        let decoded: any;
        decoded = this.decodeToken(token);

        if (typeof decoded.exp === 'undefined') {
            return null;
        }

        let date = new Date(0); // The 0 here is the key, which sets the date to the epoch
        date.setUTCSeconds(decoded.exp);

        return date;
    }

    public isTokenExpired(token: string, offsetSeconds?: number) {
        let date = this.getTokenExpirationDate(token);
        offsetSeconds = offsetSeconds || 0;
        if (date === null) {
            return false;
        }

        // Token expired?
        return !(date.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
    }
}

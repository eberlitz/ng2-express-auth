import { Injectable } from '@angular/core';
import { RequestOptionsArgs, Headers } from '@angular/http';
import { IHttpInterceptor } from '@covalent/http';

const HEADER_CONTENT_TYPE: string = 'Content-Type';

@Injectable()
export class RequestInterceptor implements IHttpInterceptor {
    private baseUrl = getBaseAPIUrl();
    onRequest(requestOptions: RequestOptionsArgs): RequestOptionsArgs {
        // you add headers or do something before a request here.
        this.setAuthorizationHeader(requestOptions);
        // this.setCommonHeaders(requestOptions);
        requestOptions.url = this.transformUrl(requestOptions.url);
        return requestOptions;
    }

    private setAuthorizationHeader(options: RequestOptionsArgs) {
        let jwt: string = localStorage.getItem('token');
        if (jwt) {
            if (!options.headers) {
                options.headers = new Headers();
            }
            options.headers.set('Authorization', 'Bearer ' + jwt);
        }
    }
    private setCommonHeaders(options: RequestOptionsArgs): void {
        if (options && !options.headers.has(HEADER_CONTENT_TYPE)) {
            options.headers.append(HEADER_CONTENT_TYPE, 'application/json');
        }
    }

    private transformUrl(url: string) {
        if (url && url.indexOf('~/') === 0) {
            return url.replace('~/', this.baseUrl);
        }
        return url;
    }
}

function getBaseAPIUrl() {
    let apiUrl: string = localStorage.getItem('api-url');
    if (apiUrl) {
        if (console) { console.info('Using base API URL: ' + apiUrl); };
        return apiUrl;
    }
    return 'http://localhost:4200/';
}

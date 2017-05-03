import { Injectable } from '@angular/core';
import { RequestOptionsArgs, Headers } from '@angular/http';
import { IHttpInterceptor } from '@covalent/http';

@Injectable()
export class RequestInterceptor implements IHttpInterceptor {
    onRequest(requestOptions: RequestOptionsArgs): RequestOptionsArgs {
        // you add headers or do something before a request here.
        if (!!localStorage.getItem('token')) {
            if (!requestOptions.headers) {
                requestOptions.headers = new Headers();
            }
            requestOptions.headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
        }
        return requestOptions;
    }
}

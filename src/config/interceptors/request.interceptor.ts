import { Injectable } from '@angular/core';
import { RequestOptionsArgs } from '@angular/http';
import { IHttpInterceptor } from '@covalent/http';

@Injectable()
export class RequestInterceptor implements IHttpInterceptor {
  onRequest(requestOptions: RequestOptionsArgs): RequestOptionsArgs {
    // you add headers or do something before a request here.
    if (localStorage.getItem('isLoggedIn') === 'true') {
      requestOptions.headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    }
    return requestOptions;
  }
}

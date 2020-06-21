import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {AuthenticationService} from '../Services/Authentication/authentication.service';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(private auth: AuthenticationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.auth.getAccessToken();

    if (!accessToken) {
      return next.handle(req)
    }

    const requestClone = req.clone({
      headers: req.headers.set('x-access-token', accessToken)
    })
    return next.handle(requestClone)
  }
}

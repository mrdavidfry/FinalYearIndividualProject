import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SmsRequestBody} from '../../Models/authentication/SmsRequestBody.model';
import {MyProfileForm} from '../../Models/MyProfileForm.model';
import {RequestSmsResponse} from '../../Models/authentication/RequestSmsResponse.model';
import {VerifySmsResponse} from '../../Models/authentication/VerifySmsResponse.model';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements CanActivate {

  private uri = environment.mainBackendUrl;

  constructor(private http: HttpClient, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.isUerLoggedIn()) {
      return true;
    }

    this.router.navigate(['login']);
    return false;
  }

  isUerLoggedIn() {
    const accessToken = localStorage.getItem('access_token');
    return accessToken !== null;
  }

  logOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_token_expires');
    localStorage.removeItem('request_id');
    localStorage.removeItem('country_calling_code');
    localStorage.removeItem('phone_number');
    localStorage.removeItem('first_name');
    localStorage.removeItem('verify_id');
  }

  phoneCountryCodes(): string[] {
    const codes: string[] = [];
    this.http.get(this.uri + '/login/info').subscribe((c: string[]) => {
      c.forEach((x: string) => {
        codes.push(x);
        console.log(x)
      });
    });
    return codes;
  }

  requestSmsCode(body: SmsRequestBody) {
    // store number in session storage:
    localStorage.setItem('country_calling_code', body.requestCountryCallingCode);
    localStorage.setItem('phone_number', body.requestPhoneNumber);

    return this.http.post(this.uri + '/user/request-sms-code', body).subscribe((data: any) => {
      const requestSmsResponse = new RequestSmsResponse(data)
      console.log('verify_id:');
      console.log(requestSmsResponse.verifyId);
      localStorage.setItem('verify_id', requestSmsResponse.verifyId);
      },
      error => console.log(error));
  }

  registerUser(user: MyProfileForm) {
    // store number in session storage:
    localStorage.setItem('first_name', user.firstName)
    localStorage.setItem('country_calling_code', user.countryCallingCode);
    localStorage.setItem('phone_number', user.phoneNumber);
    console.log(user);
    return this.http.post(`${this.uri}/user/register`, user).subscribe(
      (response: any) => {localStorage.setItem('verify_id', response.requestId);
                          console.log(response.requestId);
      }
    );
  }

  verifyUser(verify_code: string) {
    const verify_id = localStorage.getItem('verify_id');
    console.log(verify_id);
    return this.http.post(this.uri + '/user/verify', {verify_id, verify_code}).subscribe(
      (response: any) => {
        const verifyResponse = new VerifySmsResponse(response)
        console.log(verifyResponse)
        if (verifyResponse.accessToken && verifyResponse.accessTokenExpires) {
          this.setAccessToken(verifyResponse.accessToken);
          this.setAccessTokenExpires(verifyResponse.accessTokenExpires);
        } else {
          console.log('ERROR: Failed to get access_token and access_token_expires.');
        }
      }
    );
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getAccessTokenExpires() {
    return localStorage.getItem('access_token_expires');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  setAccessToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  setAccessTokenExpires(expires) {
    localStorage.setItem('access_token_expires', expires);
  }
}

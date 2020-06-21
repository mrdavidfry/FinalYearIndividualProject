import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {MyProfileService} from './myprofile.service';
import {MyProfileForm} from '../../Models/MyProfileForm.model';

@Injectable({
  providedIn: 'root'
})
export class MyProfileResolver implements Resolve<MyProfileForm> {

  constructor(private profileService: MyProfileService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MyProfileForm> | Promise<MyProfileForm> | MyProfileForm {

    return this.profileService.getProfile();
  }
}

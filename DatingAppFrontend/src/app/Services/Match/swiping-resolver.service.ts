import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {UserProfile} from '../../Models/UserProfile.model';
import {Observable} from 'rxjs';
import {MockMatchService} from './mockmatch.service';

@Injectable({
  providedIn: 'root'
})
export class SwipingResolverService implements Resolve<UserProfile[]> {

  constructor(private matchService: MockMatchService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserProfile[]> | Promise<UserProfile[]> | UserProfile[] {

    return this.matchService.getProfiles();
  }
}

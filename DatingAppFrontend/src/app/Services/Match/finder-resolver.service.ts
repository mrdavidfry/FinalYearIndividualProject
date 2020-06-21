import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {UserProfile} from '../../Models/UserProfile.model';
import {Observable} from 'rxjs';
import {MatchService} from './match.service';

@Injectable({
  providedIn: 'root'
})
export class FinderResolverService implements Resolve<UserProfile[]> {

  constructor(private matchService: MatchService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserProfile[]> | Promise<UserProfile[]> | UserProfile[] {

    return this.matchService.getProfilesForFinder();
  }
}

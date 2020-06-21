import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {MockEventService} from './mock-event.service';
import {GroupEventModel} from '../../Models/GroupEvent.model';

@Injectable({
  providedIn: 'root'
})
export class EventFinderResolverService implements Resolve<GroupEventModel[]> {

  constructor(private eventService: MockEventService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<GroupEventModel[]> | Promise<GroupEventModel[]> | GroupEventModel[] {

    return this.eventService.getEventsForFinder();
  }
}

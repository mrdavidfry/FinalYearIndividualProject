import {Injectable} from '@angular/core';
import {SwipedProfileModel} from '../../Models/SwipedProfile.model';
import {UserProfile} from '../../Models/UserProfile.model';
import {GroupEventModel} from '../../Models/GroupEvent.model';

@Injectable({
  providedIn: 'root'
})
export class MockEventService {

  private readonly events: GroupEventModel[];

  constructor() {
    const event1: GroupEventModel = new GroupEventModel({ event_id: 1, title: 'Cafe Meetup', description: 'A cafe meetup', location: 'London', date: '20/06/21',
      time: '19:30',
      imagesUrls: ['https://www.modernartoxford.org.uk/wp-content/uploads/2014/10/cafe-1-600x300.png']});

    this.events = [event1, event1, event1, event1, event1, event1, event1, event1, event1, event1, event1, event1, event1, event1, event1, event1];
  }

  getEvents(): GroupEventModel[] {
    return Array.from(this.events);
  }

  getEventsForFinder(): GroupEventModel[] {
    return this.getEvents();
  }

}

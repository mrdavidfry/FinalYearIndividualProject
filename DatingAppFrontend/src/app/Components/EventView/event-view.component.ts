import {Component, OnDestroy, OnInit} from '@angular/core';
import {MockEventService} from '../../Services/Event/mock-event.service';
import {GroupEventModel} from '../../Models/GroupEvent.model';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-events',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.css']
})
export class EventViewComponent implements OnInit, OnDestroy {

  private events: GroupEventModel[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private activatedRoute: ActivatedRoute, private eventService: MockEventService) {
    this.events = eventService.getEventsForFinder();
  }

  ngOnInit() {
    // pass data from resolver:
    this.subscriptions.push(this.activatedRoute.data.subscribe((data: any) => {
        data.events.events.forEach(e => {
          this.events.push(new GroupEventModel(e));
        });
      },
      error => console.log(error)));
    console.log(this.events);
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  viewEvent(eventId: number) {}

  reportEvent(eventId: number) {}


}

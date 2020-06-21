import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserProfile} from '../../Models/UserProfile.model';
import {SwipedProfileModel} from '../../Models/SwipedProfile.model';
import {MatchService} from '../../Services/Match/match.service';
import {MockMatchService} from '../../Services/Match/mockmatch.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-swiping-component',
  templateUrl: 'swiping.component.html',
  styleUrls: ['./swiping.component.css']
})
export class SwipingComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private profiles: UserProfile[] = [];

  constructor(private matchService: MockMatchService, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.subscriptions.push(this.activatedRoute.data.subscribe((data: any) => {
      data.profiles.forEach(p => {
        console.log(p);
        this.profiles.push(new UserProfile(p));
        console.log(this.profiles[0].firstName);
      });
    },
      error => console.log(error)));
  }

  /* Send a swipe to service and remove profile from current list. */
  swipeProfile(userId: number, swipeDirection: number) {
    const swipedProfile: SwipedProfileModel = new SwipedProfileModel(userId, swipeDirection);

    const success = this.matchService.submitSwipedProfile(swipedProfile);
    if (success) {
      this.profiles.splice(0, 1);
    } else {
      console.log('Failed to send swiping information on profile with id: ' + userId);
    }

    if (this.profiles.length <= 0) {

    }
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

}

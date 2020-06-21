import {NgModule} from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './Components/Home/home.component';
import {SwipingComponent} from './Components/Swiping/swiping.component';
import {ChatComponent} from './Components/Chat/chat.component';
import {MyProfileComponent} from './Components/MyProfile/my-profile.component';
import {SwipeSelectionComponent} from './Components/SwipeSelection/swipeselection.component';
import {LogoutComponent} from './Components/Logout/logout.component';
import {AuthenticationService} from './Services/Authentication/authentication.service';
import {SwipingResolverService} from './Services/Match/swiping-resolver.service';
import {PeopleViewComponent} from './Components/PeopleView/PeopleView.component';
import {MyProfileResolver} from './Services/Profile/my-profile-resolver.service';
import {FinderResolverService} from './Services/Match/finder-resolver.service';
import {MatchResolverService} from './Services/Match/match-resolver.service';
import {PrivacyPolicyComponent} from './privacy-policy/PrivacyPolicy.component';
import {EventViewComponent} from './Components/EventView/event-view.component';
import {EventFinderResolverService} from './Services/Event/event-finder-resolver.service';
import {SwipeComponent} from "./Components/swipe/swipe.component";


const routes: Routes = [
  { path: 'swiping', component: SwipingComponent, resolve: {profiles: SwipingResolverService}, canActivate: [AuthenticationService]},
  { path: 'chat', component: ChatComponent, resolve: {matches: MatchResolverService, myprofile: MyProfileResolver}},
  { path: 'myprofile', component: MyProfileComponent, resolve: {myprofile: MyProfileResolver}},
  { path: 'selection', component: SwipeSelectionComponent, canActivate: [AuthenticationService]},
  { path: 'logout', component: LogoutComponent, canActivate: [AuthenticationService]},
  { path: 'finder', component: PeopleViewComponent, canActivate: [AuthenticationService], resolve: {profiles: FinderResolverService}},
  { path: 'events', component: EventViewComponent, canActivate: [AuthenticationService], resolve: {events: EventFinderResolverService}},
  { path: 'swipe', component: SwipeComponent, canActivate: [AuthenticationService], resolve: {profiles: FinderResolverService}},

  { path: 'privacy-policy', component: PrivacyPolicyComponent},

  { path: '', component: HomeComponent },

  // otherwise redirect to home page:
  { path: '**', redirectTo: ''}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

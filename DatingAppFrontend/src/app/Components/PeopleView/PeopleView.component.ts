import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatchService} from '../../Services/Match/match.service';
import {UserProfile} from '../../Models/UserProfile.model';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {SwipedProfileModel} from '../../Models/SwipedProfile.model';
import {ReportUserComponent} from '../report-user/report-user.component';
import {MatDialog} from '@angular/material/dialog';
import {environment} from '../../../environments/environment';
import {ProfileViewComponent} from './profile-view/profile-view.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-people-view',
  templateUrl: './PeopleView.component.html',
  styleUrls: ['./PeopleView.component.css'],
})
export class PeopleViewComponent implements OnInit, OnDestroy {

  private S3_PROFILE_PIC_FOLDER = environment.s3ProfileImagesFolder;

  private subscriptions: Subscription[] = [];
  private profiles: UserProfile[] = [];
  private recommendationTypeForm: FormGroup = null;

  constructor(private matchService: MatchService, private activatedRoute: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit() {
    this.recommendationTypeForm = this.createRecommendationTypeForm()
    // pass data from resolver:
    this.subscriptions.push(this.activatedRoute.data.subscribe((data: any) => {
         data.profiles.profiles.forEach(p => {
           this.profiles.push(new UserProfile(p));
         });
      },
      error => console.log(error)));
  }

  connectWithProfile(profileId: number) {
    this.matchService.submitSwipedProfile(new SwipedProfileModel(profileId, 1));
  }

  viewProfile(profileId: number) {
  }

  openReportDialog(reportedUserId: number): void {
    const dialogRef = this.dialog.open(ReportUserComponent, {
      width: 'auto',
      height: 'auto',
      data: {reportedUserId}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  openUserProfileDialog(userProfile: UserProfile): void {
    let editImageWidth = '400';
    if (window.innerWidth > 1000) {
      editImageWidth = '850px';
    } else if (window.innerWidth > 600) {
      editImageWidth = '550px';
    }

    console.log(window.innerWidth)
    const dialogRef = this.dialog.open(ProfileViewComponent, {
      width: editImageWidth,
      height: 'auto',
      data: {userProfile}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The profile dialog was closed');
    });
  }

  filterRecommendations() {
    this.profiles = [];
    console.log(this.recommendationTypeForm)
    const imageSimilarity = this.recommendationTypeForm.get('imageSimilarity').value;
    const textSemanticSimilarity = this.recommendationTypeForm.get('textSemanticSimilarity').value;
    const textSentimentSimilarity = this.recommendationTypeForm.get('textSentimentSimilarity').value;

    const response = this.matchService.getProfilesForFinder(imageSimilarity, textSemanticSimilarity, textSentimentSimilarity);

    this.subscriptions.push(response.subscribe((data: any) => {
        data.profiles.forEach(p => {
          this.profiles.push(new UserProfile(p));
        });
      },
      error => console.log(error)));
  }

  createRecommendationTypeForm(): FormGroup {
    return new FormGroup({
      imageSimilarity: new FormControl(false),
      textSemanticSimilarity: new FormControl(false),
      textSentimentSimilarity: new FormControl(false)
    });
  }
}

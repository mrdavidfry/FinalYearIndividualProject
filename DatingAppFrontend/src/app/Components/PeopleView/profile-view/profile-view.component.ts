import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {UserProfile} from '../../../Models/UserProfile.model';
import {SwipedProfileModel} from '../../../Models/SwipedProfile.model';
import {ReportUserComponent} from '../../report-user/report-user.component';
import {MatchService} from '../../../Services/Match/match.service';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent implements OnInit {

  private userProfile: UserProfile;

  constructor(@Inject(MAT_DIALOG_DATA) private data, private dialogRef: MatDialogRef<ProfileViewComponent>,
              private dialog: MatDialog, private matchService: MatchService) {
    this.userProfile = data.userProfile;
  }

  ngOnInit() {}

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
}

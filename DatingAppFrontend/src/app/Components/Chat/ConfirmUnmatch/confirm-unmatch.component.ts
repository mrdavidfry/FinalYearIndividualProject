import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserProfile} from '../../../Models/UserProfile.model';
import {MatchService} from '../../../Services/Match/match.service';

@Component({
  selector: 'app-profile-component',
  templateUrl: 'confirm-unmatch.component.html',
  styleUrls: ['./confirm-unmatch.component.css']
})
export class ConfirmUnmatchComponent implements OnInit {

  private match: UserProfile;

  constructor(@Inject(MAT_DIALOG_DATA) private data: any, private dialogRef: MatDialogRef<ConfirmUnmatchComponent>, private matchService: MatchService) {
    this.match = data.match;
  }

  ngOnInit(): void {}

  unmatch(match: UserProfile) {
    this.matchService.unmatch(match.matchId).subscribe((response: any) => {},
      data => {
        if (data.status === 200) {
          console.log('Successfully unmatched user.');
        } else {
          console.log('Failed to unmatch user.');
        }
      },
    );
  }

  closeDialog() {
    this.dialogRef.close();
  }

}

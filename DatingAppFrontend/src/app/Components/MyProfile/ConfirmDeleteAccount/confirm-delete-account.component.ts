import {Component, OnInit} from '@angular/core';
import {MyProfileService} from '../../../Services/Profile/myprofile.service';
import {AuthenticationService} from '../../../Services/Authentication/authentication.service';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-profile-component',
  templateUrl: 'confirm-delete-account.component.html',
  styleUrls: ['./confirm-delete-account.component.css']
})
export class ConfirmDeleteAccountComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ConfirmDeleteAccountComponent>, private myProfileService: MyProfileService, private auth: AuthenticationService) {}

  ngOnInit(): void {

  }

  deleteMyAccount() {
    this.myProfileService.deleteMyAccount();
    this.auth.logOut();
  }

  closeDialog() {
    this.dialogRef.close();
  }

}

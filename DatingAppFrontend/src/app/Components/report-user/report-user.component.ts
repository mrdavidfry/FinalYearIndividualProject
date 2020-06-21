import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatchService} from '../../Services/Match/match.service';
import {ReportUserFormModel} from '../../Models/ReportUserForm.model';

@Component({
  selector: 'app-report-user',
  templateUrl: './report-user.component.html',
  styleUrls: ['./report-user.component.css']
})
export class ReportUserComponent implements OnInit {

  private reportForm: FormGroup = null;
  private reportTypes = ['Spam', 'Harassment', 'Inappropriate content', 'Other'];

  constructor(@Inject(MAT_DIALOG_DATA) private data: any, private dialogRef: MatDialogRef<ReportUserComponent>, private matchService: MatchService) {
    this.reportForm = this.createReportForm();
  }

  submitReport() {
    this.matchService.reportUser(new ReportUserFormModel(this.reportForm.value)).subscribe((response: any) => {},
      data => {
        if (data.status === 200) {
          console.log('Successfully reported user.');
        } else {
          console.log('Failed to report user.');
        }
      },
    );
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnInit(): void {}

  createReportForm(): FormGroup {
    return new FormGroup({
      reportedUserId: new FormControl(this.data.reportedUserId, [Validators.required]),
      reportType: new FormControl('', [Validators.required]),
      comment: new FormControl('', [Validators.maxLength(500)])
    });
  }

}

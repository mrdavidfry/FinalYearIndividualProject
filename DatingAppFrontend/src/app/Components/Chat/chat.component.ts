import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {UserProfile} from '../../Models/UserProfile.model';
import {Subscription} from 'rxjs';
import {MatchService} from '../../Services/Match/match.service';
import {ChatMessage} from '../../Models/ChatMessage.model';
import {ChatMessageSend} from '../../Models/ChatMessageSend.model';
import {MatDialog} from '@angular/material';
import {ConfirmUnmatchComponent} from './ConfirmUnmatch/confirm-unmatch.component';
import {ReportUserComponent} from '../report-user/report-user.component';
import {environment} from '../../../environments/environment';
import {WebSocketInteractService} from '../../Services/web-socket-interact.service';
import {ToastrService} from 'ngx-toastr';
import {MyProfileService} from "../../Services/Profile/myprofile.service";
import { MyProfileForm } from 'src/app/Models/MyProfileForm.model';

@Component({
  templateUrl: 'chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  private S3_PROFILE_PIC_FOLDER = environment.s3ProfileImagesFolder;

  private sendMessageForm = null;
  private subscriptions: Subscription[] = [];
  private matches: UserProfile[] = [];
  private messages: ChatMessage[] = [];
  private curMatch: UserProfile;
  private myProfile: MyProfileForm;

  constructor(private dialog: MatDialog, private activatedRoute: ActivatedRoute, private matchService: MatchService,
              private webSocketInteractService: WebSocketInteractService, private toastr: ToastrService,
              private myProfileService: MyProfileService) {

    this.webSocketInteractService.messages.subscribe(message => {
      if (this.curMatch.matchId === message.match_id) {
        message.sent_by_me = false;
        this.messages.push(new ChatMessage(message));
      } else {
        this.matches.forEach((match: UserProfile) => {
          if (match.matchId === message.match_id) {
            match.hasReadAllMessages = false;
          }
          return match;
        });
      }
    });
  }

  ngOnInit() {

    this.subscriptions.push(this.activatedRoute.data.subscribe((data: any) => {
        this.myProfile = new MyProfileForm(data.myprofile.profile);
        data.matches.matches.forEach(p => {
          this.matches.push(new UserProfile(p));
        });
      },
      error => console.log(error)));
    this.sendMessageForm = this.createSendMessageForm();
    this.curMatch = this.matches[0];
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  createSendMessageForm() {
    return new FormGroup({
      message: new FormControl('')
    });
  }

  sendMessage() {
    const message: string = this.sendMessageForm.get('message').value;
    if (!message || !this.curMatch) {
      return;
    }

    this.matchService.sendMessage(new ChatMessageSend(this.curMatch.matchId, message));

    const msgObject = {
      message,
      sent_by_me: true,
      sent_date: new Date()
    };

    this.messages.push(new ChatMessage(msgObject));
  }

  openConfirmUnmatchDialog(match: UserProfile): void {
    if (!match) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmUnmatchComponent, {
      width: 'auto',
      height: 'auto',
      data: {match}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
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

  getChat(match: UserProfile) {
    this.matchService.getChat(match.matchId).subscribe((data: any) => {
      console.log('Loading new chat...');
      this.messages = [];

      data.messages.forEach(m => {
        this.messages.push(new ChatMessage(m));
      });
      console.log(this.messages);
    });
    this.curMatch = match;
    console.log(match);
  }

}

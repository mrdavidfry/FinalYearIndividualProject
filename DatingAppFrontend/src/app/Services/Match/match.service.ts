import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {SwipedProfileModel} from '../../Models/SwipedProfile.model';
import {UserProfile} from '../../Models/UserProfile.model';
import {Observable} from 'rxjs';
import {ChatMessage} from '../../Models/ChatMessage.model';
import {ChatMessageSend} from '../../Models/ChatMessageSend.model';
import {environment} from '../../../environments/environment';
import {ReportUserFormModel} from '../../Models/ReportUserForm.model';
import {WebSocketInteractService} from '../web-socket-interact.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  private uri = environment.mainBackendUrl;

  constructor(private http: HttpClient, private webSocketInteractService: WebSocketInteractService) { }

  getProfiles(imageSimilarity: boolean = false, textSemanticSimilarity: boolean  = false, textSentimentSimilarity: boolean = false): Observable<UserProfile[]> {

    let httpParams = new HttpParams();
    httpParams = httpParams.append('imageSimilarity', String(imageSimilarity));
    httpParams = httpParams.append('textSemanticSimilarity', String(textSemanticSimilarity));
    httpParams = httpParams.append('textSentimentSimilarity', String(textSentimentSimilarity));

    return this.http.get<UserProfile[]>(this.uri + '/match/swiping',
      {
      headers: new HttpHeaders({ timeout: `${120000}` }),
      params: httpParams
    });
  }

  getMatches(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.uri + '/matches')
  }

  getChat(match_id: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(this.uri + '/chat?match_id='+ match_id)
  }

  sendMessage(message_body: ChatMessageSend) {

    this.webSocketInteractService.sendMessage(message_body);
    // return this.http.post(this.uri + '/chat', message_body).subscribe(data => {
    //   console.log(data);
    // });
  }

  getProfilesForFinder(imageSimilarity: boolean = false, textSemanticSimilarity: boolean  = false, textSentimentSimilarity: boolean = false): Observable<UserProfile[]> {

    let httpParams = new HttpParams();
    httpParams = httpParams.append('imageSimilarity', String(imageSimilarity));
    httpParams = httpParams.append('textSemanticSimilarity', String(textSemanticSimilarity));
    httpParams = httpParams.append('textSentimentSimilarity', String(textSentimentSimilarity));

    return this.http.get<UserProfile[]>(this.uri + '/profiles',
      {
        headers: new HttpHeaders({ timeout: `${120000}` }), params: httpParams
      });
  }

  reportUser(reportUserForm: ReportUserFormModel): any {
    return this.http.post(this.uri + '/report', reportUserForm);
  }

  submitSwipedProfile(swipedProfile: SwipedProfileModel) {
    this.http.post(`${this.uri}/swipe`, swipedProfile).subscribe(data => {
      console.log(data);
    });
    return true;
  }

  unmatch(matchId: number): any {
    return this.http.delete(this.uri + '/matches?match_id=' + matchId);
  }
}

import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {WebSocketsService} from './web-sockets.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebSocketInteractService {

  messages: Subject<any>;

  constructor(private webSocketService: WebSocketsService) {
    this.messages = webSocketService
      .connect()
      .pipe(map((response: any): any => {
        return response;
      })) as Subject<any>;
  }

  sendMessage(message) {
    this.messages.next(message);
  }
}

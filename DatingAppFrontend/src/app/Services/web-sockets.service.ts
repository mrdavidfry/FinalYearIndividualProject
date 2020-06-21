import { Injectable } from '@angular/core';
import {AuthenticationService} from './Authentication/authentication.service';
import * as io from 'socket.io-client';
import {environment} from '../../environments/environment';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketsService {

  private socket;

  constructor(private authService: AuthenticationService) { }

  connect(): Subject<MessageEvent> {
    this.socket = io(environment.mainBackendUrl, {
      transportOptions: {
        polling: {
          extraHeaders: {
            'x-access-token':  this.authService.getAccessToken()
          }
        }
      }
    });

    const observable = new Observable((observer) => {
      this.socket.on('message', (data) => {
        console.log('Received message from websocket server.');
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });

    const observer = {
      next: (data: Object) => {
        this.socket.emit('message', JSON.stringify(data));
        console.log('Sent message to websocket server.');
      },
    };

    return Subject.create(observer, observable);
  }

}

import { Component } from '@angular/core';
import {WebSocketInteractService} from './Services/web-socket-interact.service';
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dating-app-project';

  constructor(private webSocketInteractService: WebSocketInteractService, private toastr: ToastrService) {
    this.webSocketInteractService.messages.subscribe(message => {
      console.log(message);
      this.toastr.success('New message received!');
    });
  }
}

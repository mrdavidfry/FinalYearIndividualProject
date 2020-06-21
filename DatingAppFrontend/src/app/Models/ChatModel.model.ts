import {ChatMessage} from './ChatMessage.model';
import {UserProfile} from './UserProfile.model';

export class ChatModel {

  private users: UserProfile[];
  private messages: ChatMessage[];

  constructor() {

  }

  get chatUsers(): UserProfile[] {
    return this.users;
  }

  set chatUsers(value: UserProfile[]) {
    this.users = value;
  }

  get chatMessages(): ChatMessage[] {
    return this.messages;
  }

  set chatMessages(value: ChatMessage[]) {
    this.messages = value;
  }
}

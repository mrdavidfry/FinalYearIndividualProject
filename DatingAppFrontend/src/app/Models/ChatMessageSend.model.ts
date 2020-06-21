export class ChatMessageSend {

  private message: string;
  private match_id: number;

  constructor(match_id: number, message: string) {
    this.message = message;
    this.match_id = match_id;
  }

    get chatMessage(): string {
    return this.message;
  }

  set chatMessage(value: string) {
    this.message = value;
  }

  get matchId() {
    return this.match_id;
  }

  set matchId(match_id: number) {
    this.match_id = match_id;
  }
}

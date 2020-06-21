export class ChatMessage {

  private message: string;
  private sent_date: Date;
  private sent_by_me: boolean;

  constructor(message: any) {
    this.message = message.message;
    this.sent_date = message.sent_date;
    this.sent_by_me = message.sent_by_me;
  }

    get chatMessage(): string {
    return this.message;
  }

  set chatMessage(value: string) {
    this.message = value;
  }

  get sentDate(): Date {
    return this.sent_date;
  }

  set sentDate(value: Date) {
    this.sent_date = value;
  }

  get sentByMe(): boolean {
    return this.sent_by_me;
  }

  set sentByMe(value: boolean) {
    this.sent_by_me = value;
  }
}

export class RegisterUserResponse {

  private request_id: string;

  constructor(object: any) {
    if (object) {
      this.request_id = object.request_id;
    }
  }

  get requestId(): string {
    return this.request_id;
  }

  set requestId(value: string) {
    this.request_id = value;
  }
}

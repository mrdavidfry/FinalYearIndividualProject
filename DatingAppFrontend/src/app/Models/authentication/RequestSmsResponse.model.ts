export class RequestSmsResponse {

  private verify_id: string;

  constructor(response: any) {
    this.verify_id = response.verify_id;
  }


  get verifyId(): string {
    return this.verify_id;
  }

  set verifyId(verify_id: string) {
    this.verify_id = verify_id;
  }

}

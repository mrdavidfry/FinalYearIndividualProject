export class VerifySmsResponse {

  private access_token: string;
  private access_token_expires: string;

  constructor(response: any) {
    this.access_token = response.access_token;
    this.access_token_expires = response.access_token_expires;
  }

  get accessToken(): string {
    return this.access_token;
  }

  set accessToken(access_token: string) {
    this.access_token = access_token;
  }

  get accessTokenExpires(): string {
    return this.access_token_expires;
  }

  set accessTokenExpires(access_token_expires: string) {
    this.access_token_expires = access_token_expires;
  }

}

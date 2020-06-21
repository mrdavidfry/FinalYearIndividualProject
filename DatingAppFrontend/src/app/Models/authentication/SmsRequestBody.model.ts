export class SmsRequestBody {

  private country_calling_code: string;
  private phone_number: string;

  constructor(body: any) {
    this.country_calling_code = body.countryCallingCode;
    this.phone_number = body.countryCallingCode + body.phoneNumber;
  }


  get requestCountryCallingCode(): string {
    return this.country_calling_code;
  }

  set requestCountryCallingCode(value: string) {
    this.country_calling_code = value;
  }

  get requestPhoneNumber(): string {
    return this.phone_number;
  }

  set requestPhoneNumber(value: string) {
    this.phone_number = value;
  }
}

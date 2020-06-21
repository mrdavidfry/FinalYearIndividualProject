export class MyProfileForm {

  private user_id: string;
  private first_name: string;
  private last_name: string;
  private description: string;
  private gender: number;
  private date_of_birth: string;
  private country_calling_code: string;
  private phone_number: string;
  private email: string;
  imagesUrls: []

  constructor(userForm: any) {
    this.imagesUrls = [];
    if (userForm) {
      this.user_id = userForm.user_id;
      this.first_name = userForm.first_name;
      this.last_name = userForm.last_name;
      this.description = userForm.description;
      this.gender = userForm.gender;
      this.date_of_birth = userForm.date_of_birth;
      this.country_calling_code = userForm.country_calling_code;
      this.phone_number = userForm.regional_phone_number;
      this.email = userForm.email;

      if (userForm.images) {
        this.imagesUrls = userForm.images;
      }
    }
  }

  get userId(): string {
    return this.user_id;
  }

  get firstName(): string {
    return this.first_name;
  }

  set firstName(value: string) {
    this.first_name = value;
  }

  get lastName(): string {
    return this.last_name;
  }

  set lastName(value: string) {
    this.last_name = value;
  }

  get userDescription(): string {
    return this.description;
  }

  set userDescription(description: string) {
    this.description = description;
  }

  get userGender(): number {
    return this.gender;
  }

  set userGender(value: number) {
    this.gender = value;
  }

  get dateOfBirth(): string {
    return this.date_of_birth;
  }

  set dateOfBirth(value: string) {
    this.date_of_birth = value;
  }

  get countryCallingCode(): string {
    return this.country_calling_code;
  }

  set countryCallingCode(value: string) {
    this.country_calling_code = value;
  }

  get phoneNumber(): string {
    return this.phone_number;
  }

  set phoneNumber(value: string) {
    this.phone_number = value;
  }

  get userEmail(): string {
    return this.email;
  }

  set userEmail(value: string) {
    this.email = value;
  }

  get imageUrls() {
    return this.imagesUrls;
  }
}

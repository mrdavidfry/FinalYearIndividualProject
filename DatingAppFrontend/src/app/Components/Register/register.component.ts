import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MyProfileForm} from '../../Models/MyProfileForm.model';
import {AuthenticationService} from '../../Services/Authentication/authentication.service';
import {MatDialogRef} from '@angular/material';
import {RegisterUserResponse} from '../../Models/RegisterUserResponse.model';

@Component({
  selector: 'app-register-component',
  templateUrl: 'register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  private registerResponse: RegisterUserResponse = null;

  private registerForm: FormGroup = new FormGroup({
    first_name: new FormControl('',
      [Validators.required, Validators.maxLength(25)]),
    last_name: new FormControl('',
      [Validators.required, Validators.maxLength(25)]),
    gender: new FormControl('', Validators.required),
    date_of_birth: new FormControl('', Validators.required),
    country_calling_code: new FormControl(''),
    regional_phone_number: new FormControl(''),
    email: new FormControl('',
    [Validators.maxLength(40)])
  });

  private authenticateForm: FormGroup = new FormGroup({
    verificationCode: new FormControl('',
      [Validators.required, Validators.minLength(1), Validators.maxLength(6)])
  });

  private phoneCountryCodes: string[] = null;

  constructor(private dialogRef: MatDialogRef<RegisterComponent>, private authService: AuthenticationService) {}

  OnSubmit() {
    this.authService.registerUser(new MyProfileForm(this.registerForm.value));
  }

  ngOnInit(): void {
    this.phoneCountryCodes = this.authService.phoneCountryCodes();
  }

  submitVerifyForm() {
    this.authService.verifyUser(this.authenticateForm.get('verificationCode').value);
  }
}

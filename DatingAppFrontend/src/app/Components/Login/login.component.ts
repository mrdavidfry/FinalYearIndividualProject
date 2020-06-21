import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../Services/Authentication/authentication.service';
import {MatDialogRef} from '@angular/material';
import {SmsRequestBody} from '../../Models/authentication/SmsRequestBody.model';

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private phoneCountryCodes: string[] = null;

  private loginForm: FormGroup = null;
  private authenticateForm: FormGroup = null;

  constructor(private dialogRef: MatDialogRef<LoginComponent>, private authService: AuthenticationService) {
    this.loginForm = this.createLoginForm();
    this.authenticateForm = this.createAuthenticateForm();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submitLoginRequest() {
    if (this.loginForm.valid) {
      return this.authService.requestSmsCode(new SmsRequestBody(this.loginForm.value));
    } else {
      console.log('Invalid form!');
    }
  }

  submitVerifyCode() {
    return this.authService.verifyUser(this.authenticateForm.get('verifyCode').value);
  }

  ngOnInit(): void {
    this.phoneCountryCodes = this.authService.phoneCountryCodes();
  }

  createLoginForm(): FormGroup {
    return new FormGroup({
      countryCallingCode: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required])
    });
  }

  createAuthenticateForm(): FormGroup {
    return new FormGroup({
      verifyCode: new FormControl('',
        [Validators.required, Validators.minLength(0), Validators.maxLength(6)]),
    });
  }
}

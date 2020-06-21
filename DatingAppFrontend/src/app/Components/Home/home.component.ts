import { Component } from '@angular/core';
import {LoginComponent} from '../Login/login.component';
import {MatDialog} from '@angular/material';
import {RegisterComponent} from '../Register/register.component';
import {AuthenticationService} from '../../Services/Authentication/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.css'
  ]})
export class HomeComponent {

  constructor(private dialog: MatDialog, private authService: AuthenticationService) {}

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: 'auto',
      height: 'auto'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openRegisterDialog(): void {
    const dialogRef = this.dialog.open(RegisterComponent, {
      width: 'auto',
      height: 'auto'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}

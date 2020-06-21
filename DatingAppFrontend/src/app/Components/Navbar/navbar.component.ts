import { Component } from '@angular/core';
import {AuthenticationService} from '../../Services/Authentication/authentication.service';
import {MatDialog} from '@angular/material';
import {LoginComponent} from '../Login/login.component';

@Component({
  selector: 'app-navbar-component',
  templateUrl: 'navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(public dialog: MatDialog, private authService: AuthenticationService) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '30%',
      height: '70%'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

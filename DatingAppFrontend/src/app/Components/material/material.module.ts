import { NgModule } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from '../../app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatSidenavModule} from '@angular/material';

const MaterialComponents = [
  MatButtonModule,
  MatSidenavModule
]

@NgModule({
  imports: [
    MaterialComponents
  ],
  exports: [MaterialComponents]
})
export class MaterialModule { }

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {SwipingComponent} from './Components/Swiping/swiping.component';
import {LoginComponent} from './Components/Login/login.component';
import {RegisterComponent} from './Components/Register/register.component';
import {HomeComponent} from './Components/Home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule, MatCheckboxModule, MatDatepickerModule, MatDialogModule, MatDialogRef, MatGridListModule,
  MatIconModule, MatInputModule, MatNativeDateModule,
  MatRadioModule, MatSelectModule,
  MatSidenavModule, MatStepperModule,
  MatToolbarModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChatComponent} from './Components/Chat/chat.component';
import {NavbarComponent} from './Components/Navbar/navbar.component';
import {MyProfileComponent} from './Components/MyProfile/my-profile.component';
import {MatchService} from './Services/Match/match.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {SwipeSelectionComponent} from './Components/SwipeSelection/swipeselection.component';
import {LogoutComponent} from './Components/Logout/logout.component';
import {AuthenticationInterceptor} from './Interceptors/authentication.interceptor';
import {AuthenticationService} from './Services/Authentication/authentication.service';
import { PeopleViewComponent } from './Components/PeopleView/PeopleView.component';
import {ConfirmDeleteAccountComponent} from './Components/MyProfile/ConfirmDeleteAccount/confirm-delete-account.component';
import {ConfirmUnmatchComponent} from './Components/Chat/ConfirmUnmatch/confirm-unmatch.component';
import { PrivacyPolicyComponent } from './privacy-policy/PrivacyPolicy.component';
import {ImageCropperModule} from 'ngx-image-cropper';
import { ImageCropComponent } from './Components/MyProfile/image-crop/image-crop.component';
import { EventViewComponent } from './Components/EventView/event-view.component';
import { ReportUserComponent } from './Components/report-user/report-user.component';
import { ToastrModule } from 'ngx-toastr';
import { WebSocketsService } from './Services/web-sockets.service';
import { WebSocketInteractService } from './Services/web-socket-interact.service';
import {MatBadgeModule} from '@angular/material/badge';
import { SwipeComponent } from './Components/swipe/swipe.component';
import { ProfileViewComponent } from './Components/PeopleView/profile-view/profile-view.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    SwipingComponent,
    ChatComponent,
    NavbarComponent,
    MyProfileComponent,
    SwipeSelectionComponent,
    LogoutComponent,
    PeopleViewComponent,
    ConfirmDeleteAccountComponent,
    ConfirmUnmatchComponent,
    PrivacyPolicyComponent,
    ImageCropComponent,
    EventViewComponent,
    ReportUserComponent,
    SwipeComponent,
    ProfileViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    FormsModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatCardModule,
    MatGridListModule,
    HttpClientModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    ImageCropperModule,
    ToastrModule.forRoot(),
    MatBadgeModule,
  ],
  providers: [MatchService,
    AuthenticationService,
    AuthenticationInterceptor,
    WebSocketsService,
    WebSocketInteractService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true
    },
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: [] }
  ],
  bootstrap: [AppComponent],
  entryComponents: [LoginComponent, RegisterComponent, ConfirmDeleteAccountComponent, ConfirmUnmatchComponent, ImageCropComponent, ReportUserComponent, ProfileViewComponent]
})
export class AppModule { }

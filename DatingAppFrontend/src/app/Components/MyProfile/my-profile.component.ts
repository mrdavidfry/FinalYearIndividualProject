import {Component, OnDestroy, OnInit} from '@angular/core';
import {MyProfileService} from '../../Services/Profile/myprofile.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MyProfileForm} from '../../Models/MyProfileForm.model';
import {ConfirmDeleteAccountComponent} from './ConfirmDeleteAccount/confirm-delete-account.component';
import {MatDialog} from '@angular/material';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {ImageCropComponent} from './image-crop/image-crop.component';
import {environment} from '../../../environments/environment';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-profile-component',
  templateUrl: 'my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
  providers: [MyProfileService]
})
export class MyProfileComponent implements OnInit, OnDestroy {

  private S3_PROFILE_PIC_FOLDER = environment.s3ProfileImagesFolder;

  private subscriptions: Subscription[] = [];
  private imageUrl = '/assets/Images/blankprofileimage.png';
  private myProfile: MyProfileForm;
  private profileForm: FormGroup;
  private profileImage: any = '';

  private lengthSixArray = [0, 1, 2, 3, 4, 5];

  constructor(private myProfileService: MyProfileService, private dialog: MatDialog, private activatedRoute: ActivatedRoute,
              private toastr: ToastrService) {}

  ngOnInit(): void {
    this.subscriptions.push(this.activatedRoute.data.subscribe((data: any) => {
        this.myProfile = new MyProfileForm(data.myprofile.profile);
      },
      error => console.log(error)));
    this.profileForm = this.createProfileForm();
  }

  onImageSelected(event, imageNum: number) {
    console.log(imageNum);
    this.openCropImageDialog(event, imageNum);
  }

  OnSubmit() {
    this.submitProfileInfo();
  }

  submitProfileInfo() {
    this.myProfileService.updateProfileInfo(new MyProfileForm(this.profileForm.value)).subscribe((response: any) => {console.log(response); },
      data => {
        console.log('data:');
        console.log(data);
        if (data.status === 200) {
          this.toastr.success('Your profile info has been updated.', 'Success', {
            timeOut: 3000
          });
        } else {
          this.toastr.error('Failed to update your profile info.', 'Error', {
            timeOut: 3000
          });
        }
      },
    );
  }

  createProfileForm(): FormGroup {
    return new FormGroup({
      first_name: new FormControl(this.myProfile.firstName,
        [Validators.required, Validators.maxLength(25)]),
      last_name: new FormControl(this.myProfile.lastName,
        [Validators.required, Validators.maxLength(25)]),
      description: new FormControl(this.myProfile.userDescription,
        [Validators.required, Validators.maxLength(25)]),
      gender: new FormControl(this.myProfile.userGender, Validators.required),
      date_of_birth: new FormControl(new Date(this.myProfile.dateOfBirth), Validators.required),
      country_calling_code: new FormControl(this.myProfile.countryCallingCode),
      regional_phone_number: new FormControl(this.myProfile.phoneNumber),
      email: new FormControl(this.myProfile.userEmail,
        [Validators.maxLength(40)]),
    });
  }

  openDeleteAccountDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDeleteAccountComponent, {
      width: 'auto',
      height: 'auto'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The delete account dialog was closed');
    });
  }

  openCropImageDialog(imageChangeEvent: any, imageNum: number): void {
    let editImageWidth = '400';
    if (window.innerWidth > 1000) {
      editImageWidth = '800px';
      console.log('1')
    } else if (window.innerWidth > 600) {
      editImageWidth = '550px';
      console.log('2')
    }

    console.log(window.innerWidth)
    const dialogRef = this.dialog.open(ImageCropComponent, {
      width: editImageWidth,
      height: 'auto',
      data: {imageChangeEvent}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The crop dialog was closed');
      if (result) {
        console.log('Image cropped, sending to backend...');

        this.myProfileService.postImage(result, imageNum).subscribe((response: any) => {},
          data => {
            if (data.status === 200) {
              this.toastr.success('Image has been uploaded.', 'Success', {
                timeOut: 3000
              });
            } else if (data.status === 422) {
              this.toastr.error('Your image was not appropriate.', 'Inappropriate Image', {
                timeOut: 3000
              });
            } else {
              this.toastr.error('Image failed to upload.', 'Error', {
                timeOut: 3000
              });
            }
          },
        );

      } else {
        console.log('Image upload cancelled');
      }
    });
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

}

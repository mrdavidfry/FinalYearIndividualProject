import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MyProfileForm} from '../../Models/MyProfileForm.model';
import {Observable} from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MyProfileService {

  private uri = environment.mainBackendUrl;

  constructor(private http: HttpClient) { }

  private profile: MyProfileForm;

  getProfile(): Observable<MyProfileForm> {
    return this.http.get<MyProfileForm>(`${this.uri}/user`);
  }

  updateProfileInfo(user: MyProfileForm) {
    return this.http.post( `${this.uri}/user/update-profile-info`, user);
  }

  postImage(imageToUpload: File, imageNum: number) {
    return this.http.post(`${this.uri}/user/update-profile-pic`, {'image': imageToUpload, 'image_num': imageNum});
  }

  deleteMyAccount() {
    return this.http.delete(`${this.uri}/user/delete`);
  }
}

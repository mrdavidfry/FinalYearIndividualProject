import {Injectable} from '@angular/core';
import {SwipedProfileModel} from '../../Models/SwipedProfile.model';
import {UserProfile} from '../../Models/UserProfile.model';

@Injectable({
  providedIn: 'root'
})
export class MockMatchService {

  private readonly profiles: UserProfile[];

  constructor() {
    const user1: UserProfile = new UserProfile({ userid: 1, first_name: 'Sam', last_name: 'Smith', age: 20, description: 'I am a dog... bla bla',
      images: ['https://i.etsystatic.com/6320204/r/il/73ad73/804459536/il_794xN.804459536_hkno.jpg',
        'https://i.imgur.com/cDqspyH.png',
        'https://www.karltayloreducation.com/wp-content/uploads/2019/02/live-replay-liquid-splash.jpg']});
    const user2: UserProfile = new UserProfile({userid: 2, first_name: 'Katie', last_name: 'Smith', age: 22, description: 'I am the best dog... bla bla',
      images: ['https://www.guidedogs.org/wp-content/uploads/2019/08/website-donate-mobile.jpg', '', '']});
    const user3: UserProfile = new UserProfile({userid: 3, first_name: 'Sammy', last_name: 'Sammuals', age: 21, description: 'I am the coolest dog... bla bla',
      images: ['https://www.thekennelclub.org.uk/media/1159917/puppy-picture.jpg', '', '']});
    const user4: UserProfile = new UserProfile({userid: 4, name: 'Dog4', age: 24, description: 'I am a vegan dog... bla bla',
      images: ['https://www.highlandcanine.com/wp-content/uploads/2018/11/expert-dog-training.jpg', '', '']});
    const user5: UserProfile = new UserProfile({userid: 5, first_name: 'Rebecca', last_name: 'Thompson', age: 30, description: 'I am a smart dog... bla bla',
      images: ['https://www.dogfoodadvisor.com/wp-content/uploads/2019/02/Collie-Example-of-Large-Breed-Dog.jpg', '', '']});

    this.profiles = [user1, user2, user3, user4, user5, user1, user2, user3, user4, user5, user1, user2, user3, user4, user5];
  }

  getProfiles(): UserProfile[] {
    return Array.from(this.profiles);
  }

  getProfilesForFinder(): UserProfile[] {
    return this.getProfiles();
  }

  submitSwipedProfile(swipedProfile: SwipedProfileModel) {
    console.log(swipedProfile);
    return true;
  }

}

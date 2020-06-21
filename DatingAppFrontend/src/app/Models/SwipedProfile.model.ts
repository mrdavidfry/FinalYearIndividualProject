export class SwipedProfileModel {

  private receiver_public_user_id: number;
  private interaction_level: number;

  constructor(receiver_public_user_id: number, interaction_level: number) {
    this.receiver_public_user_id = receiver_public_user_id;
    this.interaction_level = interaction_level;
  }
}

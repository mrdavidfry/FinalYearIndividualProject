export class UserProfile {

  private user_id: number;
  private first_name: string;
  private last_name: string;
  private gender: number
  private age: number;
  private description: string;
  private imagesUrls: string[];
  private match_id: number;
  public hasReadAllMessages = true;
  private image_labels: string[];
  private image_similarity: number;
  private sentiment_similarity: number;
  private text_semantic_similarity: number;

  constructor(profile: any) {
    this.imagesUrls = [];
    if (profile) {
      this.user_id = profile.user_id;
      this.first_name = profile.first_name;
      this.last_name = profile.last_name;
      this.description = profile.description;
      this.match_id = profile.match_id;
      this.image_labels = profile.image_labels;
      this.image_similarity = profile.image_similarity;
      this.sentiment_similarity = profile.sentiment_similarity
      this.text_semantic_similarity = profile.text_semantic_similarity;

      if (profile.images) {
        this.imagesUrls = profile.images;
      }
    }
  }

  get userId(): number {
    return this.user_id;
  }

  set userId(value: number) {
    this.user_id = value;
  }

  get firstName(): string {
    return this.first_name;
  }

  set firstName(value: string) {
    this.first_name = value;
  }

  get lastName(): string {
    return this.last_name;
  }

  set lastName(value: string) {
    this.last_name = value;
  }

  get userGender(): number {
    return this.gender;
  }

  set userGender(value: number) {
    this.gender = value;
  }

  get userAge(): number {
    return this.age;
  }

  set userAge(value: number) {
    this.age = value;
  }

  get userDescription(): string {
    return this.description;
  }

  set userDescription(value: string) {
    this.description = value;
  }

  get matchId() {
    return this.match_id;
  }

  get userImages() {
    return this.imagesUrls;
  }

  get imageLabels() {
    return this.image_labels;
  }

  get imageSimilarity() {
    return this.image_similarity;
  }

  get sentimentSimilarity() {
    return this.sentiment_similarity;
  }

  get textSemanticSimilarity() {
    return this.text_semantic_similarity;
  }
}

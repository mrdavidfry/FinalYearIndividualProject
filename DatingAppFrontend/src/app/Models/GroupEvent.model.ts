export class GroupEventModel {

  private _event_id: number;
  private _title: string;
  private _description: string;
  private _location: string;
  private _date: string;
  private _time: string;
  private _imagesUrls: string[];

  constructor(event: any) {
    if (event) {
      this._event_id = event.event_id;
      this._title = event._title;
      this._description = event.description;
      this._location = event.location;
      this._date = event.date;
      this._time = event.time;
      this._imagesUrls = event.imagesUrls;
    }
  }

  get event_id(): number {
    return this._event_id;
  }

  set event_id(value: number) {
    this._event_id = value;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get location(): string {
    return this._location;
  }

  set location(value: string) {
    this._location = value;
  }

  get date(): string {
    return this._date;
  }

  set date(value: string) {
    this._date = value;
  }

  get time(): string {
    return this._time;
  }

  set time(value: string) {
    this._time = value;
  }

  get imagesUrls(): string[] {
    return this._imagesUrls;
  }

  set imagesUrls(value: string[]) {
    this._imagesUrls = value;
  }
}

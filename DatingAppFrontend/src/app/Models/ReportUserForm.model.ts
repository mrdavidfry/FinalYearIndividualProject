export class ReportUserFormModel {

  private reported_user_id: number;
  private comment: string;
  private report_type: string;

  constructor(object: any) {
    if (object) {
      this.reported_user_id = object.reportedUserId;
      this.comment = object.comment;
      this.report_type = object.reportType;
    }
  }

}

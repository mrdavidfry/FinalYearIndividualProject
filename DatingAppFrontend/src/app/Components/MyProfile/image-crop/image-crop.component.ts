import {Component, Inject, OnInit} from '@angular/core';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrls: ['./image-crop.component.css']
})
export class ImageCropComponent implements OnInit {
  title = 'angular-image-uploader';

  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(private dialogRef: MatDialogRef<ImageCropComponent>, @Inject(MAT_DIALOG_DATA) private data: any) {
    this.fileChangeEvent(this.data.imageChangeEvent);
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  ngOnInit(): void {
  }

  closeDialog(image: any) {
    this.dialogRef.close(image);
  }
}

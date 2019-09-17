import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import domToImage from 'dom-to-image';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  public watermarkOptions = {
    text: '仅供 xxx 验证使用',
    fontSize: 12,
    width: 50,
    color: '#000000',
    alpha: 35,
    rotate: 35,
  };

  public fileUploadOptions = {
    multiple: false,
    accept: 'image/*',
  };

  public file: File;
  public previewUrl: SafeResourceUrl;

  constructor(public domSanitizer: DomSanitizer) {}

  @ViewChild('fileUpload', { static: false }) fileInputRef: ElementRef<HTMLInputElement>;
  @ViewChild('preview', { static: false }) previewRef: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    fromEvent(this.fileInputRef.nativeElement, 'change')
      .pipe(
        untilDestroyed(this),
        map((e) => {
          return e.target as HTMLInputElement;
        }),
        tap((ele) => {
          if (!ele.files || !ele.files.length || !ele.files[0]) {
            return;
          }

          this.file = ele.files[0];
          this.previewUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(this.file)
          );
        })
      )
      .subscribe(() => {});
  }

  uploadFile() {
    this.fileInputRef.nativeElement.click();
  }

  paint() {
    // 文字长度
    const wordWidth = this.watermarkOptions.fontSize * this.watermarkOptions.text.split('').length;
    const angle =
      (this.watermarkOptions.rotate > 90 && this.watermarkOptions.rotate < 180) ||
      this.watermarkOptions.rotate > 270
        ? this.watermarkOptions.rotate % 90
        : 90 - (this.watermarkOptions.rotate % 90);
    // 倾斜之后的长度
    const rotateWidth = Math.sin((angle * Math.PI) / 180.0) * wordWidth;
    // 加上间隔之后的长度
    const width = rotateWidth + this.watermarkOptions.width;

    let svgText = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${width}px">
    <text x="50%" y="50%"
        alignment-baseline="middle"
        text-anchor="middle"
        stroke="${this.watermarkOptions.color}"
        opacity="${this.watermarkOptions.alpha / 100}"
        transform="translate(${width / 2}, ${width / 2}) rotate(${
      this.watermarkOptions.rotate
    }) translate(-${width / 2}, -${width / 2})"
        font-weight="100"
        font-size="${this.watermarkOptions.fontSize}"
        font-family="microsoft yahe"
        >
        ${this.watermarkOptions.text}
    </text>
   </svg>`;

    return `url(data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))})`;
  }

  async download() {
    const url = await domToImage.toPng(this.previewRef.nativeElement);

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  }

  ngOnDestroy(): void {}
}

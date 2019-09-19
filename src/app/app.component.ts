import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import domToImage from 'dom-to-image';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { from, fromEvent, of, timer, zip } from 'rxjs';
import { finalize, map, switchMap, tap, timeout } from 'rxjs/operators';

import { DialogService } from './dialog/dialog.service';
import { UiService } from './overlay/ui.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnDestroy, OnInit {
  public watermarkOptions = {
    text: '仅供 xxx 验证使用',
    fontSize: 10,
    width: 5,
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

  constructor(
    public domSanitizer: DomSanitizer,
    private dialogService: DialogService,
    private uiService: UiService,
    private matSnackBar: MatSnackBar
  ) {}

  @ViewChild('fileUpload', { static: false }) fileInputRef: ElementRef<HTMLInputElement>;
  @ViewChild('preview', { static: false }) previewRef: ElementRef<HTMLDivElement>;

  ngOnInit(): void {}

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
    const width = wordWidth + this.watermarkOptions.width;

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
    of(null)
      .pipe(
        tap(() => {
          this.uiService.spin$.next(true);
        }),
        switchMap(() => {
          return zip(from(domToImage.toPng(this.previewRef.nativeElement)), timer(1000));
        }),
        tap(([url]) => {
          const a = document.createElement('a');
          a.href = url;
          a.download = name;
          a.click();
        }),
        untilDestroyed(this),
        timeout(5000),
        finalize(() => {
          this.uiService.spin$.next(false);
        })
      )
      .subscribe({
        next: () => {
          this.matSnackBar.open('下载成功', '确定', { duration: 2000 });
        },
        error: (e) => {
          this.dialogService.openMessage({ title: '下载失败', content: e.message });
          console.warn(e);
        },
      });
  }

  ngOnDestroy(): void {}
}

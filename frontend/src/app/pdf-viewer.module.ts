import { NgModule } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@NgModule({
  imports: [
    NgxExtendedPdfViewerModule
  ],
  exports: [
    NgxExtendedPdfViewerModule
  ]
})
export class PdfViewerModule { } 
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { InterceptorService } from '../admin/shared/interceptor.service';
@Component({
  selector: 'app-spinner',
  standalone: false,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css'
})
export class SpinnerComponent implements OnInit {
 showOverlay = false;
constructor(public spinner: InterceptorService, private cdr: ChangeDetectorRef) { }
ngOnInit() {
    this.spinner.loading$.subscribe((loading) => {
        this.showOverlay = loading;
        this.cdr.detectChanges();
      });
}
}

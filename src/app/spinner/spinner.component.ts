import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for *ngIf
import { InterceptorService } from '../admin/shared/interceptor.service';
@Component({
  selector: 'app-spinner',
  standalone: false,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css'
})
export class SpinnerComponent {
  public showOverlay = false;
  private minDisplayTime = 1000;
constructor(public spinner: InterceptorService) {
  let timer: any = null;
    let startTime: number;

    spinner.loading$.subscribe((loading) => {
      if (loading) {
        this.showOverlay = true;
        startTime = Date.now();
      } else {
        const elapsed = Date.now() - startTime;
        const remaining = this.minDisplayTime - elapsed;

        if (remaining > 0) {
          clearTimeout(timer);
          timer = setTimeout(() => {
            this.showOverlay = false;
          }, remaining);
        } else {
          this.showOverlay = false;
        }
      }
    });
  }
}

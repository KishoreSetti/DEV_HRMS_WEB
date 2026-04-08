import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class InterceptorService {
private totalRequests = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  show() {
    this.totalRequests++;
    this.loadingSubject.next(true);
  }

  hide() {
    this.totalRequests--;
    if (this.totalRequests <= 0) {
      this.totalRequests = 0;
      this.loadingSubject.next(false);
    }
  }
  forceStop() {
    this.totalRequests = 0;
    this.loadingSubject.next(false);
  }
}

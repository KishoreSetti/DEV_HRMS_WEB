import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { InterceptorService } from './interceptor.service';


@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

  constructor(private spinner: InterceptorService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinner.show();

    return next.handle(req).pipe(
      //delay(50),
      finalize(() => this.spinner.hide())
    );
  }
}
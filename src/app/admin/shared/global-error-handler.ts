import { ApplicationRef, ErrorHandler, Injectable, Injector } from '@angular/core';
import { InterceptorService } from './interceptor.service';
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor(private injector: Injector) { }
    handleError(error: any): void {
        const spinner = this.injector.get(InterceptorService);
        const appRef = this.injector.get(ApplicationRef);
    console.error('Global Error:', error);

    spinner.forceStop();
    appRef.tick();
  }
}

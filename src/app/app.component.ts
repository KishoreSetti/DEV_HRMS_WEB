import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart,NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
 private inactivityTimer: any;
  private warningTimer: any;

  private readonly INACTIVITY_TIME = 20 * 60 * 1000; // 5 minutes
  private readonly WARNING_TIME = 30 * 1000; // 30 seconds

  constructor(private router: Router) {
     this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkSession();
      });
  }
 checkSession() {
  const user = sessionStorage.getItem('UserId');

  const publicRoutes = ['/login', '/Welcomedemo','/jobapply'];

  if (!user && !publicRoutes.includes(this.router.url)) {
    this.logout();
  }
}


  ngOnInit() {

    // Start timer whenever route changes (after login)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        if (sessionStorage.getItem('UserId')) {
          this.resetTimer();
        }
      });
  }

  // Detect user activity globally
  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:click')
  resetTimer() {

    if (!sessionStorage.getItem('UserId')) return;

    this.clearTimers();

    this.inactivityTimer = setTimeout(() => {
      this.showWarningPopup();
    }, this.INACTIVITY_TIME);
  }

showWarningPopup() {

  Swal.fire({
    title: 'Session Timeout Warning',
    text: 'No action done for last 20 minutes. You will be logged out in 30 seconds.',
    icon: 'warning',
    timer: this.WARNING_TIME,
    timerProgressBar: true,
    showCancelButton: true,
    confirmButtonText: 'Logout',
    cancelButtonText: 'Stay Logged In',
    allowOutsideClick: false,
    allowEscapeKey: false
  }).then((result) => {

    if (result.isConfirmed) {
      // User clicked Logout
      this.logout();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // User clicked Stay Logged In
      this.resetTimer();
    }
  });

  // Auto logout after 30 seconds if no button clicked
  this.warningTimer = setTimeout(() => {
    this.logout();
  }, this.WARNING_TIME);
}

  logout() {
    this.clearTimers();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }

  clearTimers() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }
  }

  ngOnDestroy() {
    this.clearTimers();
  }
}

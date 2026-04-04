import { Component,HostListener, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { timeEnd } from 'node:console';
import { EmployeeResignationService } from '../employee-profile/employee-services/employee-resignation.service';
import { AdminService } from '../../admin/servies/admin.service';
import { environment } from '../../../environments/environment';
interface LocationMap {
  [key: string]: string[];
}
@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent {
 role: string = '';
 roleName:any='';
 userName:any='';
 superadmin:any;

 isClockedIn = false;

clockStatus = 'Not Clocked In';
clockInDisplay = '--:--:--';
totalHoursDisplay = '00:00:00';
employeeCode = sessionStorage.getItem('EmployeeCode');
companyId = sessionStorage.getItem('CompanyId') as unknown as number;
regionId = sessionStorage.getItem('RegionId') as unknown as number;
private clockInTime!: Date;
private timerRef: any;
profilePicture: string = '';
//profilePicture: string = 'assets/images/default-profile.png';
userId: number = Number(sessionStorage.getItem('UserId'));
 constructor(private router: Router, private employeeResignationService: EmployeeResignationService, private adminService: AdminService, private ngZone: NgZone) {}
  ngOnInit() {
    this.loadProfilePicture();
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.role = currentUser.role;
    sessionStorage.setItem('role', this.role);
    this.roleName= sessionStorage.getItem('roleName');
    if(this.roleName==='Super Admin'){
      this.superadmin=true;
    }
    this.userName= sessionStorage.getItem('Name');
    const savedClockIn = sessionStorage.getItem('clockInTime');

  if (savedClockIn) {
    this.clockInTime = new Date(savedClockIn);
    this.isClockedIn = true;
    this.clockStatus = 'Clocked In';
    this.clockInDisplay = this.formatTime(this.clockInTime);
    this.startTimer();
  }
    this.loadAttendance();
  }
  loadProfilePicture() {
  this.employeeResignationService.getProfilePicture(this.userId)
    .subscribe({
      next: (res: string) => {
        if (res && res.trim() !== '') {
          //const cleanedPath = res.replace(/\\/g, '/').replace(/^Uploads\//, '').trim();
          this.profilePicture = `${environment.baseurl}/${res.replace(/\\/g, '/')}`;
        } else {
          this.profilePicture = 'assets/images/default-profile.png';
        }
      },
      error: () => {
        this.profilePicture = 'assets/images/default-profile.png';
      }
    });
      this.loadMenus();

    this.messages.push({
      type: 'bot',
      text: 'Hi 👋 Ask me anything like "leave", "attendance", "profile"'
    });
     this.scrollToBottom();
}
 loadMenus() {
    this.adminService.getMenus().subscribe(res => {
      this.menus = res;
    });
  }
   logout() {
    // Optional: clear localStorage/sessionStorage or token
    localStorage.clear();
    this.router.navigate(['/login']); // Navigate to admin login
  }
  isProfileOpen = false;

toggleProfileMenu(event: Event): void {
  event.stopPropagation();
  this.isProfileOpen = !this.isProfileOpen;
}

closeProfileMenu(): void {
  this.isProfileOpen = false;
}
isLocationOpen = false;
selectedRegion = 'Select Location';

locations: LocationMap = {
  INDIA: [
    'Andhra Pradesh',
    'Telangana',
    'Tamil Nadu',
    'Karnataka',
    'Maharashtra',
    'Kerala'
  ],
  US: [
    'California',
    'Texas',
    'New York',
    'Florida',
    'Washington'
  ],
  CANADA: [
    'Ontario',
    'Quebec',
    'British Columbia',
    'Alberta'
  ],
  AUSTRALIA: [
    'New South Wales',
    'Victoria',
    'Queensland'
  ],
  DUBAI: [
    'Dubai City',
    'Deira',
    'Jumeirah'
  ],
  SINGAPORE: [
    'Central',
    'North-East',
    'East',
    'West'
  ]
};

selectedCountry: keyof LocationMap = 'INDIA';
regionList: string[] = this.locations[this.selectedCountry];
toggleLocationMenu(event: Event) {
  event.stopPropagation();
  this.isLocationOpen = !this.isLocationOpen;
}

selectCountry(country: keyof LocationMap) {
  this.selectedCountry = country;
  this.regionList = this.locations[country];
}

selectRegion(region: string) {
  this.selectedRegion = region;
  this.isLocationOpen = false;

  // Optional: save globally
  // localStorage.setItem('region', region);
}

@HostListener('document:click')
closeOnOutsideClick() {
  this.isLocationOpen = false;
}

getSystemTime(): Date {
  return new Date(); // browser system time
}

formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}
startTimer() {
  this.timerRef = setInterval(() => {
    const now = this.getSystemTime();
    const diff = now.getTime() - this.clockInTime.getTime();

    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    this.totalHoursDisplay =
      `${hrs.toString().padStart(2, '0')}:` +
      `${mins.toString().padStart(2, '0')}:` +
      `${secs.toString().padStart(2, '0')}`;
  }, 1000);
}
stopTimer() {
  if (this.timerRef) {
    clearInterval(this.timerRef);
    this.timerRef = null;
  }
}
getSystemTime24(): string {
  const now = new Date(); // USER SYSTEM TIME
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;   // HH:mm
}
toggleClock() {
  const now = this.getSystemTime();

  if (!this.isClockedIn) {
    // 🟢 CLOCK IN
    this.isClockedIn = true;
    this.clockInTime = now;

    sessionStorage.setItem('clockInTime', now.toISOString());

    this.clockStatus = 'Clocked In';
    this.clockInDisplay = this.formatTime(now);
    this.totalHoursDisplay = '00:00:00';

    this.startTimer();

    this.employeeResignationService.addClockInOut({
      employeeCode: this.employeeCode,
      employeeName: sessionStorage.getItem('Name') || '',
      department: 0,
      attendanceDate: new Date(),
      actionType: 'ClockIn',
      actionTime: this.getSystemTime24(),
      clockInTime: this.getSystemTime24(),
      clockOutTime: '',
      companyId: this.companyId,
      regionId: this.regionId
    }).subscribe(() => {
      this.loadAttendance();
    });

  } else {
    // 🔴 CLOCK OUT
    this.isClockedIn = false;

    sessionStorage.removeItem('clockInTime');

    this.clockStatus = 'Clocked Out';
    this.stopTimer();

    this.employeeResignationService.addClockInOut({
      employeeCode: this.employeeCode,
      employeeName: sessionStorage.getItem('Name') || '',
      department: 0,
      attendanceDate: new Date(),
      actionType: 'ClockOut',
      actionTime: this.getSystemTime24(),
      clockInTime: '',
      clockOutTime: this.getSystemTime24(),
      companyId: this.companyId,
      regionId: this.regionId
    }).subscribe(() => {
      this.loadAttendance();
    });
  }
}
records:any;
 loadTodayAttendance() {
    this.employeeResignationService
      .getTodayByEmployee(this.employeeCode, this.companyId, this.regionId)
      .subscribe(res => {
        this.records = res;
      });
  }
attendanceRecords:any;
//  loadAttendance() {
//     this.adminService.getTodayAttendance(
//       String(this.employeeCode),
//       this.companyId,
//       this.regionId
//     ).subscribe(res => {
//       this.attendanceRecords = res;
//       this.setTodaySummary();
//       this.setAvailableActions(); 
//     });
//   }
  todayDuration:any;
  todayClockIn:any='--:--';
  todayClockOut:any='--:--'
  
   setTodaySummary() {
  const today = new Date().toISOString().split('T')[0];

  const todayRecords = this.attendanceRecords
    .filter((r: any) => r.attendanceDate.startsWith(today))
    .sort((a: any, b: any) => a.actionTime.localeCompare(b.actionTime));

  const clockIns = todayRecords.filter((r: any) => r.actionType === 'ClockIn');
  const clockOuts = todayRecords.filter((r: any) => r.actionType === 'ClockOut');

  // First ClockIn
  this.todayClockIn = clockIns.length
    ? clockIns[0].actionTime
    : '--:--';

  // Last ClockOut
  this.todayClockOut = clockOuts.length
    ? clockOuts[clockOuts.length - 1].actionTime
    : '--:--';

  // 🟢 Calculate duration
  if (this.todayClockIn !== '--:--' && this.todayClockOut !== '--:--') {
    const start = this.parseTime(this.todayClockIn);
    const end = this.parseTime(this.todayClockOut);

    const diffMs = end.getTime() - start.getTime();

    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      this.todayDuration =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      this.todayDuration = '--:--';
    }
  } else {
    this.todayDuration = '--:--';
  }
}
parseTime(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}
  availableActions: string[] = [];
setAvailableActions() {
  const today = new Date().toISOString().split('T')[0];

  const todayRecords = this.attendanceRecords
    .filter((r: any) => r.attendanceDate.startsWith(today))
    .sort((a: any, b: any) => a.actionTime.localeCompare(b.actionTime));

  // FIRST record of the day
  if (todayRecords.length === 0) {
    this.availableActions = ['ClockIn'];
    //this.attendanceForm.patchValue({ clockType: 'ClockIn' });
    return;
  }
}
loadAttendance() {
  this.adminService.getTodayAttendance(
    String(this.employeeCode),
    this.companyId,
    this.regionId
  ).subscribe(res => {
    this.attendanceRecords = res;

    this.setTodaySummary();
    this.setAvailableActions();

    // ✅ IMPORTANT FIX
    this.syncClockStateWithAPI();
  });
}
syncClockStateWithAPI() {

  const today = new Date().toISOString().split('T')[0];

  const todayRecords = this.attendanceRecords
    .filter((r: any) => r.attendanceDate.startsWith(today))
    .sort((a: any, b: any) => a.actionTime.localeCompare(b.actionTime));

  if (todayRecords.length === 0) {
    // ❌ No records → reset
    this.isClockedIn = false;
    this.clockStatus = 'Not Clocked In';
    this.clockInDisplay = '--:--:--';
    this.totalHoursDisplay = '00:00:00';
    return;
  }

  const lastRecord = todayRecords[todayRecords.length - 1];

  if (lastRecord.actionType === 'ClockIn') {
    // 🟢 User is still clocked in

    this.isClockedIn = true;
    this.clockStatus = 'Clocked In';

    this.clockInTime = this.parseTime(lastRecord.actionTime);
    this.clockInDisplay = lastRecord.actionTime;

    sessionStorage.setItem('clockInTime', this.clockInTime.toISOString());

    this.startTimer();

  } else {
    // 🔴 User already clocked out

    this.isClockedIn = false;
    this.clockStatus = 'Clocked Out';

    this.stopTimer();
    sessionStorage.removeItem('clockInTime');
  }
}
  isOpen: boolean = false;

 
// ================= CHATBOT =================

// ================= CHATBOT =================


userInput = '';
messages: any[] = [];
menus: any[] = [];
isTyping = false;

// Toggle Chat
toggleChat() {
  this.isOpen = !this.isOpen;
}

// Add message
addMessage(type: string, text: string, buttons: any[] = []) {
  const time = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  this.messages.push({ type, text, time, buttons });
  this.scrollToBottom();
}

// Send message
sendMessage() {
  if (!this.userInput.trim()) return;

  const input = this.userInput.trim();

  // Show user message
  this.addMessage('user', input);
  this.userInput = '';

  // Show typing
  this.isTyping = true;
  this.scrollToBottom();

  setTimeout(() => {
    this.isTyping = false;
    this.handleUserQuery(input.toLowerCase());
  }, 1200);
}

// Handle user query
handleUserQuery(input: string) {

  let match = this.menus.find(m =>
    m.menuName.toLowerCase().includes(input)
  );

  if (match) {
    this.addMessage(
      'bot',
      `I found "${match.menuName}". What would you like to do?`,
      [
        { label: 'Open Page', action: 'navigate', url: match.url },
        { label: 'Cancel', action: 'cancel' }
      ]
    );
  } else {

    const suggestions = this.menus
      .filter(m => m.menuName.toLowerCase().includes(input.substring(0, 3)))
      .slice(0, 5);

    if (suggestions.length > 0) {
      this.addMessage(
        'bot',
        'Did you mean one of these?',
        suggestions.map(s => ({
          label: s.menuName,
          action: 'navigate',
          url: s.url
        }))
      );
    } else {
      this.addMessage(
        'bot',
        'Try keywords like "leave", "attendance", "profile"'
      );
    }
  }
}

// Handle button click
handleAction(btn: any) {

  if (btn.action === 'navigate') {

    this.addMessage('user', btn.label);

    this.isTyping = true;

    setTimeout(() => {
      this.isTyping = false;

      this.addMessage('bot', `Opening ${btn.label}...`);

      setTimeout(() => {
        this.router.navigate([btn.url]);
      }, 500);

    }, 800);

  } else {
    this.addMessage('bot', 'Okay 👍');
  }
}

// Auto scroll
scrollToBottom() {
  setTimeout(() => {
    const container = document.getElementById('chatContainer');
    if (container) {
      container.scrollTop = container.scrollHeight + 500;
    }
  }, 100);
}
}

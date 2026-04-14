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

    // this.messages.push({
    //   type: 'bot',
    //   text: 'Hi 👋 Ask me anything like "leave", "attendance", "profile"'
    // });

this.addMessage(
  'bot',
  "Hi 👋 I'm your HRMS Assistant. Here are some things I can help you with 👇",
  this.getInitialOptions()
);

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

// showQuickOptions = true;

intentMap = [
  // NAVIGATION
  { keywords: ['leave', 'leaves'], action: 'navigate', url: '/leave-management', label: 'Leave' },
  { keywords: ['attendance'], action: 'navigate', url: '/attendance-list', label: 'Attendance' },
  { keywords: ['dashboard', 'home'], action: 'navigate', url: '/dashboard', label: 'Dashboard' },
  { keywords: ['expense', 'expenses'], action: 'navigate', url: '/expenses', label: 'Expenses' },
  { keywords: ['asset', 'assets'], action: 'navigate', url: '/asset', label: 'Assets' },
  { keywords: ['profile'], action: 'navigate', url: '/profile', label: 'Profile' },

  // ACTIONS
  { keywords: ['punch in', 'clock in'], action: 'punch_in' },
  { keywords: ['punch out', 'clock out'], action: 'punch_out' }
];


faqList = [
{
  keywords: ['cortracker', 'about'],
  text: `CORtracker is an enterprise software company providing ERP, CRM, supply chain, and analytics solutions. It focuses on digital transformation using AI, automation, and modern technologies. The platform helps organizations streamline operations and improve efficiency across departments. CORtracker is headquartered in Michigan, USA, with a significant presence in India. It serves clients globally across various industries, offering both cloud and on-premise deployment options.`,
}, 
  {
    keywords: ['services'],
    text: 'CORtracker offers ERP, CRM, supply chain, analytics, and custom software development.',
    buttons: [
      { label: 'ERP Modules', action: 'faq', value: 'erp' },
      { label: 'CRM Features', action: 'faq', value: 'crm' }
    ]
  },
  {
    keywords: ['erp'],
    text: 'ERP includes finance, HR, procurement, inventory, production, maintenance, and accounting modules.'
  },
  {
    keywords: ['crm'],
    text: 'CRM includes lead management, sales automation, customer support, marketing, and analytics.'
  },
  {
    keywords: ['deployment'],
    text: 'CORtracker supports both cloud-based and on-premise deployment.'
  },
  {
    keywords: ['headquarters'],
    text: 'CORtracker is headquartered in Michigan, USA.'
  },
  {
    keywords: ['india'],
    text: 'CORtracker IT Pvt Ltd is located in Jubilee Hills, Hyderabad, India.'
  },
  {
    keywords: ['technology'],
    text: 'CORtracker uses AI, IoT, big data, and automation for advanced solutions.'
  },
  
  {
    keywords: ['culture'],
    text: 'Work culture includes good learning opportunities, but varies across roles.'
  }
];

showQuickOptions() {
  this.addMessage(
    'bot',
    'Here are some things I can help you with 👇',
    [
      { label: 'About CORtracker', action: 'faq', value: 'cortracker' },
      { label: 'Services', action: 'faq', value: 'services' },
      // { label: 'ERP Modules', action: 'faq', value: 'erp' },
      // { label: 'CRM Features', action: 'faq', value: 'crm' },
      { label: 'Work Culture', action: 'faq', value: 'culture' }
    ]
  );
}




formatLabel(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}



// getInitialOptions() {
//   return [
//     // 🔥 HRMS ACTIONS (TOP PRIORITY)
//     { label: 'Leave Balance', action: 'navigate', url: '/leave-management' },
//     { label: 'Attendance', action: 'navigate', url: '/attendance-list' },
//     { label: 'Job History', action: 'navigate', url: '/skills' },
//     { label: 'Profile Info', action: 'navigate', url: '/profile' },

//     // 📘 COMPANY FAQ OPTIONS
//     { label: 'About CORtracker', action: 'faq', value: 'cortracker' },
//     { label: 'Services', action: 'faq', value: 'services' },
//     { label: 'ERP Modules', action: 'faq', value: 'erp' },
//     { label: 'CRM Features', action: 'faq', value: 'crm' },
//     { label: 'Work Culture', action: 'faq', value: 'culture' }
//   ];
// } 

getInitialOptions() {
  return [
    { label: '📊 HR Services', action: 'section_hr' },
    { label: '🏢 Company Info', action: 'section_company' }
  ];
}

getFaqResponse(input: string): any {

  input = input.toLowerCase();

  for (let faq of this.faqList) {
    for (let key of faq.keywords) {
      if (input.includes(key)) {
        return faq;
      }
    }
  }

  return null;
}

userInput = '';
messages: any[] = [];
menus: any[] = [];
isTyping = false;

// Toggle Chat
toggleChat() {
  this.isOpen = !this.isOpen;

  if (this.isOpen && this.messages.length === 0) {

 this.addMessage(
  'bot',
  "Hi 👋 I'm your HRMS Assistant. You can manage HR tasks or explore company info 👇",
  this.getInitialOptions()
);
  }
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


// handleUserQuery(input: string) {

//   let match = this.menus.find(m =>
//     m.menuName.toLowerCase().includes(input)
//   );

//   if (match) {
//     this.addMessage(
//       'bot',
//       `I found "${match.menuName}". What would you like to do?`,
//       [
//         { label: 'Open Page', action: 'navigate', url: match.url },
//         { label: 'Cancel', action: 'cancel' }
//       ]
//     );
//   } else {

//     const suggestions = this.menus
//       .filter(m => m.menuName.toLowerCase().includes(input.substring(0, 3)))
//       .slice(0, 5);

//     if (suggestions.length > 0) {
//       this.addMessage(
//         'bot',
//         'Did you mean one of these?',
//         suggestions.map(s => ({
//           label: s.menuName,
//           action: 'navigate',
//           url: s.url
//         }))
//       );
//     } else {
//       this.addMessage(
//         'bot',
//         'Try keywords like "leave", "attendance", "profile"'
//       );
//     }
//   }
// }

// handleUserQuery(input: string) {

//   // ✅ STEP 1: FAQ CHECK (NEW)
//   const faq = this.getFaqResponse(input);

//   if (faq) {
//     this.addMessage(
//       'bot',
//       faq.text,
//       faq.buttons || []
//     );
//     return;
//   }

//   // ✅ STEP 2: EXISTING MENU LOGIC (UNCHANGED)
//   let match = this.menus.find(m =>
//     m.menuName.toLowerCase().includes(input)
//   );

//   if (match) {
//     this.addMessage(
//       'bot',
//       `I found "${match.menuName}". What would you like to do?`,
//       [
//         { label: 'Open Page', action: 'navigate', url: match.url },
//         { label: 'Cancel', action: 'cancel' }
//       ]
//     );
//   } else {

//     const suggestions = this.menus
//       .filter(m => m.menuName.toLowerCase().includes(input.substring(0, 3)))
//       .slice(0, 5);

//     if (suggestions.length > 0) {
//       this.addMessage(
//         'bot',
//         'Did you mean one of these?',
//         suggestions.map(s => ({
//           label: s.menuName,
//           action: 'navigate',
//           url: s.url
//         }))
//       );
//     } else {
//       this.addMessage(
//         'bot',
//         'Try keywords like "leave", "attendance", "job history", "profile"'
//       );
//     }
//   }
// }



// handleUserQuery(input: string) {

//   const faq = this.getFaqResponse(input);

//   if (faq) {
//     this.addMessage(
//       'bot',
//       faq.text,
//       faq.buttons || []
//     );

//     // ❌ REMOVE auto showQuickOptions here
//     return;
//   }

//   let match = this.menus.find(m =>
//     m.menuName.toLowerCase().includes(input)
//   );

//   if (match) {
//     this.addMessage(
//       'bot',
//       `I found "${match.menuName}". What would you like to do?`,
//       [
//         { label: 'Open Page', action: 'navigate', url: match.url },
//         { label: 'Cancel', action: 'cancel' }
//       ]
//     );
//     return;
//   }

//   // ✅ ONLY show options when nothing matches
//   this.addMessage(
//     'bot',
//     'I didn’t understand. Try one of these 👇'
//   );

//   this.showQuickOptions(); // ✅ only here
// }

// handleUserQuery(input: string) {

//   input = input.toLowerCase().trim();

//   // =========================
//   // ✅ FAQ FIRST
//   // =========================
//   const faq = this.getFaqResponse(input);
//   if (faq) {
//     this.addMessage('bot', faq.text, faq.buttons || []);
//     return;
//   }

//   // =========================
//   // ✅ NAVIGATION INTENTS
//   // =========================

//   if (input.includes('leave')) {
//     this.addMessage('bot', 'Opening Leave page...');
//     setTimeout(() => this.router.navigate(['/leave-management']), 400);
//     return;
//   }

//   if (input.includes('attendance')) {
//     this.addMessage('bot', 'Opening Attendance...');
//     setTimeout(() => this.router.navigate(['/attendance-list']), 400);
//     return;
//   }

//   if (input.includes('dashboard') || input.includes('home')) {
//     this.addMessage('bot', 'Opening Dashboard...');
//     setTimeout(() => this.router.navigate(['/dashboard']), 400);
//     return;
//   }

//   if (input.includes('expense')) {
//     this.addMessage('bot', 'Opening Expenses...');
//     setTimeout(() => this.router.navigate(['/expenses']), 400);
//     return;
//   }

//   if (input.includes('asset')) {
//     this.addMessage('bot', 'Opening Assets...');
//     setTimeout(() => this.router.navigate(['/asset']), 400);
//     return;
//   }

//   if (input.includes('job')) {
//     this.addMessage('bot', 'Opening Job History...');
//     setTimeout(() => this.router.navigate(['/skills']), 400);
//     return;
//   }

//   if (input.includes('profile')) {
//     this.addMessage('bot', 'Opening Profile...');
//     setTimeout(() => this.router.navigate(['/profile']), 400);
//     return;
//   }

//   // =========================
//   // ✅ ACTION INTENTS (NEW 🔥)
//   // =========================

//   if (input.includes('punch in') || input.includes('clock in')) {
//     this.addMessage('bot', 'Punching you in... ⏱️');

//     // 👉 Future: call API here
//     console.log('Punch In API');

//     return;
//   }

//   if (input.includes('punch out') || input.includes('clock out')) {
//     this.addMessage('bot', 'Punching you out... ⏱️');

//     console.log('Punch Out API');

//     return;
//   }

//   // =========================
//   // ❌ FALLBACK
//   // =========================

//   this.addMessage(
//     'bot',
//     'I didn’t understand. Try commands like "leave", "attendance", "dashboard", "punch in" 👇'
//   );

//   this.showQuickOptions();
// }
handleUserQuery(input: string) {

  input = input.toLowerCase().trim();

  // =========================
  // ✅ FAQ FIRST
  // =========================
  const faq = this.getFaqResponse(input);
  if (faq) {
    this.addMessage('bot', faq.text, faq.buttons || []);
    return;
  }

  // =========================
  // ✅ SMART INTENT MATCHING (NEW 🔥)
  // =========================
  const matchedIntent = this.intentMap.find(intent =>
    intent.keywords.some(k => input.includes(k))
  );

  if (matchedIntent) {

    // =========================
    // 🔴 PUNCH IN
    // =========================
    if (matchedIntent.action === 'punch_in') {

      if (this.isClockedIn) {
        this.addMessage('bot', '⚠️ You are already clocked in ⏱️');
        return;
      }

      this.addMessage('bot', 'Punching you in... ⏱️');

      setTimeout(() => {
        this.toggleClock(); // ✅ uses your existing API
        this.addMessage('bot', `✅ Clocked in at ${this.clockInDisplay}`);
      }, 500);

      return;
    }

    // =========================
    // 🔴 PUNCH OUT
    // =========================
    if (matchedIntent.action === 'punch_out') {

      if (!this.isClockedIn) {
        this.addMessage('bot', '⚠️ You are not clocked in');
        return;
      }

      this.addMessage('bot', 'Punching you out... ⏱️');

      setTimeout(() => {
        this.toggleClock(); // ✅ API call
        this.addMessage('bot', `🕒 Total time worked: ${this.totalHoursDisplay}`);
      }, 500);

      return;
    }

    // =========================
    // 📍 NAVIGATION
    // =========================
  if (matchedIntent.action === 'navigate' && matchedIntent.url) {

  this.addMessage('bot', `Opening ${matchedIntent.label}...`);

  setTimeout(() => {
    this.router.navigateByUrl(matchedIntent.url!);
  }, 400);

  return;
}

  // =========================
  // ❌ FALLBACK
  // =========================
  this.addMessage(
    'bot',
    'I didn’t understand. Try: leave, attendance, dashboard, punch in/out 👇'
  );

  this.showQuickOptions();
}
}


// Handle button click


// handleAction(btn: any) {

//   if (btn.action === 'navigate') {

//     this.addMessage('user', btn.label);

//     this.isTyping = true;

//     setTimeout(() => {
//       this.isTyping = false;

//       this.addMessage('bot', `Opening ${btn.label}...`);

//       setTimeout(() => {
//         this.router.navigate([btn.url]);
//       }, 500);

//     }, 800);

//   } else {
//     this.addMessage('bot', 'Okay 👍');
//   }
// }




// handleAction(btn: any) {

//   // Show user click as message
//   this.addMessage('user', btn.label);

//   // Typing effect
//   this.isTyping = true;

//   setTimeout(() => {
//     this.isTyping = false;

//     // 👉 If it's FAQ button
//     if (btn.action === 'faq') {
//       this.handleUserQuery(btn.value);
//       return;
//     }

//     // 👉 Navigation (existing)
//     if (btn.action === 'navigate') {

//       this.addMessage('bot', `Opening ${btn.label}...`);

//       setTimeout(() => {
//         this.router.navigate([btn.url]);
//       }, 500);
//     }

//     // 👉 Cancel
//     else {
//       this.addMessage('bot', 'Okay 👍');
//     }

//   }, 800);
// }
// handleAction(btn: any) {

//   // Show user click
//   this.addMessage('user', btn.label);

//   this.isTyping = true;

//   setTimeout(() => {
//     this.isTyping = false;

//     // ✅ FAQ FLOW
//     if (btn.action === 'faq') {
//       this.handleUserQuery(btn.value);  
//       return;
//     }

//     // ✅ NAVIGATION FLOW
//     if (btn.action === 'navigate') {

//       this.addMessage('bot', `Opening ${btn.label}...`);

//       setTimeout(() => {
//         this.router.navigate([btn.url]);
//       }, 500);

//       return;
//     }

//     // fallback
//     this.addMessage('bot', 'Okay 👍');

//   }, 800);
// }




// handleAction(btn: any) {

//   // Show user click
//   this.addMessage('user', btn.label);

//   this.isTyping = true;

//   setTimeout(() => {
//     this.isTyping = false;

//     // =========================
//     // ✅ SECTION: HR SERVICES
//     // =========================
//     if (btn.action === 'section_hr') {
//       this.addMessage(
//         'bot',
//         'Here are HR services you can access 👇',
//         [
//           { label: 'Leave Balance', action: 'navigate', url: '/leave-management' },
//           { label: 'Attendance', action: 'navigate', url: '/attendance-list' },
//           { label: 'Job History', action: 'navigate', url: '/skills' },
//           { label: 'Profile Info', action: 'navigate', url: '/profile' }
//         ]
//       );
//       return;
//     }

//     // =========================
//     // ✅ SECTION: COMPANY INFO
//     // =========================
//     if (btn.action === 'section_company') {
//       this.addMessage(
//         'bot',
//         'Here is company information 👇',
//         [
//           { label: 'About CORtracker', action: 'faq', value: 'cortracker' },
//           { label: 'Services', action: 'faq', value: 'services' },
//           // { label: 'ERP Modules', action: 'faq', value: 'erp' },
//           // { label: 'CRM Features', action: 'faq', value: 'crm' },
//           { label: 'Work Culture', action: 'faq', value: 'culture' }
//         ]
//       );
//       return;
//     }


//     // =========================
//     // ✅ FAQ FLOW
//     // =========================
//     if (btn.action === 'faq') {
//       this.handleUserQuery(btn.value);
//       return;
//     }

//     // =========================
//     // ✅ NAVIGATION FLOW (FIXED)
//     // =========================
//     if (btn.action === 'navigate') {

//       this.addMessage('bot', `Opening ${btn.label}...`);

//       setTimeout(() => {
//         this.router.navigateByUrl(btn.url); // ✅ FIXED
//       }, 500);

//       return;
//     }

//     // =========================
//     // fallback
//     // =========================
//     this.addMessage('bot', 'Okay 👍');

//   }, 600);
// }

handleAction(btn: any) {

  // Show user click
  this.addMessage('user', btn.label);

  this.isTyping = true;

  setTimeout(() => {
    this.isTyping = false;

    // =========================
    // ✅ SECTION: HR SERVICES
    // =========================
    if (btn.action === 'section_hr') {
      this.addMessage(
        'bot',
        'Here are HR services you can access 👇',
        [
          { label: 'Leave Balance', action: 'navigate', url: '/leave-management' },
          { label: 'Attendance', action: 'navigate', url: '/attendance-list' },
          { label: 'Job History', action: 'navigate', url: '/skills' },
          { label: 'Profile Info', action: 'navigate', url: '/profile' }
        ]
      );
      return;
    }

    // =========================
    // ✅ SECTION: COMPANY INFO
    // =========================
    if (btn.action === 'section_company') {
      this.addMessage(
        'bot',
        'Here is company information 👇',
        [
          { label: 'About CORtracker', action: 'faq', value: 'cortracker' },
          { label: 'Services', action: 'faq', value: 'services' },
          { label: 'Work Culture', action: 'faq', value: 'culture' }
        ]
      );
      return;
    }

    // =========================
    // ✅ FAQ FLOW
    // =========================
    if (btn.action === 'faq') {
      this.handleUserQuery(btn.value);

      // 🔥 SPECIAL CASE: ABOUT CORTRACKER → OPEN WEBSITE
      if (btn.value === 'cortracker') {
        setTimeout(() => {
          this.addMessage(
            'bot',
            'Want to explore more? ',
            [
              {
                label: 'Open Official Website',
                action: 'external',
                url: 'https://www.cortracker360.com/index.php'
              }
            ]
          );
        }, 500);
      }

      return;
    }

    // =========================
    // ✅ INTERNAL NAVIGATION
    // =========================
    if (btn.action === 'navigate') {

      this.addMessage('bot', `Opening ${btn.label}...`);

      setTimeout(() => {
        this.router.navigateByUrl(btn.url);
      }, 500);

      return;
    }

    // =========================
    // ✅ EXTERNAL NAVIGATION (NEW 🔥)
    // =========================
    if (btn.action === 'external') {

      this.addMessage('bot', 'Opening official website... 🌐');

      setTimeout(() => {
        window.open(btn.url, '_blank');
      }, 500);

      return;
    }

    // =========================
    // fallback
    // =========================
    this.addMessage('bot', 'Okay 👍');

  }, 600);
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

resetChat() {
  this.messages = [];
  this.userInput = '';
  this.isTyping = false;

  // Restart conversation
  this.addMessage(
    'bot',
    "Hi 👋 I'm your HRMS Assistant. How can I help you today?",
    this.getInitialOptions()
  );
}
}

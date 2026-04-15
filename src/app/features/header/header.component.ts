import { Component, HostListener, NgZone } from '@angular/core';
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

  shiftStartTime: string = ''; // e.g. "09:00"
  showClockButton: boolean = false;
  allowedClockTimeText: string = '';

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

        this.loadUserShift();

  // ⏱️ Check every minute (important)
  setInterval(() => {
    this.checkClockButtonVisibility();
  }, 60000);
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





formatLabel(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}


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
// faq list questions and answers
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
  },

   {
    keywords: ['modules'],
    text: 'CORtracker ERP includes finance, HR, procurement, inventory, production, maintenance, and accounting modules.'
  },
];

// Handle button click
// showingQuickOptions functions
showQuickOptions() {
  this.addMessage(
    'bot',
    'Here are some things I can help you with 👇',
    [
      { label: 'About CORtracker', action: 'faq', value: 'cortracker' },
      { label: 'Services', action: 'faq', value: 'services' },
      // { label: 'What modules are included in CORtracker ERP?', action: 'faq', value: 'modules' },
      // { label: 'ERP Modules', action: 'faq', value: 'erp' },
      // { label: 'CRM Features', action: 'faq', value: 'crm' },
      { label: 'Work Culture', action: 'faq', value: 'culture' },
      // {label: 'Leave Balance', action: 'navigate', url: '/leave-management'},
      // {label: 'Pay Roll', action: 'navigate', url: '/payroll'},

    ]
  );
}

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
          { label: 'Work Culture', action: 'faq', value: 'culture' },
          // { label: 'What modules are included in CORtracker ERP?', action: 'faq', value: 'modules' },
          // {label: 'Leave Balance', action: 'navigate', url: '/leave-management'},
          // {label: 'Pay Roll', action: 'navigate', url: '/payroll'},
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

// Adding voice commands
recognition: any;
isListening: boolean = false;

initVoiceRecognition() {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert('Voice recognition not supported in this browser');
    return;
  }

  this.recognition = new SpeechRecognition();
  this.recognition.lang = 'en-US';
  this.recognition.continuous = false;
  this.recognition.interimResults = false;

  this.recognition.onstart = () => {
    this.isListening = true;
  };

  this.recognition.onend = () => {
    this.isListening = false;
  };

  this.recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;

    // Show user message
    this.addMessage('user', transcript);

    // Process command
    this.handleUserQuery(transcript.toLowerCase());
  };

  this.recognition.onerror = () => {
    this.isListening = false;
    this.addMessage('bot', '🎤 Voice error. Try again');
  };
}

startListening() {
  if (!this.recognition) {
    this.initVoiceRecognition();
  }

  this.recognition.start();
}

stopListening() {
  if (this.recognition) {
    this.recognition.stop();
  }
}

loadUserShift() {

  const companyId = Number(sessionStorage.getItem('CompanyId'));
  const regionId = Number(sessionStorage.getItem('RegionId'));

  this.employeeResignationService.getAllAllocations(this.userId)
    .subscribe((allocations: any[]) => {

      console.log('Allocations 👉', allocations);

      const today = new Date().toISOString().split('T')[0];

      // ✅ STEP 1: Filter by Company + Region + Active Date
      const activeAllocation = allocations.find(a => {

        const start = a.startDate ? a.startDate.split('T')[0] : null;
        const end = a.endDate ? a.endDate.split('T')[0] : null;

        return (
          a.isActive &&
          a.companyID == companyId &&
          a.regionID == regionId &&
          start <= today &&
          (!end || end >= today)
        );
      });

      if (!activeAllocation) {
        console.warn('No active shift found');
        this.showClockButton = false;
        return;
      }

      console.log('Active Allocation 👉', activeAllocation);

      // ✅ STEP 2: Get Shift Master Details
      this.adminService
        .getShiftsForDropdown(companyId, regionId)
        .subscribe((shifts: any[]) => {

          console.log('Shifts 👉', shifts);

          const shift = shifts.find(s => s.shiftID == activeAllocation.shiftID);

          if (!shift) {
            console.warn('Shift not found in master');
            return;
          }

          // ✅ FINAL: Assign Start Time
          this.shiftStartTime = shift.shiftStartTime;

          console.log('Shift Start Time 👉', this.shiftStartTime);

          this.checkClockButtonVisibility();
        });
    });
}

checkClockButtonVisibility() {
  if (!this.shiftStartTime) {
    this.showClockButton = false;
    return;
  }

  const now = new Date();

  const [hours, minutes] = this.shiftStartTime.split(':').map(Number);

  const shiftStart = new Date();
  shiftStart.setHours(hours, minutes, 0, 0);

  // ⏪ 30 mins before
  const allowedTime = new Date(shiftStart.getTime() - (30 * 60 * 1000));

  // ❌ After shift start + grace (optional)
  const shiftEndLimit = new Date(shiftStart.getTime() + (2 * 60 * 60 * 1000)); // 2 hrs buffer

  this.allowedClockTimeText = this.formatDisplayTime(allowedTime);

  // ✅ FINAL CONDITION
  this.showClockButton = now >= allowedTime && now <= shiftEndLimit;

  console.log('Now:', now);
  console.log('Allowed:', allowedTime);
  console.log('Shift Start:', shiftStart);
  console.log('Show Button:', this.showClockButton);
}

formatDisplayTime(date: Date): string {
  let hours = date.getHours();
  let minutes: any = date.getMinutes();

  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 => 12

  minutes = minutes.toString().padStart(2, '0');

  return `${hours}:${minutes} ${ampm}`;
}
}

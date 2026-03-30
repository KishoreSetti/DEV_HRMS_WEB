import { Component , ViewChild, ElementRef} from '@angular/core';
import { HRMS_MODULES,HrmsModule } from '../../core/chatbot-routes';
import { Router } from '@angular/router';
import { AdminService } from '../../admin/servies/admin.service';
import { EmployeeResignationService } from '../employee-profile/employee-services/employee-resignation.service';
import { HelpdeskService } from '../helpdesk/service/helpdesk.service';
import { Chart } from 'chart.js/auto';
interface ChatMessage {
   sender: 'User' | 'Bot';
  text?: string; 
   attachmentName?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
   
  @ViewChild('fileInput') fileInput!: ElementRef;

  isOpen = false;
  showIntro = true;
  showModules = false;
  showEmojiPicker = false;
dashboardData:any;
  userMessage = '';
  currentUser:any;
companyId!:number;
leaveDates: string[] = [];
days: number[] = [];
 events: any[] = [];
currentYear = new Date().getFullYear();
currentMonth = new Date().getMonth() + 1;
tickets: any[] = [];
userId!: number;
  emojis: string[] = [];
 holidayDates: string[] = [];
weekoffDays: string[] = [];   // store day names (Sunday, Saturday)
weekoffDates: string[] = [];  // store actual dates
attendanceRecords: any[] = [];
attendanceChart: any;

  modules = [];
    constructor(private helpdeskService: HelpdeskService,private EmployeeResignationService: EmployeeResignationService,private adminService: AdminService) {}
  
ngOnInit(){
  this.currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  this.companyId = this.currentUser.companyId;
  this.userId = Number(sessionStorage.getItem('UserId')); // ✅ store in class variable
  this.loadDashboard();
    this.loadEvents();
this.loadAttendance();
   this.generateCalendar();

  if (this.userId) {
    this.loadUserLeaves(this.userId);
    this.loadMyTickets();
  }
    this.loadHolidays(this.companyId, this.currentUser.regionId); // ✅ ADD THIS
this.loadWeekoffs(this.companyId, this.currentUser.regionId);
}
isWeekoff(day: number): boolean {

  const date =
    this.currentYear + '-' +
    String(this.currentMonth).padStart(2,'0') + '-' +
    String(day).padStart(2,'0');

  return this.weekoffDates.includes(date);
}
loadWeekoffs(companyId: number, regionId: number) {

  this.adminService.getWeekoffs(companyId, regionId).subscribe({
    next: (res: any) => {

      this.weekoffDays = res.data
        .filter((x: any) => x.isActive && x.weekoffDate)
        .map((x: any) => x.weekoffDate); // Sunday, Saturday

      this.generateWeekoffDates(); // ✅ convert to dates

      console.log("Weekoff Days:", this.weekoffDays);
      console.log("Weekoff Dates:", this.weekoffDates);

    },
    error: err => console.error(err)
  });

}

generateWeekoffDates() {

  this.weekoffDates = [];

  this.days.forEach(day => {

    const dateObj = new Date(this.currentYear, this.currentMonth - 1, day);

    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    if (this.weekoffDays.includes(dayName)) {

      const formatted =
        this.currentYear + '-' +
        String(this.currentMonth).padStart(2, '0') + '-' +
        String(day).padStart(2, '0');

      this.weekoffDates.push(formatted);
    }

  });

}
isHoliday(day: number): boolean {

  const date =
    this.currentYear + '-' +
    String(this.currentMonth).padStart(2,'0') + '-' +
    String(day).padStart(2,'0');

  return this.holidayDates.includes(date);
}
loadHolidays(companyId: number, regionId: number) {

  this.adminService.getHolidays(companyId, regionId).subscribe({
    next: (res: any) => {

      this.holidayDates = [];

      if (res && res.data) {

        res.data
          .filter((x: any) => x.isActive && x.date)
          .forEach((x: any) => {

            const formatted = x.date.split('T')[0]; // YYYY-MM-DD

            this.holidayDates.push(formatted);
          });

      }

      console.log("Holiday Dates:", this.holidayDates);
    },
    error: (err) => console.error(err)
  });

}
createAttendanceChart() {

  let clockInTime: any = null;
  let clockOutTime: any = null;

  // find clockin & clockout
  this.attendanceRecords.forEach(r => {

    if (r.actionType === 'ClockIn') {
      clockInTime = r.actionTime;
    }

    if (r.actionType === 'ClockOut') {
      clockOutTime = r.actionTime;
    }

  });

  if (!clockInTime || !clockOutTime) {
    return;
  }

  // convert to hours
  const inParts = clockInTime.split(':');
  const outParts = clockOutTime.split(':');

  const inHour = Number(inParts[0]) + Number(inParts[1]) / 60;
  const outHour = Number(outParts[0]) + Number(outParts[1]) / 60;

  const totalHours = outHour - inHour;

  if (this.attendanceChart) {
    this.attendanceChart.destroy();
  }

  this.attendanceChart = new Chart("attendanceChart", {
    type: 'bar',
    data: {
      labels: ['Today'],
      datasets: [
        {
          label: 'Working Hours',
          data: [totalHours],
          backgroundColor: '#4CAF50'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

}


loadAttendance() {

  const employeeCode = sessionStorage.getItem('EmployeeCode');
  const companyId = this.currentUser.companyId;
  const regionId = this.currentUser.regionId;

  this.EmployeeResignationService
    .getTodayByEmployee(employeeCode, companyId, regionId)
    .subscribe({
      next: (res: any) => {

        this.attendanceRecords = res;

        this.createAttendanceChart();

      },
      error: (err) => {
        console.error("Attendance load error", err);
      }
    });

}


loadMyTickets() {

  console.log("UserId:", this.userId);

  this.helpdeskService.getMyTickets(this.userId)
    .subscribe({
      next: (res:any) => {
        console.log("Tickets:", res);
        this.tickets = res;
      },
      error: (err) => {
        console.error("Ticket load error", err);
      }
    });

}
generateCalendar() {
  const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    this.days.push(i);
  }
}
loadUserLeaves(userId: number) {

  this.EmployeeResignationService.getUserLeaves(userId).subscribe({
    next: (res: any[]) => {

      this.leaveDates = [];

      res.filter((leave: any) => leave.status === 'Approved') .forEach(leave => {

        let start = new Date(leave.startDate);
        let end = new Date(leave.endDate);

        while (start <= end) {

          const formatted =
            start.getFullYear() + '-' +
            String(start.getMonth() + 1).padStart(2, '0') + '-' +
            String(start.getDate()).padStart(2, '0');

          this.leaveDates.push(formatted);

          start.setDate(start.getDate() + 1);
        }

      });

      console.log("Leave Dates:", this.leaveDates);

    },
    error: err => console.error(err)
  });

}

isLeaveDay(day: number): boolean {

  const date =
    this.currentYear + '-' +
    String(this.currentMonth).padStart(2,'0') + '-' +
    String(day).padStart(2,'0');
    if (this.weekoffDates.includes(date)) {
    return false;
  }

  return this.leaveDates.includes(date);
}

loadEvents() {
  this.adminService.getEvents()
    .subscribe({
      next: (res) => {
        this.events = res;
      },
      error: (err) => {
        console.error('Error loading events', err);
      }
    });
}



  messages: ChatMessage[] = [
    {
      sender: 'Bot',
      text: '🤖 Hi! I am HRMS, an AI assistant.\nAsk me anything about Cortracker HRMS 😊\n🌐 cortracker.com'
    }
  ];

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.showEmojiPicker = false;
  }

  openModules() {
    this.showIntro = false;
    this.showModules = true; // stays visible
  }

  sendMessage() {
    const msg = this.userMessage.trim();
    if (!msg) return;

    this.messages.push({ sender: 'User', text: msg });

    if (['hi','hai','hello','hey'].includes(msg.toLowerCase())) {
      this.messages.push({
        sender: 'Bot',
        text: '😊 Hi! What can I help you with today?'
      });
    } else {
      this.messages.push({
        sender: 'Bot',
        text: '🤖 Please click **View Modules** to explore HRMS features.'
      });
    }

    this.userMessage = '';
    this.showEmojiPicker = false;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string) {
    this.userMessage += emoji;
    this.showEmojiPicker = false;
  }

  triggerFileUpload() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.messages.push({
        sender: 'User',
        attachmentName: file.name
      });
    }
  }


 loadDashboard() {

  this.adminService.getDashboardEmployees(this.companyId)
    .subscribe({
      next: (res: any) => {
        this.dashboardData = res;
      },
      error: (err) => {
        console.error("Dashboard API error", err);
      }
    });

}
}

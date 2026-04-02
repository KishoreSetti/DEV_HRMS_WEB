import { Component , ViewChild, ElementRef} from '@angular/core';
import { HRMS_MODULES,HrmsModule } from '../../core/chatbot-routes';
import { Router } from '@angular/router';
import { AdminService } from '../../admin/servies/admin.service';
import { EmployeeResignationService } from '../employee-profile/employee-services/employee-resignation.service';
import { HelpdeskService } from '../helpdesk/service/helpdesk.service';
import { Chart } from 'chart.js/auto';
import { TimesheetService } from '../timesheet/service/timesheet.service';
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
  profileImage: string = '';
  profileInitials: string = '';
  employeeName: string = '';
  employeeCode: string = '';
  departmentName: string = '';
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
 submittedTimesheets: any[] = [];

leaveTypes: any[] = [];
userLeaves: any[] = [];

get pendingLeaves() {
  return this.userLeaves.filter((leave: any) => {
    const status = leave.status?.toString().trim().toLowerCase();
    return !status || status === 'pending';
  });
}

leaveSummaries: Array<{ leaveTypeName: string; totalDays: number; usedDays: number; availableDays: number; }> = [];

leaveApprovalSummary = {
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0
};
todayAttendance = {
  status: 'Absent',
  checkInTime: '--',
  workingHours: '0h'
};
managerMessages: Array<{ title: string; message: string; date: string }> = [];
hrAnnouncements: Array<{ headline: string; detail: string; date: string }> = [];
attendanceRecords: any[] = [];
attendanceChart: any;

  modules = [];
    constructor(private helpdeskService: HelpdeskService,
      private EmployeeResignationService: EmployeeResignationService
      ,private adminService: AdminService
      ,private timesheetService: TimesheetService) {}
ngOnInit(){
  this.currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  this.companyId = this.currentUser.companyId;
  this.userId = Number(sessionStorage.getItem('UserId')); // ✅ store in class variable
  this.profileImage = sessionStorage.getItem(`profileImage_${this.userId}`) || '';
  this.employeeName = this.currentUser.fullName || this.currentUser.Name || sessionStorage.getItem('Name') || '';
  this.employeeCode = this.currentUser.employeeCode || this.currentUser.EmployeeCode || sessionStorage.getItem('EmployeeCode') || '';
  this.departmentName = this.currentUser.departmentName || this.currentUser.DepartmentName || sessionStorage.getItem('DepartmentName') || '';
  this.profileInitials = this.getProfileInitials(this.employeeName);
  this.loadDashboard();
    this.loadEvents();
    // this.loadManagerMessages();
    // this.loadHrAnnouncements();
this.loadAttendance();
   this.generateCalendar();


  if (this.userId) {
    this.loadUserLeaves(this.userId);
    this.loadMyTickets();
    this.loadMyTimesheets();
  }
  this.loadWeekoffs(this.companyId, this.currentUser.regionId);
  this.loadLeaveTypes(this.companyId, this.currentUser.regionId);
}
private getProfileInitials(name: string): string {
  if (!name) {
    return 'EU';
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

isWeekoffDay(day: number): boolean {

  const date =
    this.currentYear + '-' +
    String(this.currentMonth).padStart(2, '0') + '-' +
    String(day).padStart(2, '0');

  return this.weekoffDates.includes(date);
}

loadLeaveTypes(companyId: number, regionId: number) {
  this.EmployeeResignationService.getLeaveTypes(companyId, regionId)
    .subscribe({
      next: (res: any) => {
        this.leaveTypes = res?.data || res || [];
        console.log('Dashboard leaveTypes loaded:', this.leaveTypes);
        this.updateLeaveSummaries();
      },
      error: (err) => {
        console.error('Failed to load leave types in dashboard', err);
      }
    });
}

private updateLeaveSummaries() {
  const summaryMap = new Map<string, { leaveTypeName: string; totalDays: number; usedDays: number; }>();

  this.leaveTypes.forEach((type: any) => {
    const leaveTypeName = (type.leaveTypeName ?? type.LeaveTypeName ?? type.leaveType ?? '').toString().trim();
    if (!leaveTypeName) return;
    const totalDays = Number(type.leaveDays ?? type.LeaveDays ?? 0);
    summaryMap.set(leaveTypeName, {
      leaveTypeName,
      totalDays,
      usedDays: 0
    });
  });

  this.userLeaves
    .filter(x => x.status?.toString().toLowerCase() === 'approved')
    .forEach((leave: any) => {
      const leaveTypeName = (leave.leaveTypeName ?? leave.leaveType ?? leave.LeaveTypeName ?? '').toString().trim();
      const summary = summaryMap.get(leaveTypeName);
      if (!summary) return;

      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

      let current = new Date(start);
      let days = 0;
      while (current <= end) {
        days++;
        current.setDate(current.getDate() + 1);
      }
      summary.usedDays += days;
    });

  this.leaveSummaries = Array.from(summaryMap.values()).map(s => ({
    ...s,
    availableDays: Math.max(s.totalDays - s.usedDays, 0)
  }));
}
private computeLeaveApprovalSummary() {
  let approved = 0;
  let rejected = 0;
  let pending = 0;

  this.userLeaves.forEach((x: any) => {
    const status = x.status?.toString().trim().toLowerCase();
    if (status === 'approved') {
      approved++;
    } else if (status === 'rejected') {
      rejected++;
    } else {
      pending++;
    }
  });

  this.leaveApprovalSummary = {
    approved,
    rejected,
    pending,
    total: this.userLeaves.length
  };
}
loadMyTimesheets() {
    this.timesheetService.gettimesheetlisting(this.userId).subscribe(res => {
         console.log("Timesheet API Response:", res); // ✅ DEBUG

    const data = res.data || res; // ✅ handle both cases

      this.submittedTimesheets = res.map((row: any) => ({
        ...row,
        timesheetDate: new Date(row.timesheetDate),
        projects: row.projects.map((p: any) => ({
          ...p,
          otHoursText: p.otHoursText ?? '0 Hours'
        }))
      }));
    });
  }
  private formatTime(value: string): string {
  if (!value) {
    return '--';
  }

  const normalized = value.trim();
  const ampmMatch = normalized.match(/(AM|PM)$/i);

  if (ampmMatch) {
    return normalized.toUpperCase();
  }

  const parts = normalized.split(':');
  if (parts.length >= 2) {
    let hours = Number(parts[0]);
    const minutes = parts[1].substring(0,2);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2,'0')}:${minutes} ${suffix}`;
  }

  return normalized;
}

private calculateHours(startTime: string, endTime: string): string {
  if (!startTime || !endTime) {
    return '0';
  }

  const parse = (value: string) => {
    const normalized = value.trim();
    const ampmMatch = normalized.match(/(AM|PM)$/i);

    if (ampmMatch) {
      const date = new Date(`1970-01-01 ${normalized}`);
      return date.getHours() + date.getMinutes() / 60;
    }

    const [h, m] = normalized.split(':').map(x => Number(x));
    return h + (m || 0) / 60;
  };

  const start = parse(startTime);
  const end = parse(endTime);
  if (isNaN(start) || isNaN(end)) {
    return '0';
  }

  const diff = Math.max(end - start, 0);
  return diff.toFixed(1);
}

private updateTodayAttendance() {
  const clockIn = this.attendanceRecords.find((r: any) => r.actionType?.toString().toLowerCase() === 'clockin');
  const clockOut = this.attendanceRecords.find((r: any) => r.actionType?.toString().toLowerCase() === 'clockout');
  const wfhRecord = this.attendanceRecords.find((r: any) =>
    r.location?.toString().toLowerCase().includes('wfh') ||
    r.isWorkFromHome ||
    r.workMode?.toString().toLowerCase() === 'wfh' ||
    r.attendanceType?.toString().toLowerCase().includes('wfh')
  );

  let status = 'Absent';
  let checkInTime = '--';
  let workingHours = '0h';

  if (wfhRecord && !clockIn) {
    status = 'WFH';
  }

  if (clockIn) {
    status = wfhRecord ? 'WFH' : 'Present';
    checkInTime = this.formatTime(clockIn.actionTime || clockIn.actionTimeText || clockIn.checkInTime || '');
    if (clockOut) {
      workingHours = `${this.calculateHours(clockIn.actionTime || clockIn.actionTimeText || clockIn.checkInTime || '', clockOut.actionTime || clockOut.actionTimeText || clockOut.checkOutTime || '')}h`;
    }
  }

  this.todayAttendance = {
    status,
    checkInTime,
    workingHours
  };
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

        this.updateTodayAttendance();
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

      this.userLeaves = res || [];
      this.updateLeaveSummaries();
      this.computeLeaveApprovalSummary();
      this.leaveDates = [];

      res.filter(x => x.status === 'Approved')
      .forEach(leave => {

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
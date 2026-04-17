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
  today: Date = new Date();
  activeTab: string = 'timesheet';

  currentUser: any;
  userId!: number;
  companyId!: number;

  dashboardData: any = {};

  employeeName = '';
  profileImage = '';
  profileInitials = '';

  todayAttendance = {
    status: 'Absent',
    workingHours: '0'
  };

  attendanceRecords: any[] = [];
  attendanceChart: any;

  userLeaves: any[] = [];

  leaveApprovalSummary = {
    approved: 0,
    pending: 0,
    rejected: 0
  };

  leaveCards: any[] = [];

  statCards: any[] = [];

  tickets: any[] = [];
  submittedTimesheets: any[] = [];
  totalWorkedHours: string = '0';
  liveTimer: any;
  baseWorkedMinutes: number = 0;  
  liveWorkedMinutes: number = 0; 
  displayHours: number = 0;
  displayMinutes: number = 0;

  constructor(
    private adminService: AdminService,
    private empService: EmployeeResignationService,
    private helpdeskService: HelpdeskService,
    private timesheetService: TimesheetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

    this.userId = Number(sessionStorage.getItem('UserId'));
    this.companyId = this.currentUser.companyId;

    this.employeeName = this.currentUser.fullName || '';
    this.profileImage = sessionStorage.getItem(`profileImage_${this.userId}`) || '';
    this.profileInitials = this.getInitials(this.employeeName);

    this.loadDashboard();
    this.loadAttendance();
    this.loadLeaves();
    this.loadTickets();
    this.loadTimesheets();
  }
  formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);

  return `${year}-${month}-${day}`;
}
timeToMinutes(time: string): number {
  const [h, m, s] = time.split(':').map(Number);
  return (h * 60) + m + (s || 0) / 60;
}
calculateTotalWorkedMinutes(records: any[]): number {
  let total = 0;
  let lastIn: string | null = null;

  for (let r of records) {

    if (r.actionType === 'ClockIn') {
      lastIn = r.actionTime;
    }

    if (r.actionType === 'ClockOut' && lastIn) {
      const start = this.timeToMinutes(lastIn);
      const end = this.timeToMinutes(r.actionTime);

      if (end > start) {
        total += (end - start);
      }

      lastIn = null;
    }
  }

  return total;
}

  // ================= DASHBOARD =================
  loadDashboard() {
    this.adminService.getEmployeesByDate(
    this.companyId,
    this.currentUser.regionId,
    this.formatDate(this.today)
  ).subscribe((res: any) => {

    const data = res?.data || res || [];

    let fullPresent = 0;
    let halfPresent = 0;
    let absent = 0;

    data.forEach((emp: any) => {
      const status = emp.status?.toLowerCase();

      if (status === 'present') {
        // if backend has halfday flag, check it
        if (emp.isHalfDay === true || status.includes('half')) {
          halfPresent++;
        } else {
          fullPresent++;
        }
      } 
      else if (status === 'halfday' || status.includes('half')) {
        halfPresent++;
      } 
      else {
        absent++;
      }
    });

    const totalPresent = fullPresent + halfPresent;

    this.statCards = [
      { label: 'Total Employees', value: data.length, icon: 'fas fa-users' },
      { label: 'Present', value: `${totalPresent} (F:${fullPresent}, H:${halfPresent})`, icon: 'fas fa-user-check' },
      { label: 'Absent', value: absent, icon: 'fas fa-user-times' },
      { label: 'Today Hours', value: '0h 0m',  icon: 'fas fa-clock' }
    ];

  });
  }

  // ================= ATTENDANCE =================
  loadAttendance() {
    this.empService.getTodayByEmployee(this.currentUser.employeeCode, this.companyId, this.currentUser.regionId)
      .subscribe((res: any) => {
        this.attendanceRecords = res || [];
        this.baseWorkedMinutes = this.calculateTotalWorkedMinutes(this.attendanceRecords);
        this.liveWorkedMinutes = this.baseWorkedMinutes;
        this.updateTodayHoursCard();
        this.startLiveTimer();
        this.updateAttendance();
        this.createChart();
        this.loadDashboard();
      });
  }
  startLiveTimer() {
  if (this.liveTimer) {
    clearInterval(this.liveTimer);
  }
this.liveTimer = setInterval(() => {

  const base = this.calculateTotalWorkedMinutes(this.attendanceRecords);

  const lastIn = [...this.attendanceRecords]
    .filter(x => x.actionType === 'ClockIn')
    .pop();

  const lastOut = [...this.attendanceRecords]
    .filter(x => x.actionType === 'ClockOut')
    .pop();

  let extra = 0;

  const isWorking =
  lastIn &&
  (!lastOut || new Date(`1970-01-01T${lastIn.actionTime}`) >
               new Date(`1970-01-01T${lastOut.actionTime}`));

  if (isWorking && lastIn) {
    const start = this.timeToMinutes(lastIn.actionTime);

    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();

    extra = current - start;
  }

  const total = base + extra;

  this.displayHours = Math.floor(total / 60);
  this.displayMinutes = total % 60;

  this.totalWorkedHours = `${this.displayHours}h ${this.displayMinutes}m`;
  this.statCards = [...this.statCards];

  this.updateTodayHoursCard(); // 🔥 IMPORTANT

}, 1000);
}
updateTodayHoursCard() {
  const total = `${this.displayHours}h ${this.displayMinutes}m`;
  const card = this.statCards.find(x => x.label === 'Today Hours');
  if (card) {
    card.value = this.totalWorkedHours;
    this.statCards = [...this.statCards];
  }
}

  updateAttendance() {
    const inTime = this.attendanceRecords.find(x => x.actionType === 'ClockIn');
    const outTime = this.attendanceRecords.find(x => x.actionType === 'ClockOut');

    if (inTime) {
      this.todayAttendance.status = 'Present';

      if (outTime) {
        const hours = this.calculateHours(inTime.actionTime, outTime.actionTime);
        this.todayAttendance.workingHours = hours;
      }
    }
  }

  calculateHours(start: string, end: string): string {
    const s = start.split(':').map(Number);
    const e = end.split(':').map(Number);

    const total = (e[0] + e[1]/60) - (s[0] + s[1]/60);
    return Math.max(total, 0).toFixed(1);
  }

  createChart() {
    if (this.attendanceChart) {
      this.attendanceChart.destroy();
    }

    const hours = parseFloat(this.todayAttendance.workingHours) || 0;

    this.attendanceChart = new Chart("attendanceChart", {
      type: 'bar',
      data: {
        labels: ['Today'],
        datasets: [{
          label: 'Working Hours',
          data: [hours]
        }]
      }
    });
  }

  // ================= LEAVES =================
  loadLeaves() {
    this.empService.getUserLeaves(this.userId)
      .subscribe((res: any[]) => {
        this.userLeaves = res || [];
        this.calculateLeaveSummary();
      });
  }

  calculateLeaveSummary() {
    let approved = 0, pending = 0, rejected = 0;

    this.userLeaves.forEach(l => {
      const s = l.status?.toLowerCase();
      if (s === 'approved') approved++;
      else if (s === 'rejected') rejected++;
      else pending++;
    });

    this.leaveApprovalSummary = { approved, pending, rejected };

    this.leaveCards = [
      { label: 'Approved', value: approved, icon: 'fas fa-check-circle' },
      { label: 'Pending', value: pending, icon: 'fas fa-hourglass-half' },
      { label: 'Rejected', value: rejected, icon: 'fas fa-times-circle' }
    ];
  }

  // ================= TICKETS =================
  loadTickets() {
    this.helpdeskService.getMyTickets(this.userId)
      .subscribe(res => this.tickets = res || []);
  }

  // ================= TIMESHEETS =================
  loadTimesheets() {
    this.timesheetService.gettimesheetlisting(this.userId)
      .subscribe((res: any) => {
        const data = res?.data || res || [];
        this.submittedTimesheets = data.map((t: any) => ({
          ...t,
          timesheetDate: new Date(t.timesheetDate)
        }));
      });
  }

  // ================= UTILS =================
  getInitials(name: string): string {
    if (!name) return 'NA';
    const parts = name.split(' ');
    return parts.length > 1
      ? parts[0][0] + parts[1][0]
      : parts[0][0];
  }
  
  ngOnDestroy() {
  if (this.liveTimer) {
    clearInterval(this.liveTimer);
  }
}
  
}
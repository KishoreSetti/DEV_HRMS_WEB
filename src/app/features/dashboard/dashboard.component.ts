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

  constructor(
    private adminService: AdminService,
    private empService: EmployeeResignationService,
    private helpdeskService: HelpdeskService,
    private timesheetService: TimesheetService
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

  // ================= DASHBOARD =================
  loadDashboard() {
    this.adminService.getDashboardEmployees(this.companyId)
      .subscribe((res: any) => {
        this.dashboardData = res || {};

        this.statCards = [
          { label: 'Total Employees', value: res.totalEmployees || 0, icon: 'fas fa-users' },
          { label: 'Present', value: res.presentCount || 0, icon: 'fas fa-user-check' },
          { label: 'Absent', value: res.absentCount || 0, icon: 'fas fa-user-times' },
          { label: 'Today Hours', value: this.todayAttendance.workingHours, icon: 'fas fa-clock' }
        ];
      });
  }

  // ================= ATTENDANCE =================
  loadAttendance() {
    this.empService.getTodayByEmployee(this.currentUser.employeeCode, this.companyId, this.currentUser.regionId)
      .subscribe((res: any) => {
        this.attendanceRecords = res || [];
        this.updateAttendance();
        this.createChart();
      });
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
}
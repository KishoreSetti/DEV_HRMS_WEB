import { Component } from '@angular/core';
import { EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';
import { AdminService } from '../../../admin/servies/admin.service';
export interface LeaveCalendar {
  leaveRequestId: number;
  userId: number;            // maps to UserId in backend DTO
  employeeName: string;
  leaveTypeName: string;
  startDate: string;        // "yyyy-MM-dd"
  endDate: string;          // "yyyy-MM-dd"
  totalDays: number;
  status: string;           // Pending|Approved|Rejected
  fileName?: string;
  filePath?: string;
}
@Component({
  selector: 'app-leave-calendar',
  standalone: false,
  templateUrl: './leave-calendar.component.html',
  styleUrl: './leave-calendar.component.css'
})
export class LeaveCalendarComponent {
// currentDate: Date = new Date();
//   selectedView: 'month' | 'week' | 'day' = 'month';
//   currentMonth: number = this.currentDate.getMonth();
//   currentYear: number = this.currentDate.getFullYear();
//   dates: { dateStr: string, day: string }[] = [];
//   weeks: (number | null)[][] = [];
 
//   employees: { userId: number, employeeName: string }[] = [];
//   selectedEmployee: number = 0; // 0 = All, else userId

//   // tooltip
//   tooltipVisible = false;
//   tooltipX = 0;
//   tooltipY = 0;
//   tooltipLeaves: LeaveCalendar[] = [];

//   // Sample leave data
//   leaveData: LeaveCalendar[] = [];
//   constructor(private leaveService: EmployeeResignationService) {}


//   ngOnInit(): void {
//     const userId = Number(sessionStorage.getItem('UserId') || 0);
//     if (!userId) {
//       console.error('UserId missing in sessionStorage');
//       return;
//     }

//     // generate month grid
//     this.generateMonthDates(this.currentYear, this.currentMonth);

//     // Try manager leaves first — if manager has employees, treat as manager view.
//     this.leaveService.getManagerLeaves(userId).subscribe({
//       next: (mgrRes) => {
//         // if any leaves returned OR there are distinct employees, treat as manager view
//         if (Array.isArray(mgrRes) && mgrRes.length > 0) {
//           this.processManagerLeaves(mgrRes);
//         } else {
//           // mgrRes empty — still check if maybe manager but no leaves: try building employees from endpoint response shape is empty => fallback to user
//           // Fallback to user leaves
//           this.loadUserLeaves(userId);
//         }
//       },
//       error: (err) => {
//         // On error (likely not manager) just load user leaves
//         console.warn('GetManagerLeaves failed, loading user leaves', err);
//         this.loadUserLeaves(userId);
//       }
//     });
//   }
//   loadUserLeaves(userId: number) {
//     this.leaveService.getUserLeaves(userId).subscribe({
//       next: (res: any[]) => {
//         // backend returns LeaveRequestDto style - map to our model
//         this.leaveData = (res || []).map(x => this.mapBackendToModel(x));
//         // employee dropdown remains single employee (self)
//         const name = this.leaveData.length ? this.leaveData[0].employeeName : (sessionStorage.getItem('UserName') || 'You');
//         this.employees = [{ userId, employeeName: name }];
//         this.selectedEmployee = userId;
//       },
//       error: err => console.error('GetUserLeaves error', err)
//     });
//   }

//   processManagerLeaves(raw: any[]) {
//     // Map leaves
//     this.leaveData = (raw || []).map(x => this.mapBackendToModel(x));

//     // Build unique employee list
//     const map = new Map<number, string>();
//     this.leaveData.forEach(l => {
//       if (!map.has(l.userId)) map.set(l.userId, l.employeeName);
//     });

//     this.employees = [{ userId: 0, employeeName: 'All Employees' }, ...Array.from(map.entries()).map(([userId, name]) => ({ userId, employeeName: name }))];
//     this.selectedEmployee = 0; // show all by default
//   }
//   mapBackendToModel(x: any): LeaveCalendar {
//     return {
//       leaveRequestId: x.leaveRequestId ?? x.leaveRequestID ?? x.leaveRequestId,
//       userId: x.userId ?? x.userID ?? x.userId ?? x.employeeId ?? 0,
//       employeeName: x.employeeName ?? x.employeeName ?? `${x.firstName || ''} ${x.lastName || ''}`.trim(),
//       leaveTypeName: x.leaveTypeName ?? x.leaveType ?? x.leaveTypeName ?? 'Leave',
//       startDate: (x.startDate || x.startDateString || x.start)?.toString().substring(0,10),
//       endDate: (x.endDate || x.endDateString || x.end)?.toString().substring(0,10),
//       totalDays: Number(x.totalDays ?? x.totalDays),
//       status: x.status ?? x.statusName ?? 'Pending',
//       fileName: x.fileName,
//       filePath: x.filePath
//     };
//   }


//   // =================== Month View ===================
//  // ------------------ Month generation -----------------

//   generateMonthDates(year: number, month: number) {
//     this.weeks = [];
//     const firstDay = new Date(year, month, 1).getDay();
//     const lastDate = new Date(year, month + 1, 0).getDate();
//     let day = 1 - firstDay;

//     for (let w = 0; w < 6; w++) {
//       const week: (number|null)[] = [];
//       for (let d = 0; d < 7; d++) {
//         week.push(day > 0 && day <= lastDate ? day : null);
//         day++;
//       }
//       this.weeks.push(week);
//     }
//   }

//   prevMonth() {
//     if (this.currentMonth === 0) {
//       this.currentMonth = 11;
//       this.currentYear--;
//     } else this.currentMonth--;
//     this.generateMonthDates(this.currentYear, this.currentMonth);
//   }

//   nextMonth() {
//     if (this.currentMonth === 11) {
//       this.currentMonth = 0;
//       this.currentYear++;
//     } else this.currentMonth++;
//     this.generateMonthDates(this.currentYear, this.currentMonth);
//   }

//   // ------------------ Helpers for rendering -----------------

//   // returns leaves that fall on the given day number in current month/year, filtered by selectedEmployee
//   getDayLeavesByNumber(day: number|null): LeaveCalendar[] {
//     if (!day) return [];

//     const dateStr = `${this.currentYear}-${(this.currentMonth+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
//     return this.leaveData.filter(l => {
//       return l.startDate <= dateStr && l.endDate >= dateStr &&
//         (this.selectedEmployee === 0 || l.userId === this.selectedEmployee);
//     });
//   }

//   // used in your template previously -> hasLeave(day) returns boolean or list; we'll use this to set CSS classes
//   hasLeave(day: number|null) {
//     return this.getDayLeavesByNumber(day).length > 0;
//   }

//   // weekend check (sat=6 sun=0)
//   isWeekendForDay(day: number|null) {
//     if (!day) return false;
//     const d = new Date(this.currentYear, this.currentMonth, day);
//     const wd = d.getDay();
//     return wd === 0 || wd === 6;
//   }

//   isToday(day: number|null) {
//     if (!day) return false;
//     const today = new Date();
//     return day === today.getDate() && this.currentMonth === today.getMonth() && this.currentYear === today.getFullYear();
//   }

//   // Week view helpers
//   getWeekDates(startDate: Date) {
//     const week = [];
//     // start from Sunday of that week
//     const start = new Date(startDate);
//     start.setDate(startDate.getDate() - startDate.getDay());
//     for (let i=0;i<7;i++){
//       const d = new Date(start);
//       d.setDate(start.getDate() + i);
//       week.push({ dateStr: d.toISOString().substring(0,10), day: d.toLocaleString('en-US',{ weekday: 'short' }) });
//     }
//     return week;
//   }

//   getDayLeaves(dateStr: string) {
//     return this.leaveData.filter(l => l.startDate <= dateStr && l.endDate >= dateStr &&
//       (this.selectedEmployee === 0 || l.userId === this.selectedEmployee));
//   }

//   // ------------------ Tooltip (hover) -----------------

//   onCellMouseEnter(event: MouseEvent, day: number|null) {
//     if (!day) { this.tooltipVisible = false; return; }
//     const leaves = this.getDayLeavesByNumber(day);
//     if (!leaves || leaves.length === 0) { this.tooltipVisible = false; return; }

//     this.tooltipLeaves = leaves;
//     this.tooltipVisible = true;
//     // position
//     this.tooltipX = event.clientX + 12;
//     this.tooltipY = event.clientY + 12;
//   }

//   onCellMouseMove(event: MouseEvent) {
//     if (!this.tooltipVisible) return;
//     this.tooltipX = event.clientX + 12;
//     this.tooltipY = event.clientY + 12;
//   }

//   onCellMouseLeave() {
//     this.tooltipVisible = false;
//     this.tooltipLeaves = [];
//   }

//   // ------------------ Color utility -----------------

//   getStatusClass(status: string) {
//     switch ((status||'').toLowerCase()) {
//       case 'approved': return 'status-approved';
//       case 'pending': return 'status-pending';
//       case 'rejected': return 'status-rejected';
//       default: return 'status-pending';
//     }
//   }

//   // click a leave item -> optionally open details or download; placeholder
//   onLeaveClick(l: LeaveCalendar) {
//     // example: open modal or go to leave details
//     console.log('Leave clicked', l);
//   }
currentDate: Date = new Date();
  selectedView: 'month' | 'week' | 'day' = 'month';
  currentMonth: number = this.currentDate.getMonth();
  currentYear: number = this.currentDate.getFullYear();
  dates: { dateStr: string, day: string }[] = [];
  weeks: (number | null)[][] = [];
 
  employees: { userId: number, employeeName: string }[] = [];
  selectedEmployee: number = 0; // 0 = All, else userId

  // Weekoffs (Sat/Sun or custom configured days)
  weekoffDays: Set<string> = new Set();

  // tooltip
  tooltipVisible = false;
  tooltipX = 0;
  tooltipY = 0;
  tooltipLeaves: LeaveCalendar[] = [];
companyId = Number(sessionStorage.getItem('CompanyId') || 0);
regionId = Number(sessionStorage.getItem('RegionId') || 0);
  // Sample leave data
  leaveData: LeaveCalendar[] = [];
  constructor(private leaveService: EmployeeResignationService, private adminService: AdminService) {}


  ngOnInit(): void {
    const userId = Number(sessionStorage.getItem('UserId') || 0);
    if (!userId) {
      console.error('UserId missing in sessionStorage');
      return;
    }

    // Load weekoffs (used in calendar rendering and leave-day calculations)
    this.loadWeekoffs(userId);

    // generate month grid
    this.generateMonthDates(this.currentYear, this.currentMonth);

    


    // Try manager leaves first — if manager has employees, treat as manager view.
    this.leaveService.getManagerLeaves(userId).subscribe({
      next: (mgrRes) => {
        // if any leaves returned OR there are distinct employees, treat as manager view
        if (Array.isArray(mgrRes) && mgrRes.length > 0) {
          this.processManagerLeaves(mgrRes);
        } else {
          // mgrRes empty — still check if maybe manager but no leaves: try building employees from endpoint response shape is empty => fallback to user
          // Fallback to user leaves
          this.loadUserLeaves(userId);
        }
      },
      error: (err) => {
        // On error (likely not manager) just load user leaves
        console.warn('GetManagerLeaves failed, loading user leaves', err);
        this.loadUserLeaves(userId);
      }
    });
  }
  loadUserLeaves(userId: number) {
    this.leaveService.getUserLeaves(userId).subscribe({
      next: (res: any[]) => {
        // backend returns LeaveRequestDto style - map to our model
        this.leaveData = (res || []).map(x => this.mapBackendToModel(x))
        .filter(l => l.status === 'Approved');
        // employee dropdown remains single employee (self)
        const name = this.leaveData.length ? this.leaveData[0].employeeName : (sessionStorage.getItem('UserName') || 'You');
        this.employees = [{ userId, employeeName: name }];
        this.selectedEmployee = userId;
      },
      error: err => console.error('GetUserLeaves error', err)
    });
  }

  private loadWeekoffs(userId: number) {
    this.adminService.getWeekoffLists(this.companyId, this.regionId).subscribe({
      next: (res: any) => {
        const data = res?.data || [];
        const days: string[] = [];

        data.forEach((w: any) => {
          const value = (w.weekoffDate ?? w.WeekoffDate ?? '').toString().trim();
          if (!value) return;

          days.push(value);
          if (value.length >= 3) days.push(value.substring(0, 3));
        });

        this.weekoffDays = new Set(days.map(d => d.toLowerCase()));
      },
      error: (err:any) => {
        console.error('Weekoffs load error', err);
      }
    });
  }

  processManagerLeaves(raw: any[]) {
    // Map leaves
    this.leaveData = (raw || []).map(x => this.mapBackendToModel(x))
    .filter(l => l.status === 'Approved');

    // Build unique employee list
    const map = new Map<number, string>();
    this.leaveData.forEach(l => {
      if (!map.has(l.userId)) map.set(l.userId, l.employeeName);
    });

    this.employees = [{ userId: 0, employeeName: 'All Employees' }, ...Array.from(map.entries()).map(([userId, name]) => ({ userId, employeeName: name }))];
    this.selectedEmployee = 0; // show all by default
  }
  mapBackendToModel(x: any): LeaveCalendar {
    return {
      leaveRequestId: x.leaveRequestId ?? x.leaveRequestID ?? x.leaveRequestId,
      userId: x.userId ?? x.userID ?? x.userId ?? x.employeeId ?? 0,
      employeeName: x.employeeName ?? x.employeeName ?? `${x.firstName || ''} ${x.lastName || ''}`.trim(),
      leaveTypeName: x.leaveTypeName ?? x.leaveType ?? x.leaveTypeName ?? 'Leave',
      startDate: (x.startDate || x.startDateString || x.start)?.toString().substring(0,10),
      endDate: (x.endDate || x.endDateString || x.end)?.toString().substring(0,10),
      totalDays: Number(x.totalDays ?? x.totalDays),
      status: x.status ?? x.statusName ?? 'Pending',
      fileName: x.fileName,
      filePath: x.filePath
    };
  }


  // =================== Month View ===================
 // ------------------ Month generation -----------------

  generateMonthDates(year: number, month: number) {
    this.weeks = [];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    let day = 1 - firstDay;

    for (let w = 0; w < 6; w++) {
      const week: (number|null)[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(day > 0 && day <= lastDate ? day : null);
        day++;
      }
      this.weeks.push(week);
    }
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else this.currentMonth--;
    this.generateMonthDates(this.currentYear, this.currentMonth);
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else this.currentMonth++;
    this.generateMonthDates(this.currentYear, this.currentMonth);
  }

  // ------------------ Helpers for rendering -----------------

  // returns leaves that fall on the given day number in current month/year, filtered by selectedEmployee
  getDayLeavesByNumber(day: number|null): LeaveCalendar[] {
    if (!day) return [];
if (this.isWeekendForDay(day)) return [];
    const dateStr = `${this.currentYear}-${(this.currentMonth+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
    return this.leaveData.filter(l => {
          return l.status === 'Approved' &&   // ✅ ADD THIS LINE

       l.startDate <= dateStr && l.endDate >= dateStr &&
        (this.selectedEmployee === 0 || l.userId === this.selectedEmployee);
    });
  }

  // used in your template previously -> hasLeave(day) returns boolean or list; we'll use this to set CSS classes
  hasLeave(day: number|null) {
    return this.getDayLeavesByNumber(day).length > 0;
  }

  private isWeekoffName(dayName: string): boolean {
    const name = (dayName || '').toString().trim().toLowerCase();

    // default to Sat/Sun when weekoff configuration not loaded yet
    if (!this.weekoffDays || this.weekoffDays.size === 0) {
      return name === 'saturday' || name === 'sunday' || name === 'sat' || name === 'sun';
    }

    return this.weekoffDays.has(name);
  }

  private isWeekoffDate(date: Date): boolean {
    const weekdayLong = date.toLocaleString('en-US', { weekday: 'long' });
    const weekdayShort = date.toLocaleString('en-US', { weekday: 'short' });
    return this.isWeekoffName(weekdayLong) || this.isWeekoffName(weekdayShort);
  }

  // weekend check (configurable weekoff days)
  isWeekendForDay(day: number|null) {
    if (!day) return false;
    const d = new Date(this.currentYear, this.currentMonth, day);
    return this.isWeekoffDate(d);
  }

  isToday(day: number|null) {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && this.currentMonth === today.getMonth() && this.currentYear === today.getFullYear();
  }

  // Week view helpers
  getWeekDates(startDate: Date) {
    const week = [];
    // start from Sunday of that week
    const start = new Date(startDate);
    start.setDate(startDate.getDate() - startDate.getDay());
    for (let i=0;i<7;i++){
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      week.push({ dateStr: d.toISOString().substring(0,10), day: d.toLocaleString('en-US',{ weekday: 'short' }) });
    }
    return week;
  }

  getDayLeaves(dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime()) || this.isWeekoffDate(date)) {
      return [];
    }

    return this.leaveData.filter(l =>l.status === 'Approved' && l.startDate <= dateStr && l.endDate >= dateStr &&
      (this.selectedEmployee === 0 || l.userId === this.selectedEmployee));
  }

  // ------------------ Tooltip (hover) -----------------

  onCellMouseEnter(event: MouseEvent, day: number|null) {
    if (!day) { this.tooltipVisible = false; return; }
    const leaves = this.getDayLeavesByNumber(day);
    if (!leaves || leaves.length === 0) { this.tooltipVisible = false; return; }

    this.tooltipLeaves = leaves;
    this.tooltipVisible = true;
    // position
    this.tooltipX = event.clientX + 12;
    this.tooltipY = event.clientY + 12;
  }

  onCellMouseMove(event: MouseEvent) {
    if (!this.tooltipVisible) return;
    this.tooltipX = event.clientX + 12;
    this.tooltipY = event.clientY + 12;
  }

  onCellMouseLeave() {
    this.tooltipVisible = false;
    this.tooltipLeaves = [];
  }

  // ------------------ Color utility -----------------

  getStatusClass(status: string) {
    switch ((status||'').toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  // click a leave item -> optionally open details or download; placeholder
  onLeaveClick(l: LeaveCalendar) {
    // example: open modal or go to leave details
    console.log('Leave clicked', l);
  }
}

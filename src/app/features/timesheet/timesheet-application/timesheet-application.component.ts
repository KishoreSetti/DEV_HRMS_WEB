import { Component, OnInit } from '@angular/core';

import { TimesheetService } from '../service/timesheet.service';

export interface TimesheetProject {
  projectName: string;
  description?: string;
  startTime: string;
  endTime: string;

  totalHours: string;
  totalHoursText?: string;
  totalMinutes?: number;

  overtimeHours?: string;
  otMinutes?: number;
  otHoursText?: string;
}

export interface TimesheetModel {
  employeeName: string;
  employeeCode: string;
  date: string;
  comments?: string;
  attachment?: File | null;
  projects: TimesheetProject[];
  status: string;
   hrEmail?: string;
}
@Component({
  selector: 'app-timesheet-application',
  standalone: false,
  templateUrl: './timesheet-application.component.html',
  styleUrl: './timesheet-application.component.css'
})
export class TimesheetApplicationComponent {
model: TimesheetModel = {
    employeeName: '',
    employeeCode: '',
    date: '',
    comments: '',
    attachment: null,
    projects: [],
    status: 'Pending'
  };

  userId!: number;
  companyId!: number;
  regionId!: number;

  submittedTimesheets: any[] = [];
  selectedTimesheet: any = null;

  // Sorting
  sortColumn: keyof TimesheetModel | 'totalHoursText' | 'otHoursText' | 'timesheetDate' | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];
 todayDate: string = '';
  constructor(private timesheetService: TimesheetService) {}

  ngOnInit(): void {
    const today = new Date();
  this.todayDate = today.toISOString().split('T')[0];
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    this.loadMyTimesheets();

    this.timesheetService.getLoggedInUser(this.userId).subscribe(res => {
      this.model.employeeName = res.employeeName;
      this.model.employeeCode = res.employeeCode;
    });

       this.model.employeeName = sessionStorage.getItem('Name') || '';
      this.model.employeeCode = sessionStorage.getItem('EmployeeCode') || '';
  }

  // ================= TIME HELPERS =================
  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return (h * 60) + m;
  }

  private minutesToHHMM(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // ================= PROJECT ACTIONS =================
  addProject() {
    this.model.projects.push({
      projectName: '',
      description: '',
      startTime: '',
      endTime: '',
      totalHours: '00:00',
      totalHoursText: '0 Hours',
      overtimeHours: '',
      otMinutes: 0,
      otHoursText: '0 Hours'
    });
  }

  removeProject(index: number) {
    this.model.projects.splice(index, 1);
  }

  // ================= HOURS CALC =================
  calculateProjectHours(project: TimesheetProject) {
    if (project.startTime && project.endTime) {
      let start = this.timeToMinutes(project.startTime);
      let end = this.timeToMinutes(project.endTime);
      if (end < start) end += 1440;
      const diff = end - start;
      project.totalMinutes = diff;
      project.totalHours = this.minutesToHHMM(diff);
      project.totalHoursText = `${Math.floor(diff / 60)} Hours ${diff % 60} Minutes`;
    }

    const raw = project.overtimeHours?.trim();
    if (!raw) {
      project.otMinutes = 0;
      project.otHoursText = '0 Hours';
      return;
    }

    let minutes = 0;
    if (raw.includes(':')) {
      const parts = raw.split(':').map(Number);
      if (!isNaN(parts[0]) && !isNaN(parts[1])) {
        minutes = (parts[0] * 60) + parts[1];
      }
    } else if (!isNaN(Number(raw))) {
      minutes = Math.round(Number(raw) * 60);
    }

    project.otMinutes = minutes;
    project.otHoursText = `${Math.floor(minutes / 60)} Hours ${minutes % 60} Minutes`;
  }

  // ================= SAVE =================
  saveTimesheet(form: any) {
    if (!form.valid || this.model.projects.length === 0) {
      alert('Please complete the form');
      return;
    }

    const formData = new FormData();
    formData.append('UserId', this.userId.toString());
    formData.append('CompanyId', this.companyId.toString());
    formData.append('RegionId', this.regionId.toString());
    formData.append('EmployeeCode', this.model.employeeCode);
    formData.append('EmployeeName', this.model.employeeName);
    formData.append('TimesheetDate', this.model.date);
    formData.append('Comments', this.model.comments ?? '');
    formData.append('Status', 'Pending');
    formData.append('HrEmail', this.model.hrEmail || '');

    if (this.model.attachment) {
      formData.append('Attachment', this.model.attachment);
    }

    this.model.projects.forEach((p, i) => {
      this.calculateProjectHours(p);
      formData.append(`Projects[${i}].ProjectName`, p.projectName);
      formData.append(`Projects[${i}].Description`, p.description || '');
      formData.append(`Projects[${i}].StartTime`, p.startTime);
      formData.append(`Projects[${i}].EndTime`, p.endTime);
      formData.append(`Projects[${i}].TotalMinutes`, String(p.totalMinutes ?? 0));
      formData.append(`Projects[${i}].TotalHoursText`, p.totalHoursText ?? '0 Hours');
      formData.append(`Projects[${i}].OTMinutes`, String(p.otMinutes ?? 0));
      formData.append(`Projects[${i}].OTHoursText`, p.otHoursText ?? '0 Hours');
    });

    this.timesheetService.submittimesheet(formData).subscribe({
      next: () => {
        alert('Timesheet saved successfully');
        form.resetForm();
        this.model.projects = [];
        this.loadMyTimesheets();
      },
      error: err => {
        console.error(err);
        alert('Save failed');
      }
    });
  }
  isFormValid(): boolean {

  if (!this.model.date) return false;

  if (!this.model.projects || this.model.projects.length === 0) return false;

  for (let p of this.model.projects) {

    if (!p.projectName) return false;
    if (!p.description) return false;
    if (!p.startTime) return false;
    if (!p.endTime) return false;

  }

  return true;
}

  onFileSelect(event: any) {
    this.model.attachment = event.target.files[0];
  }

  // ================= LOAD TIMESHEETS =================
  loadMyTimesheets() {
    this.timesheetService.gettimesheetlisting(this.userId).subscribe(res => {
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

  // ================= SELECT ALL =================
  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.submittedTimesheets.forEach(row => {
      if (row.status === 'Pending') row.selected = checked;
    });
  }

  sendSelectedTimesheets() {
    const selectedIds = this.submittedTimesheets.filter(x => x.selected).map(x => x.timesheetId);
    if (!selectedIds.length) {
      alert("Select at least one pending timesheet");
      return;
    }
    this.timesheetService.sendSelectedTimesheets(selectedIds).subscribe({
      next: () => {
        alert("Timesheets sent successfully");
        this.loadMyTimesheets();
      },
      error: err => {
        console.error(err);
        alert("Failed to send timesheets");
      }
    });
  }

  // ================= SORTING =================
  sortBy(column: keyof TimesheetModel | 'totalHoursText' | 'otHoursText' | 'timesheetDate') {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortedTimesheets() {
    let data = [...this.submittedTimesheets];
    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        let valA = a[this.sortColumn!];
        let valB = b[this.sortColumn!];

        if (this.sortColumn === 'timesheetDate') {
          valA = new Date(valA);
          valB = new Date(valB);
        }

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }

  // ================= PAGINATION =================
  filteredTimesheets() {
    const sorted = this.getSortedTimesheets();
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.submittedTimesheets.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }
  openViewModal(row: any) {
  this.selectedTimesheet = row;
}
closeViewModal() {
  this.selectedTimesheet = null;
}
}

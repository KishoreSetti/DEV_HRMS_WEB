import { Component, OnInit } from '@angular/core';
import { TimesheetService } from '../features/timesheet/service/timesheet.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from '../admin/servies/admin.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { environment } from '../../environments/environment';

interface EmployeeOption {
  userId: number;
  employeeCode: string;
  fullName: string;
}

@Component({
  selector: 'app-timesheet-report',
  standalone: false,
  templateUrl: './timesheet-report.component.html',
  styleUrl: './timesheet-report.component.css'
})
export class TimesheetReportComponent implements OnInit {
 filtersForm!: FormGroup;
  timesheets: any[] = [];
  filteredTimesheets: any[] = [];
  
  // Employee dropdown
  employees: EmployeeOption[] = [];
  
  // UI
  noRecordsFound = false;

  // Sorting
  sortColumn: string = 'timesheetDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  pageSize = 10;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];
  companyLogoBase64: string = '';
companyName: string = '';
companyAddress: string = '';

  // Summary
  totalTimesheets: number = 0;
  pendingCount: number = 0;
  submittedCount: number = 0;
  approvedCount: number = 0;
  rejectedCount: number = 0;
  totalHours: number = 0;
  totalOTHours: number = 0;

  statuses: string[] = ['Pending', 'Submitted', 'Approved', 'Rejected'];

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadEmployees();
    this.loadAllTimesheets();
    this.loadCompanyDetails(); 
  }

  loadEmployees(): void {
    this.adminService.GetcmpregAllUsers().subscribe({
      next: (res: any) => {
        this.employees = res.map((u: any) => ({
          userId: u.userId || 0,
          employeeCode: u.employeeCode || '',
          fullName: u.fullName || ''
        }));
      },
      error: (err) => {
        console.error('Error loading employees:', err);
      }
    });
  }

  onEmployeeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const userId = select.value;

    if (!userId) {
      this.filtersForm.patchValue({
        employeeName: '',
        employeeCode: ''
      });
      return;
    }

    const employee = this.employees.find(e => e.userId === +userId);
    if (employee) {
      this.filtersForm.patchValue({
        employeeName: employee.userId,
        employeeCode: employee.employeeCode
      });
    }
  }

  buildForm(): void {
    this.filtersForm = this.fb.group({
      employeeName: [''],
      employeeCode: [''],
      status: [''],
      fromDate: [''],
      toDate: ['']
    });

    this.filtersForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadAllTimesheets(): void {
    const userId = Number(sessionStorage.getItem('UserId'));
    
    this.timesheetService.getManagerTimesheets(userId).subscribe({
      next: (res) => {
        console.log('Timesheet data:', res);
        this.processTimesheets(res);
      },
      error: (err) => {
        console.error('Error loading timesheets:', err);
        this.noRecordsFound = true;
      }
    });
  }

  processTimesheets(res: any): void {
    console.log('Raw response:', res);
    
    if (!res || !Array.isArray(res)) {
      console.warn('Invalid response format');
      this.noRecordsFound = true;
      return;
    }
    
    this.timesheets = res.map((x: any) => {
      const totalMinutes = x.projects?.reduce(
        (sum: number, p: any) => sum + (Number(p.totalMinutes) || 0), 0
      ) || 0;

      const otMinutes = x.projects?.reduce(
        (sum: number, p: any) => sum + (Number(p.otMinutes) || 0), 0
      ) || 0;

      const totalHoursText = `${Math.floor(totalMinutes / 60)} Hours ${totalMinutes % 60} Minutes`;
      const otHoursText = otMinutes > 0
        ? `${Math.floor(otMinutes / 60)} Hours ${otMinutes % 60} Minutes`
        : '0 Hours';

      return {
        ...x,
        visible: true,
        timesheetDate: new Date(x.timesheetDate),
        totalMinutes,
        otMinutes,
        totalHoursText,
        otHoursText,
        employeeNameNorm: x.employeeName?.toLowerCase().trim() || '',
        employeeCodeNorm: x.employeeCode?.toLowerCase().trim() || '',
        userId: x.userId || x.employeeId || 0
      };
    });

    this.noRecordsFound = false;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    const f = this.filtersForm.value;

    // Check if employeeName is a number (userId) or string (name)
    const employeeNameValue = f.employeeName;
    const isUserIdFilter = !isNaN(Number(employeeNameValue)) && employeeNameValue !== '';
    const employeeName = isUserIdFilter ? null : (employeeNameValue?.trim().toLowerCase() || null);
    const userIdFilter = isUserIdFilter ? Number(employeeNameValue) : null;
    
    const employeeCode = f.employeeCode?.trim().toLowerCase();
    const status = f.status;
    const fromDate = f.fromDate ? new Date(f.fromDate) : null;
    const toDate = f.toDate ? new Date(f.toDate) : null;

    let visibleCount = 0;

    this.timesheets.forEach(ts => {
      const tsDate = new Date(ts.timesheetDate);
      
      // Reset time to midnight for fair comparison
      const tsDateOnly = new Date(tsDate.getFullYear(), tsDate.getMonth(), tsDate.getDate());
      const fromDateOnly = fromDate ? new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) : null;
      const toDateOnly = toDate ? new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()) : null;
      
      let matchesFromDate = true;
      let matchesToDate = true;
      
      if (fromDateOnly) {
        matchesFromDate = tsDateOnly >= fromDateOnly;
      }
      if (toDateOnly) {
        matchesToDate = tsDateOnly <= toDateOnly;
      }

      // Filter by userId if numeric, otherwise by name
      const matchesEmployee = userIdFilter 
        ? (ts.userId === userIdFilter)
        : (!employeeName || ts.employeeNameNorm.includes(employeeName));

      ts.visible =
        matchesEmployee &&
        (!employeeCode || ts.employeeCodeNorm.includes(employeeCode)) &&
        (!status || ts.status === status) &&
        matchesFromDate &&
        matchesToDate;

      if (ts.visible) visibleCount++;
    });

    this.filteredTimesheets = this.timesheets.filter(ts => ts.visible);
    this.calculateSummary();
    this.sortData();
    this.noRecordsFound = visibleCount === 0;
    this.currentPage = 1;
  }

  calculateSummary(): void {
    this.totalTimesheets = this.filteredTimesheets.length;
    this.pendingCount = this.filteredTimesheets.filter(ts => ts.status === 'Pending').length;
    this.submittedCount = this.filteredTimesheets.filter(ts => ts.status === 'Submitted').length;
    this.approvedCount = this.filteredTimesheets.filter(ts => ts.status === 'Approved').length;
    this.rejectedCount = this.filteredTimesheets.filter(ts => ts.status === 'Rejected').length;
    
    this.totalHours = this.filteredTimesheets.reduce((sum, ts) => sum + (ts.totalMinutes || 0), 0);
    this.totalOTHours = this.filteredTimesheets.reduce((sum, ts) => sum + (ts.otMinutes || 0), 0);
  }

  sortData(): void {
    if (!this.sortColumn) return;

    this.filteredTimesheets.sort((a, b) => {
      const aVal: any = a[this.sortColumn];
      const bVal: any = b[this.sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number') {
        comparison = (aVal as number) - (bVal as number);
      } else if (aVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortData();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  get paginatedTimesheets(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTimesheets.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTimesheets.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.filtersForm.reset();
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Submitted': return 'status-submitted';
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  }

  formatHours(minutes: number): string {
    return `${Math.floor(minutes / 60)} Hours ${minutes % 60} Minutes`;
  }
  loadCompanyDetails() {
  const companyId = Number(sessionStorage.getItem('CompanyId'));

  this.adminService.getCompanyById(companyId).subscribe({
    next: async (company: any) => {

      this.companyName = company?.companyName || 'Company';
      this.companyAddress = company?.companyAddress || '';

      const logo = company?.companyLogo;

      if (logo && logo.trim() !== '') {

        if (logo.startsWith('data:')) {
          this.companyLogoBase64 = logo;
        } else {
          const logoPath = logo.replace(/\\/g, '/');
          const fullUrl = `${environment.baseurl}/${logoPath}`;

          this.companyLogoBase64 =
            await this.getBase64ImageFromURL(fullUrl);
        }

      } else {
        this.setDefaultLogo();
      }
    },
    error: () => this.setDefaultLogo()
  });
}
setDefaultLogo() {
  const defaultLogo = '/assets/images/cor-logo.png';

  this.getBase64ImageFromURL(defaultLogo)
    .then(base64 => this.companyLogoBase64 = base64)
    .catch(() => this.companyLogoBase64 = '');
}
getBase64ImageFromURL(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = err => reject(err);
  });
}

  downloadPDF(): void {

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const data = this.filteredTimesheets;

  /* ================= BORDER ================= */
  doc.setDrawColor(200, 0, 0);
  doc.setLineWidth(1);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

  let y = 15;

  /* ================= COMPANY LOGO ================= */
  if (this.companyLogoBase64) {
    doc.addImage(this.companyLogoBase64, 'PNG', pageWidth / 2 - 20, 8, 40, 15);
  }

  /* ================= COMPANY NAME ================= */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(200, 0, 0);
  doc.text(this.companyName?.toUpperCase() || 'COMPANY', 20, y);

  /* ================= ADDRESS ================= */
  doc.setFontSize(9);
  doc.setTextColor(100);

  let addressY = y + 6;   // 👈 moved slightly down for better spacing

  if (this.companyAddress) {
    const lines = this.companyAddress.split(',');

    lines.forEach((l) => {
      doc.text(l.trim(), 20, addressY);
      addressY += 4;
    });
  }

  /* ================= RIGHT SIDE INFO ================= */
  doc.setTextColor(0);
  doc.setFontSize(10);

  doc.text(
    `Print Date: ${new Date().toLocaleDateString()}`,
    pageWidth - 20,
    y,
    { align: 'right' }
  );

  doc.text(
    `Timesheet Report`,
    pageWidth - 20,
    y + 5,
    { align: 'right' }
  );

  /* ================= RED LINE (FIXED POSITION) ================= */
  const lineY = addressY + 4; // 👈 KEY FIX: line goes below address

  doc.setDrawColor(200, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(20, lineY, pageWidth - 20, lineY);

  /* ================= TABLE ================= */

  const rows = data.map(ts => [
    ts.employeeName,
    ts.employeeCode,
    ts.timesheetDate ? new Date(ts.timesheetDate).toLocaleDateString() : '',
    ts.totalHoursText,
    ts.otHoursText,
    ts.status
  ]);

  autoTable(doc, {
    startY: lineY + 8, // 👈 table starts below line
    head: [['Employee', 'Code', 'Date', 'Total Hours', 'OT Hours', 'Status']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [200, 0, 0] }
  });

  /* ================= FOOTER ================= */
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    `© ${this.companyName} — System Generated Timesheet Report`,
    pageWidth / 2,
    finalY,
    { align: 'center' }
  );

  doc.save('Timesheet_Report.pdf');
}

  exportToExcel(): void {
    const data = this.filteredTimesheets.map(ts => ({
      'Employee Name': ts.employeeName || '',
      'Employee ID': ts.employeeCode || '',
      'Date': ts.timesheetDate ? new Date(ts.timesheetDate).toLocaleDateString() : '',
      'Total Hours': ts.totalHoursText || '',
      'OT Hours': ts.otHoursText || '',
      'Status': ts.status || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet Report');
    XLSX.writeFile(wb, 'timesheet-report.xlsx');
  }


  
  
}

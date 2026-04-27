import { Component } from '@angular/core';
import { AdminService } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-attendance-list',
  standalone: false,
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.css'
})
export class AttendanceListComponent {
  selectedDate: string = '';
  unsavedDates: string[] = [];
  fromDate: string = '';
  toDate: string = '';
  companyLogo: string = '';
  companyLogoBase64: string = '';
  todayDate: Date = new Date();

  employees: any[] = [];
  reports: any[] = [];

  showReport = false;

  companyId!: number;
  regionId!: number;
  shiftName?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;

  constructor(private adminService: AdminService, private employeeResignationService: EmployeeResignationService) { }

  // ================= EMPLOYEE PAGINATION =================

  currentPage = 1;
  itemsPerPage = 10;

  get paginatedEmployees() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.employees.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.employees.length / this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  // ================= REPORT PAGINATION =================

  reportPage = 1;
  reportPerPage = 5;

  get paginatedReports() {
    const start = (this.reportPage - 1) * this.reportPerPage;
    return this.reports.slice(start, start + this.reportPerPage);
  }

  get reportTotalPages() {
    return Math.ceil(this.reports.length / this.reportPerPage);
  }

  changeReportPage(page: number) {
    if (page >= 1 && page <= this.reportTotalPages) {
      this.reportPage = page;
    }
  }

  previousPage() {
    if (this.reportPage > 1) {
      this.reportPage--;
    }
  }

  nextPage() {
    if (this.reportPage < this.reportTotalPages) {
      this.reportPage++;
    }
  }

  // ================= INIT =================

  ngOnInit(): void {

    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    this.selectedDate = new Date().toISOString().split('T')[0];

    this.loadEmployeesByDate();
    this.checkUnsavedDates();

    //this.loadEmployees();
    this.loadPermission();  // ✅ ADD THIS
    if (!this.canView) {
      Swal.fire("Access Denied", "You don't have permission", "error");
      return;
    }
    this.loadCompanyLogo();

  }
  loadCompanyLogo() {
  const companyId = Number(sessionStorage.getItem('CompanyId'));

  this.adminService.getCompanyById(companyId).subscribe({
    next: async (company: any) => {

      const logo = company?.companyLogo;

      if (logo && logo.trim() !== '') {

        if (logo.startsWith('data:')) {
          this.companyLogo = logo;
          this.companyLogoBase64 = logo;
        } else {
          const logoPath = logo.replace(/\\/g, '/');
          this.companyLogo = `${environment.baseurl}/${logoPath}`;

          this.companyLogoBase64 =
            await this.getBase64ImageFromURL(this.companyLogo);
        }

      } else {
        this.setDefaultLogo();
      }
    },
    error: () => {
      this.setDefaultLogo();
    }
  });
}
setDefaultLogo() {
  this.companyLogo = '/assets/images/cor-logo.png';

  this.getBase64ImageFromURL(this.companyLogo)
    .then(base64 => this.companyLogoBase64 = base64)
    .catch(() => this.companyLogoBase64 = '');
}

  // ================= checkUnsavedDates =================

  checkUnsavedDates() {

    this.adminService.getUnsavedDates(this.companyId, this.regionId)
      .subscribe((res: any) => {
        console.log('checkUnsavedDates', res)
        this.unsavedDates = res;
      });
  }

  // ================= loadEmployeesByDate =================

  loadEmployeesByDate() {

    Swal.fire({
      title: 'Loading Attendance...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.adminService.getEmployeesByDate(
      this.companyId,
      this.regionId,
      this.selectedDate
    ).subscribe({
      next: (res: any) => {
        console.log('loadEmployeesByDate', res)

        Swal.close();

        this.employees = res;
        this.loadShiftDetailsForEmployees();
      },
      error: () => {
        Swal.close();
        Swal.fire("Error", "Failed to load attendance", "error");
      }
    });
  }

  // ================= onDateChange =================

  onDateChange() {
    // When date changes → reload attendance
    this.loadEmployeesByDate();

    // refresh unsaved warning
    this.checkUnsavedDates();
  }

  // ================= LOAD EMPLOYEES =================

  loadEmployees() {
    Swal.fire({
      title: 'Loading Employees...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.adminService.getEmployees(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {

          Swal.close();

          console.log(res);

          this.employees = res;
          // 👇 ADD THIS LINE
          this.loadShiftDetailsForEmployees();

          if (this.employees.length === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'No Employees',
              text: 'No employees found',
              timer: 3000,
              showConfirmButton: false
            });
          }

        },
        error: (err) => {

          Swal.close();

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load employees',
            timer: 3000,
            showConfirmButton: false
          });

          console.error(err);
        }
      });
  }

  // ================= SAVE ATTENDANCE =================

  saveAllAttendance() {
    if (!this.canCreate) {
      Swal.fire("No Permission", "You cannot save attendance", "warning");
      return;
    }

    const employees = this.employees.map(emp => ({
      ...emp,
      clockIn: emp.clockIn || null,
      clockOut: emp.clockOut || null,
      grossTime: emp.grossTime || null
    }));

    const payload = {
      companyId: this.companyId,
      regionId: this.regionId,
      attendanceDate: this.selectedDate, // ✅ ONLY THIS (IMPORTANT)
      employees: employees
    };

    this.adminService.saveAttendance(payload).subscribe({
      next: () => {
        Swal.fire("Success", "Attendance saved successfully", "success");

        this.checkUnsavedDates(); // ✅ refresh warning
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // ================= WEEKLY REPORT =================

  weekly() {

    Swal.fire({
      title: 'Fetching Weekly Report...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.adminService.weeklyReport(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {

          Swal.close();

          this.reports = res;
          this.showReport = true;

          // Reset to first page
          this.reportPage = 1;
        },
        error: (err) => {

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load weekly report',
            timer: 3000,
            showConfirmButton: false
          });

          console.error(err);
        }
      });
  }

  // ================= MONTHLY REPORT =================

  monthly() {

    Swal.fire({
      title: 'Fetching Monthly Report...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.adminService.monthlyReport(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {

          Swal.close();

          this.reports = res;
          this.showReport = true;

          // Reset page
          this.reportPage = 1;
        },
        error: (err) => {

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load monthly report',
            timer: 3000,
            showConfirmButton: false
          });

          console.error(err);
        }
      });
  }


  /// Seacrch reports by dates
  searchReport() {

    if (!this.fromDate || !this.toDate) {
      alert("Please select From Date and To Date");
      return;
    }

    this.adminService
      .dateRangeReport(this.companyId, this.regionId, this.fromDate, this.toDate)
      .subscribe((res: any) => {

        console.log(res);

        this.reports = Array.isArray(res) ? res : (res?.data || []);

        this.showReport = true;   // ✅ IMPORTANT FIX
        this.reportPage = 1;

      });
  }


  loadShiftDetailsForEmployees() {

    this.employees.forEach(emp => {

      this.employeeResignationService
        .getShiftallocationNameForClockInOut(
          emp.employeeCode,
          this.companyId,
          this.regionId
        )
        .subscribe({
          next: (res: any) => {
            emp.shiftName = res.shiftName;
            emp.shiftStartTime = res.shiftStartTime;
            emp.shiftEndTime = res.shiftEndTime;

                 // ✅ ADD THIS
          emp.graceTime = res.grassTime;

          // ✅ VERY IMPORTANT
          this.calculateLate(emp);

          },
          error: () => {
            emp.shiftName = '';
            emp.shiftStartTime = '';
            emp.shiftEndTime = '';
          }
        });

    });

  }

calculateLate(emp: any) {

  if (!emp.clockIn || !emp.shiftStartTime || !emp.graceTime) {
    emp.lateMinutes = 0;
    return;
  }

  const [sh, sm] = emp.shiftStartTime.split(':').map(Number);
  const shiftStart = new Date();
  shiftStart.setHours(sh, sm, 0, 0);

  const [gh, gm] = emp.graceTime.split(':').map(Number);
  const graceEnd = new Date(shiftStart.getTime() + ((gh * 60 + gm) * 60000));

  const [ih, im] = emp.clockIn.split(':').map(Number);
  const clockIn = new Date();
  clockIn.setHours(ih, im, 0, 0);

  if (clockIn > graceEnd) {
    const diff = clockIn.getTime() - graceEnd.getTime();
    emp.lateMinutes = Math.floor(diff / (1000 * 60));
  } else {
    emp.lateMinutes = 0;
  }
}


  getLateLoginText(emp: any): string {

    if (emp.lateMinutes && emp.lateMinutes > 0) {
      return `(Late by ${emp.lateMinutes} mins)`;
    }

    return '';
  }

  getMonthYearText(): string {
    if (!this.fromDate) return '';

    const date = new Date(this.fromDate);

    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    return `For the Month of ${month} ${year}`;
  }

  getTodayDate(): string {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    return `${day}-${month}-${year}`; // format: DD-MM-YYYY
  }

  downloadPDF() {

    if (!this.fromDate || !this.toDate) {
      Swal.fire("Warning", "Please select From Date and To Date", "warning");
      return;
    }

    // ✅ If data not loaded → fetch first
    if (!this.reports || this.reports.length === 0) {

      this.adminService
        .dateRangeReport(this.companyId, this.regionId, this.fromDate, this.toDate)
        .subscribe((res: any) => {

          this.reports = Array.isArray(res) ? res : (res?.data || []);

          if (this.reports.length === 0) {
            Swal.fire("No Data", "No records to export", "warning");
            return;
          }

          this.generatePDF(); // ✅ call actual function
        });

    } else {
      this.generatePDF();
    }
  }

async generatePDF() {

  const now = new Date();
  const today = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  const monthText = this.getMonthYearText();

  const doc = new jsPDF();

  const logoBase64 = this.companyLogoBase64;

  const pageWidth = doc.internal.pageSize.getWidth();

  // ================= LOGO =================
  doc.addImage(logoBase64, 'PNG', pageWidth / 2 - 20, 5, 40, 15);

  // ================= DOWNLOADED TEXT (RIGHT SIDE) =================
  doc.setFontSize(9);
  doc.text(`Downloaded: ${today} ${time}`, pageWidth - 60, 12);

  // ================= TITLE =================
  doc.setFontSize(14);
  doc.text(
    `Attendance Report ${monthText}`,
    pageWidth / 2,
    28,
    { align: 'center' }   // ✅ center align
  );

  // ================= DATE RANGE =================
  doc.setFontSize(10);
  doc.text(
    `From: ${this.fromDate}   To: ${this.toDate}`,
    pageWidth / 2,
    35,
    { align: 'center' }   // ✅ center align
  );

  // ================= TABLE =================
  const tableData = this.reports.map((r: any) => [
    r.employeeCode,
    r.employeeName,
    `${r.shiftName} (${r.shiftStartTime} - ${r.shiftEndTime})`,
    new Date(r.attendanceDate).toLocaleDateString(),
    r.clockIn,
    r.lateMinutes ? `Late by ${this.formatLateMinutes(r.lateMinutes)}` : '',
    r.clockOut,
    r.grossTime,
    r.status
  ]);

autoTable(doc, {
  startY: 45,

  head: [[
    'Emp Code', 'Emp Name', 'Shift', 'Date',
    'Clock In', 'Late Arrivals', 'Clock Out', 'Gross Time', 'Status'
  ]],

  body: tableData,

  // ✅ IMPORTANT: Add full grid (borders)
  theme: 'plain',

  // ✅ Global styles (applies to all cells)
  styles: {
    fontSize: 9,
    cellPadding: 3,
    halign: 'center',     // horizontal align
    valign: 'middle',     // vertical align
    lineWidth: 0.2,       // border thickness
    lineColor: [0, 0, 0]  // border color (black)
  },

  // ✅ Header styling
  headStyles: {
    fillColor: [200, 0, 0],       // red
    textColor: [255, 255, 255],   // white
    halign: 'center',
    valign: 'middle',
    fontStyle: 'bold',
    lineWidth: 0.3
  },

  // ✅ Column specific alignment (VERY IMPORTANT)
  columnStyles: {
    0: { halign: 'center' }, // Emp Code
    1: { halign: 'left' },   // Emp Name
    2: { halign: 'center' },   // Shift
    3: { halign: 'center' }, // Date
    4: { halign: 'center' }, // Clock In
    5: { halign: 'center' }, // Late
    6: { halign: 'center' }, // Clock Out
    7: { halign: 'center' }, // Gross Time
    8: { halign: 'center' }  // Status
  },


  didParseCell: function (data: any) {
  // Body only (skip header)
  if (data.section === 'body') {

    // 👉 Make Employee Name bold (column index 1)
    if (data.column.index === 1) {
      data.cell.styles.fontStyle = 'bold';
    }

    // 👉 Make Status bold (column index 8)
    if (data.column.index === 8) {
      data.cell.styles.fontStyle = 'bold';
    }
  }
}

  // ✅ Alternate row color (optional but nice)
  // alternateRowStyles: {
  //   fillColor: [245, 245, 245]
  // }
});

  // ================= FOOTER =================
  const finalY = (doc as any).lastAutoTable.finalY || 30;

  doc.setFontSize(9);
  doc.text(
    `Generated on: ${today} at ${time}`,
    14,
    finalY + 10
  );

  doc.save(`Attendance_Report_${this.fromDate}_to_${this.toDate}_${today}.pdf`);
}

  downloadExcel() {

    if (!this.fromDate || !this.toDate) {
      Swal.fire("Warning", "Please select From Date and To Date", "warning");
      return;
    }

    if (!this.reports || this.reports.length === 0) {

      this.adminService
        .dateRangeReport(this.companyId, this.regionId, this.fromDate, this.toDate)
        .subscribe((res: any) => {

          this.reports = Array.isArray(res) ? res : (res?.data || []);

          if (this.reports.length === 0) {
            Swal.fire("No Data", "No records to export", "warning");
            return;
          }

          this.generateExcel(); // ✅ call generator
        });

    } else {
      this.generateExcel();
    }
  }

  generateExcel() {

    const now = new Date();
    const today = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    const monthText = this.getMonthYearText();

    const headerData = [
      [`Attendance Report ${monthText}`],
      [`From: ${this.fromDate}   To: ${this.toDate}`],
      [`Downloaded On: ${today} ${time}`],
      []
    ];

    const reportData = this.reports.map((r: any) => ({
      'Employee Code': r.employeeCode,
      'Employee Name': r.employeeName,
      'Shift': `${r.shiftName} (${r.shiftStartTime} - ${r.shiftEndTime})`,
      'Date': new Date(r.attendanceDate).toLocaleDateString(),
      'Clock In': r.clockIn,
      'Late': r.lateMinutes ? `Late by ${this.formatLateMinutes(r.lateMinutes)}` : '',
      'Clock Out': r.clockOut,
      'Gross Time': r.grossTime,
      'Status': r.status
    }));

    const worksheet = XLSX.utils.json_to_sheet([]);

    // ✅ Add header
    XLSX.utils.sheet_add_aoa(worksheet, headerData, { origin: 'A1' });

    // ✅ Add table
    XLSX.utils.sheet_add_json(worksheet, reportData, { origin: 'A5' });

    const workbook = {
      Sheets: { 'Attendance Report': worksheet },
      SheetNames: ['Attendance Report']
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, `Attendance_Report_${this.fromDate}_to_${this.toDate}_${today}.xlsx`);
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


  canView: boolean = false;
  canCreate: boolean = false;

  loadPermission() {

    const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

    const menu = menus.find((m: any) =>
      m.menuName?.trim().toLowerCase() === "attendance list"
    );

    if (menu) {
      this.canView = menu.canView;
      this.canCreate = menu.canAdd;
    }
  }

formatLateMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return '';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  return `${mins} minute${mins > 1 ? 's' : ''}`;
}

getStatusClass(status: string): string {

  if (!status) return '';

  status = status.toLowerCase();

  if (status === 'present') return 'badge-present';

  if (status === 'absent') return 'badge-absent';

  if (status === 'Halfday' || status === 'Half day') return 'badge-Halfday';

  if (status.includes('leave')) return 'badge-leave'; // casual, sick, LOP etc.

  if (status === 'weekoff') return 'badge-weekoff';

  return 'badge-default';
}

get visibleReportPages(): number[] {
  const pages = [];
  const maxVisible = 6;

  let start = Math.max(this.reportPage - Math.floor(maxVisible / 2), 1);
  let end = start + maxVisible - 1;

  if (end > this.reportTotalPages) {
    end = this.reportTotalPages;
    start = Math.max(end - maxVisible + 1, 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
}

goToReportFirst() {
  this.reportPage = 1;
}

goToReportLast() {
  this.reportPage = this.reportTotalPages;
  console.log("Reports:", this.reports.length);
console.log("Total Pages:", this.reportTotalPages);
}
}

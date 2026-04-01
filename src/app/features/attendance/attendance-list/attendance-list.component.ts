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

@Component({
  selector: 'app-attendance-list',
  standalone: false,
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.css'
})
export class AttendanceListComponent {
  fromDate: string = '';
  toDate: string = '';

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

    this.loadEmployees();
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

    const employees = this.employees.map(emp => ({
      ...emp,
      clockIn: emp.clockIn || null,
      clockOut: emp.clockOut || null,
      grossTime: emp.grossTime || null
    }));

    const payload = {
      companyId: this.companyId,
      regionId: this.regionId,
      attendanceDate: new Date().toISOString().split('T')[0],
      employees: employees
    };

    this.adminService.saveAttendance(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Attendance saved successfully'
        });
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
          },
          error: () => {
            emp.shiftName = '';
            emp.shiftStartTime = '';
            emp.shiftEndTime = '';
          }
        });

    });

  }
  getLateLoginText(emp: any): string {

    if (emp.lateMinutes && emp.lateMinutes > 0) {
      return `(Late by ${emp.lateMinutes} mins)`;
    }

    return '';
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

  generatePDF() {

    const today = this.getTodayDate(); // today's date

    const doc = new jsPDF();

    // ✅ Title
    doc.setFontSize(14);
    doc.text('Attendance Report', 14, 10);

    // ✅ Date range
    doc.setFontSize(10);
    doc.text(`From: ${this.fromDate}  To: ${this.toDate}`, 14, 16);

    // ✅ Downloaded date (TOP RIGHT)
    doc.text(`Downloaded: ${today}`, 140, 10);

    const tableData = this.reports.map((r: any) => [
      r.employeeCode,
      r.employeeName,
      `${r.shiftName} (${r.shiftStartTime} - ${r.shiftEndTime})`,
      new Date(r.attendanceDate).toLocaleDateString(),
      r.clockIn,
      r.lateMinutes ? `Late by ${r.lateMinutes} mins` : '',
      r.clockOut,
      r.grossTime,
      r.status
    ]);

    autoTable(doc, {
      startY: 22, // ✅ push table down
      head: [[
        'Emp Code', 'Emp Name', 'Shift', 'Date', 'Clock In', 'Late', 'Clock Out', 'Gross Time', 'Status'
      ]],
      body: tableData
    });

    // ✅ Footer (BOTTOM)
    const finalY = (doc as any).lastAutoTable.finalY || 30;
    doc.text(`Generated on: ${today}`, 14, finalY + 10);

    doc.save(`Attendance_Report_${this.fromDate}_to_${this.toDate}_Downloaded_${today}.pdf`);
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

    const today = this.getTodayDate();

    // ✅ Add header rows manually
    const headerData = [
      ['Attendance Report'],
      [`From: ${this.fromDate}   To: ${this.toDate}`],
      [`Downloaded On: ${today}`],
      [] // empty row
    ];

    const reportData = this.reports.map((r: any) => ({
      'Employee Code': r.employeeCode,
      'Employee Name': r.employeeName,
      'Shift': `${r.shiftName} (${r.shiftStartTime} - ${r.shiftEndTime})`,
      'Date': new Date(r.attendanceDate).toLocaleDateString(),
      'Clock In': r.clockIn,
      'Late': r.lateMinutes ? `Late by ${r.lateMinutes} mins` : '',
      'Clock Out': r.clockOut,
      'Gross Time': r.grossTime,
      'Status': r.status
    }));

    const worksheet = XLSX.utils.json_to_sheet([]);

    // ✅ Add header first
    XLSX.utils.sheet_add_aoa(worksheet, headerData, { origin: 'A1' });

    // ✅ Add table below header
    XLSX.utils.sheet_add_json(worksheet, reportData, { origin: 'A5' });

    const workbook = {
      Sheets: { 'Attendance Report': worksheet },
      SheetNames: ['Attendance Report']
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const file = new Blob([excelBuffer], {
      type: 'application/octet-stream'
    });

    saveAs(file, `Attendance_Report_${this.fromDate}_to_${this.toDate}_Downloaded_${today}.xlsx`);
  }
}
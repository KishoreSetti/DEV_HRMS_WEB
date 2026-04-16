import { Component, OnInit } from '@angular/core';
import { EmployeePayRollService } from '../../../../employee-pay-roll.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-payslip-template',
  standalone: false,
  templateUrl: './payslip-template.component.html',
  styleUrl: './payslip-template.component.css'
})
export class PayslipTemplateComponent {
  userId!: number;

  month: number | null = null;
  year: number | null = null;

  payrollList: any[] = [];

  currentPage = 1;
  pageSize = 5;

  employees: any[] = [];
  selectedPayroll: any = null;
  isLoading = false;
  isPreviewDone = false;
  isProcessed = false;
  departments: any[] = [];
  designations: any[] = [];

  departmentMap: { [key: number]: string } = {};
  designationMap: { [key: number]: string } = {};

  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  constructor(private payrollService: EmployeePayRollService) { }

  ngOnInit(): void {
    // this.userId = Number(sessionStorage.getItem('userCompanyId'));
    this.userId = Number(sessionStorage.getItem('UserId'));
    // this.loadEmployees();
    this.loadEmployees();
    this.loadDepartments();
    this.loadDesignations();
  }
  loadEmployees() {
    this.payrollService.getEmployees(this.userId)
      .subscribe((res: any) => {
        this.employees = res || [];
        console.log("Employees Data:", this.employees);
      });
  }
  getEmployeeDisplay(employeeId: number): string {

    const emp = this.employees.find(e => e.employeeId == employeeId);

    return emp
      ? `${emp.employeeCode} - ${emp.fullName}`
      : `EMP-${employeeId}`;

  }
  getEmployee(employeeId: number) {
    return this.employees.find(e => e.userId == employeeId);
  }
  openViewPopup(p: any) {
    this.selectedPayroll = p;
  }
  loadDepartments() {
    this.payrollService.getDepartments(this.userId)
      .subscribe((res: any) => {

        console.log('Departments', res);

        if (res && res.success && Array.isArray(res.data)) {

          this.departments = res.data;

          this.departments.forEach((d: any) => {
            this.departmentMap[d.departmentId] = d.departmentName;
          });

        } else {
          this.departments = [];
        }
      });
  }

  loadDesignations() {
    this.payrollService.getDesignations(this.userId)
      .subscribe((res: any) => {

        console.log('Designations', res);

        if (res && res.success && Array.isArray(res.data)) {

          this.designations = res.data;

          this.designations.forEach((d: any) => {
            this.designationMap[d.designationId] = d.designationName;
          });

        } else {
          this.designations = [];
        }
      });
  }

  closePopup() {
    this.selectedPayroll = null;
  }
  validateInputs(): boolean {
    if (!this.month || !this.year) {
      Swal.fire('Error', 'Select Month and Year', 'error');
      return false;
    }
    return true;
  }

  getMonthName(month: number): string {
    return this.months.find(m => m.value === month)?.name || '';
  }

  previewPayroll() {
    if (!this.validateInputs()) return;

    this.isLoading = true;
    this.isPreviewDone = false;

    const payload = { month: this.month, year: this.year };

    this.payrollService.previewPayroll(this.userId, payload)
      .subscribe({
        next: (res: any) => {
          console.log('Privew Payroll Responce', res);
          this.payrollList = res || [];
          this.isPreviewDone = true;
          this.isProcessed = false;
          this.isLoading = false;
          this.currentPage = 1;
          this.isProcessed = this.isPayrollAlreadyProcessed();

        },
        error: (err: any) => {
          console.error(err);
          this.isLoading = false;
          Swal.fire('Error', 'Preview Failed', 'error');
        }
      });
  }

  processPayroll() {
    if (this.isPayrollAlreadyProcessed()) {
      Swal.fire('Info', 'Payroll already processed for selected month and year', 'info');
      return;
    }
    if (!this.validateInputs()) return;

    this.isLoading = true;

    const payload = { month: this.month, year: this.year };

    this.payrollService.processPayroll(this.userId, payload)
      .subscribe({
        next: (res: any) => {
          console.log('Process Payroll Responce', res);
          this.isProcessed = true;
          this.isLoading = false;

          Swal.fire('Success', res.message, 'success');

          this.loadPayroll();
          this.currentPage = 1;
        },
        error: (err: any) => {
          console.error('Actual error:', err);
          this.isLoading = false;
          Swal.fire('Error', 'Processing Failed', 'error');
        }
      });
  }

  loadPayroll() {
    if (!this.validateInputs()) return;

    this.isLoading = true;

    this.payrollService
      .getPayrollByMonth(this.month!, this.year!, this.userId)
      .subscribe({
        next: (res: any) => {
          this.payrollList = res || [];
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  get paginatedPayroll() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.payrollList.slice(start, start + this.pageSize);
  }


  get totalPages() {
    return Math.ceil(this.payrollList.length / this.pageSize);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  isPayrollAlreadyProcessed(): boolean {
    return this.payrollList.some(p =>
      p.status?.trim().toLowerCase() === 'processed'
    );
  }

downloadPayrollPDF() {

  if (!this.payrollList || this.payrollList.length === 0) {
    Swal.fire('Warning', 'No payroll data available', 'warning');
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4');

  // ===== HEADER =====
  doc.setFontSize(16);
  doc.setTextColor(200, 0, 0);
  doc.text('CORTRACKER IT SOLUTIONS PVT LTD', 14, 15);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 25);
  doc.text(`Month: ${this.getMonthName(this.month!)} ${this.year}`, 14, 32);

  // ===== SINGLE TABLE (SUMMARY) =====
  const tableData = this.payrollList.map(p => {

    const emp = this.getEmployee(p.employeeId);

    return [
      emp?.employeeCode,
      emp?.fullName,
      p.grossSalary,
      p.totalDeductions,
      p.attendanceDeduction,
      p.expenses,
      p.netSalary
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [[
      'Emp ID',
      'Employee Name',
      'Earnings',
      'Deductions',
      'Attendance',
      'Expenses',
      'Net Salary'
    ]],
    body: tableData,
    theme: 'grid',

    styles: {
      fontSize: 10
    },

    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      halign: 'center'
    }
  });

  doc.save(`Payroll_${this.month}_${this.year}.pdf`);
}

  downloadPayrollExcel() {

    if (!this.payrollList || this.payrollList.length === 0) {
      Swal.fire('Warning', 'No payroll data available', 'warning');
      return;
    }

    const data = this.payrollList.map(p => {

      const emp = this.getEmployee(p.employeeId);

      return {
        'Emp ID': emp?.employeeCode,
        'Employee Name': emp?.fullName,

        'Earnings Details': p.details
          .filter((d: any) => d.type === 'Earning')
          .map((d: any) => `${d.componentName} (₹ ${d.amount})`)
          .join('\n'),

        'Deductions Details': p.details
          .filter((d: any) => d.type === 'Deduction')
          .map((d: any) => `${d.componentName} (₹ ${d.amount})`)
          .join('\n'),

        'Total Earnings': p.grossSalary,
        'Total Deductions': p.totalDeductions,
        'Attendance': p.attendanceDeduction,
        'Expenses': p.expenses,
        'Net Salary': p.netSalary
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);

    // =========================
    // ✅ COLUMN WIDTHS (PROPER ALIGNMENT)
    // =========================
    worksheet['!cols'] = [
      { wch: 15 }, // Emp ID
      { wch: 25 }, // Name
      { wch: 40 }, // Earnings Details
      { wch: 40 }, // Deductions Details
      { wch: 18 }, // Total Earnings
      { wch: 18 }, // Total Deductions
      { wch: 15 }, // Attendance
      { wch: 15 }, // Expenses
      { wch: 18 }  // Net Salary
    ];

    // =========================
    // ✅ WRAP TEXT (MULTILINE SUPPORT)
    // =========================
    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {

        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

        if (!worksheet[cellAddress]) continue;

        worksheet[cellAddress].s = {
          alignment: {
            wrapText: true,
            vertical: 'top'
          }
        };
      }
    }

    // =========================
    // ✅ HEADER STYLE (RED + WHITE)
    // =========================
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']!);

    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {

      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });

      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        font: {
          bold: true,
          color: { rgb: "FFFFFF" } // white
        },
        fill: {
          fgColor: { rgb: "C00000" } // red
        },
        alignment: {
          horizontal: 'center'
        }
      };
    }

    // =========================
    // ✅ CREATE WORKBOOK
    // =========================
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Report');

    XLSX.writeFile(workbook, `Payroll_${this.month}_${this.year}.xlsx`);
  }
}
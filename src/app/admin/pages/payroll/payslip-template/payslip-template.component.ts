import { Component, OnInit } from '@angular/core';
import { EmployeePayRollService } from '../../../../employee-pay-roll.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-payslip-template',
  standalone: false,
  templateUrl: './payslip-template.component.html',
  styleUrl: './payslip-template.component.css'
})
export class PayslipTemplateComponent {
//   userId!: number;

//   month: number | null = null;
//   year: number | null = null;

//   payrollList: any[] = [];

//   currentPage = 1;
//   pageSize = 5;

//   employees: any[] = [];
//   selectedPayroll: any = null;
//   isLoading = false;
//   isPreviewDone = false;
//   isProcessed = false;
//   departments: any[] = [];
//   designations: any[] = [];

//   departmentMap: { [key: number]: string } = {};
//   designationMap: { [key: number]: string } = {};

//   months = [
//     { value: 1, name: 'January' },
//     { value: 2, name: 'February' },
//     { value: 3, name: 'March' },
//     { value: 4, name: 'April' },
//     { value: 5, name: 'May' },
//     { value: 6, name: 'June' },
//     { value: 7, name: 'July' },
//     { value: 8, name: 'August' },
//     { value: 9, name: 'September' },
//     { value: 10, name: 'October' },
//     { value: 11, name: 'November' },
//     { value: 12, name: 'December' }
//   ];

//   constructor(private payrollService: EmployeePayRollService) { }

//   ngOnInit(): void {
//     this.userId = Number(sessionStorage.getItem('userCompanyId'));
//     // this.loadEmployees(); 
//     this.loadEmployees();
//     this.loadDepartments();
//     this.loadDesignations();
//   }
//   loadEmployees() {
//     this.payrollService.getEmployees(this.userId)
//       .subscribe((res:any) => {
//         this.employees = res || [];
//         console.log("Employees Data:", this.employees);
//       });
//   }
//   getEmployeeDisplay(employeeId: number): string {

//     const emp = this.employees.find(e => e.employeeId == employeeId);

//     return emp
//       ? `${emp.employeeCode} - ${emp.fullName}`
//       : `EMP-${employeeId}`;

//   }
//   getEmployee(employeeId: number) {
//     return this.employees.find(e => e.userId == employeeId);
//   }
//   openViewPopup(p: any) {
//     this.selectedPayroll = p;
//   }
//   loadDepartments() {
//     this.payrollService.getDepartments(this.userId)
//       .subscribe((res:any) => {

//         if (res && res.success && Array.isArray(res.data)) {

//           this.departments = res.data;

//           this.departments.forEach((d: any) => {
//             this.departmentMap[d.departmentId] = d.departmentName;
//           });

//         } else {
//           this.departments = [];
//         }
//       });
//   }

//   loadDesignations() {
//     this.payrollService.getDesignations(this.userId)
//       .subscribe((res:any) => {

//         if (res && res.success && Array.isArray(res.data)) {

//           this.designations = res.data;

//           this.designations.forEach((d: any) => {
//             this.designationMap[d.designationId] = d.designationName;
//           });

//         } else {
//           this.designations = [];
//         }
//       });
//   }

//   closePopup() {
//     this.selectedPayroll = null;
//   }
//   validateInputs(): boolean {
//     if (!this.month || !this.year) {
//       Swal.fire('Error', 'Select Month and Year', 'error');
//       return false;
//     }
//     return true;
//   }

//   getMonthName(month: number): string {
//     return this.months.find(m => m.value === month)?.name || '';
//   }

//   previewPayroll() {
//     if (!this.validateInputs()) return;

//     this.isLoading = true;
//     this.isPreviewDone = false;

//     const payload = { month: this.month, year: this.year };

//     this.payrollService.previewPayroll(this.userId, payload)
//       .subscribe({
//         next: (res:any) => {
//           this.payrollList = res || [];
//           this.isPreviewDone = true;
//           this.isProcessed = false;
//           this.isLoading = false;
//         },
//         error: (err:any) => {
//           console.error(err);
//           this.isLoading = false;
//           Swal.fire('Error', 'Preview Failed', 'error');
//         }
//       });
//   }

//   processPayroll() {
//     if (!this.validateInputs()) return;

//     this.isLoading = true;

//     const payload = { month: this.month, year: this.year };

//     this.payrollService.processPayroll(this.userId, payload)
//       .subscribe({
//         next: (res: any) => {
//           this.isProcessed = true;
//           this.isLoading = false;

//           Swal.fire('Success', res.message, 'success');

//           this.loadPayroll();
//         },
//         error: (err:any) => {
//           console.error('Actual error:', err);
//           this.isLoading = false;
//           Swal.fire('Error', 'Processing Failed', 'error');
//         }
//       });
//   }

//   loadPayroll() {
//     if (!this.validateInputs()) return;

//     this.isLoading = true;

//     this.payrollService
//       .getPayrollByMonth(this.month!, this.year!, this.userId)
//       .subscribe({
//         next: (res:any) => {
//           this.payrollList = res || [];
//           this.isLoading = false;
//         },
//         error: (err:any) => {
//           console.error(err);
//           this.isLoading = false;
//         }
//       });
//   }

// downloadPDF(p: any) {

//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.getWidth();

//   /* ================= SAFE HELPERS ================= */

//   const safeText = (val: any) =>
//     val === null || val === undefined ? '' : String(val);

//   const safeNumber = (val: any) => {
//     const num = Number(val);
//     return isNaN(num) ? 0 : num;
//   };

//   const currency = (val: any) => {
//     const num = Number(val);
//     return isNaN(num)
//       ? ''
//       : num.toLocaleString('en-IN', { minimumFractionDigits: 2 });
//   };

//   const monthName = this.getMonthName(this.month!);

//   /* ================= EMPLOYEE DATA ================= */

//   const emp = this.getEmployee(p.employeeId);

//   const employeeName = emp ? safeText(emp.fullName) : '';
//   const employeeCode = emp ? safeText(emp.employeeCode) : '';

//   const department =
//     emp && emp.departmentId
//       ? this.departmentMap[emp.departmentId] || ''
//       : '';

//   const designation =
//     emp && emp.designationId
//       ? this.designationMap[emp.designationId] || ''
//       : '';

//   /* ================= HEADER ================= */

//   doc.setFillColor(179, 0, 0);
//   doc.rect(0, 0, pageWidth, 35, 'F');

//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(20);
//   doc.setFont('helvetica', 'bold');
//   doc.text('PAYSLIP', 20, 22);

//   doc.setFontSize(12);
//   doc.text(`${monthName} ${this.year}`, pageWidth - 20, 22, { align: 'right' });

//   doc.setTextColor(0, 0, 0);

//   /* ================= EMPLOYEE BOX ================= */

//   doc.setDrawColor(220, 53, 69);
//   doc.rect(15, 45, pageWidth - 30, 35);

//   doc.setFontSize(11);

//   doc.setFont('helvetica', 'bold');
//   doc.text('Employee Name:', 20, 55);
//   doc.text('Employee Code:', pageWidth / 2, 55);

//   doc.setFont('helvetica', 'normal');
//   doc.text(employeeName, 20, 62);
//   doc.text(employeeCode, pageWidth / 2, 62);

//   doc.setFont('helvetica', 'bold');
//   doc.text('Department:', 20, 72);
//   doc.text('Designation:', pageWidth / 2, 72);

//   doc.setFont('helvetica', 'normal');
//   doc.text(department, 20, 79);
//   doc.text(designation, pageWidth / 2, 79);

//   /* ================= ATTENDANCE ================= */

//   doc.setFontSize(10);

//   doc.setFont('helvetica', 'bold');
//   doc.text('Working Days:', 20, 88);
//   doc.text('Present:', 60, 88);
//   doc.text('Leaves:', 100, 88);
//   doc.text('Half Days:', 140, 88);

//   doc.setFont('helvetica', 'normal');

//   doc.text(String(p.workingDays ?? 0), 20, 94);
//   doc.text(String(p.presentDays ?? 0), 60, 94);
//   doc.text(String(p.leaveDays ?? 0), 100, 94);
//   doc.text(String(p.halfDays ?? 0), 140, 94);

//   /* ================= TABLE HEADER ================= */

//   let startY = 105;

//   doc.setFillColor(255, 230, 230);
//   doc.rect(15, startY, pageWidth - 30, 10, 'F');

//   doc.setTextColor(139, 0, 0);
//   doc.setFont('helvetica', 'bold');

//   doc.text('EARNINGS', 20, startY + 7);
//   doc.text('AMOUNT', pageWidth / 2 - 10, startY + 7, { align: 'right' });

//   doc.text('DEDUCTIONS', pageWidth / 2 + 10, startY + 7);
//   doc.text('AMOUNT', pageWidth - 20, startY + 7, { align: 'right' });

//   doc.setTextColor(0, 0, 0);

//   startY += 15;

//   let earningsY = startY;
//   let deductionY = startY;

//   let totalEarnings = 0;
//   let totalDeductions = 0;

//   /* ================= DETAILS LOOP ================= */

//   (p.details || []).forEach((d: any) => {

//     const amount = safeNumber(d.amount);

//     if (d.type === 'Earning') {

//       doc.text(safeText(d.componentName), 20, earningsY);
//       doc.text(currency(amount), pageWidth / 2 - 10, earningsY, { align: 'right' });

//       totalEarnings += amount;
//       earningsY += 8;
//     }

//     if (d.type === 'Deduction') {

//       doc.text(safeText(d.componentName), pageWidth / 2 + 10, deductionY);
//       doc.text(currency(amount), pageWidth - 20, deductionY, { align: 'right' });

//       totalDeductions += amount;
//       deductionY += 8;
//     }

//   });

//   /* ================= EXPENSES (EARNINGS) ================= */

//   const expensesAmount = safeNumber(p.expenses);

//   if (expensesAmount > 0) {

//     doc.text("Expenses Reimbursement", 20, earningsY);
//     doc.text(currency(expensesAmount), pageWidth / 2 - 10, earningsY, { align: 'right' });

//     totalEarnings += expensesAmount;
//     earningsY += 8;
//   }

//   /* ================= ATTENDANCE DEDUCTION ================= */

//   const attendanceDeductionAmount = safeNumber(p.attendanceDeduction);

//   if (attendanceDeductionAmount > 0) {

//     doc.text("Attendance Deduction", pageWidth / 2 + 10, deductionY);
//     doc.text(currency(attendanceDeductionAmount), pageWidth - 20, deductionY, { align: 'right' });

//     totalDeductions += attendanceDeductionAmount;
//     deductionY += 8;
//   }

//   const finalY = Math.max(earningsY, deductionY) + 5;

//   /* ================= TOTALS ================= */

//   doc.setDrawColor(179, 0, 0);
//   doc.line(15, finalY, pageWidth - 15, finalY);

//   doc.setFont('helvetica', 'bold');

//   doc.text('Total Earnings', 20, finalY + 10);
//   doc.text(currency(totalEarnings), pageWidth / 2 - 10, finalY + 10, { align: 'right' });

//   doc.text('Total Deductions', pageWidth / 2 + 10, finalY + 10);
//   doc.text(currency(totalDeductions), pageWidth - 20, finalY + 10, { align: 'right' });

//   /* ================= NET PAY ================= */

//   const netSalary =
//     safeNumber(p.netSalary) ||
//     (totalEarnings - totalDeductions);

//   const netY = finalY + 25;

//   doc.setFillColor(220, 53, 69);
//   doc.rect(15, netY, pageWidth - 30, 15, 'F');

//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(14);
//   doc.setFont('helvetica', 'bold');

//   doc.text(
//     `NET PAY: Rs. ${currency(netSalary)}`,
//     pageWidth / 2,
//     netY + 10,
//     { align: 'center' }
//   );

//   doc.setTextColor(0, 0, 0);

//   /* ================= FOOTER ================= */

//   doc.setFontSize(10);
//   doc.setFont('helvetica', 'italic');

//   doc.text('This is a system generated payslip.', 20, netY + 30);
//   doc.text('Authorized Signatory', pageWidth - 20, netY + 30, { align: 'right' });

//   doc.save(`Payslip_${employeeCode}_${monthName}.pdf`);
// }

//   get paginatedPayroll() {
//     const start = (this.currentPage - 1) * this.pageSize;
//     return this.payrollList.slice(start, start + this.pageSize);
//   }
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
    this.userId = Number(sessionStorage.getItem('userCompanyId'));
    // this.loadEmployees();
    this.loadEmployees();
    this.loadDepartments();
    this.loadDesignations();
  }
  loadEmployees() {
    this.payrollService.getEmployees(this.userId)
      .subscribe((res:any) => {
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
      .subscribe((res:any) => {

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
      .subscribe((res:any) => {

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
        next: (res:any) => {
          this.payrollList = res || [];
          this.isPreviewDone = true;
          this.isProcessed = false;
          this.isLoading = false;
        },
        error: (err:any) => {
          console.error(err);
          this.isLoading = false;
          Swal.fire('Error', 'Preview Failed', 'error');
        }
      });
  }

  processPayroll() {
    if (!this.validateInputs()) return;

    this.isLoading = true;

    const payload = { month: this.month, year: this.year };

    this.payrollService.processPayroll(this.userId, payload)
      .subscribe({
        next: (res: any) => {
          this.isProcessed = true;
          this.isLoading = false;

          Swal.fire('Success', res.message, 'success');

          this.loadPayroll();
        },
        error: (err:any) => {
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
        next: (res:any) => {
          this.payrollList = res || [];
          this.isLoading = false;
        },
        error: (err:any) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }
downloadPDF(p: any) {
 
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
 
  const safeText = (val: any) => val ? String(val) : '';
  const safeNumber = (val: any) => isNaN(Number(val)) ? 0 : Number(val);
  const currency = (val: any) =>
    safeNumber(val).toLocaleString('en-IN', { minimumFractionDigits: 0 });
 
  const emp = this.getEmployee(p.employeeId);
 
  const monthName = this.getMonthName(this.month!);
  const printDate = new Date().toLocaleDateString('en-GB');
 
  /* ================= HEADER ================= */
 
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(200, 0, 0);
  doc.text('CORTRACKER IT SOLUTIONS PVT LTD', 20, 20);
 
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Flat No. 1101, 11th Floor, B-Block Asian Sun City...', 20, 26);
  doc.text('Hyderabad, Telangana 500084', 20, 30);
 
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`Print Date: ${printDate}`, pageWidth - 20, 20, { align: 'right' });
  doc.text(`Payslip for ${monthName} ${this.year}`, pageWidth - 20, 26, { align: 'right' });
 
  doc.setDrawColor(200, 0, 0);
  doc.line(20, 35, pageWidth - 20, 35);
 
  /* ================= EMPLOYEE DETAILS ================= */
 
  let y = 45;
 
  doc.setFontSize(10);
 
  // LEFT SIDE
  doc.text(`Name: ${safeText(emp?.fullName)}`, 20, y);
  doc.text(`Designation: ${this.designationMap[emp?.designationId] || ''}`, 20, y + 6);
  doc.text(`Department: ${this.departmentMap[emp?.departmentId] || ''}`, 20, y + 12);
  doc.text(`Location: Madhapur`, 20, y + 18);
  doc.text(`Joining Date: ${emp?.createdDate || ''}`, 20, y + 24);
 
  // RIGHT SIDE
  doc.text(`Employee No: ${safeText(emp?.employeeCode)}`, pageWidth / 2, y);
  doc.text(`Bank: -`, pageWidth / 2, y + 6);
  doc.text(`A/C No: -`, pageWidth / 2, y + 12);
  doc.text(`PAN: -`, pageWidth / 2, y + 18);
 
  /* ================= TABLE ================= */
 
  let tableY = y + 35;
 
  doc.setFillColor("240");
  doc.rect(20, tableY, pageWidth - 40, 10, 'F');
 
  doc.setFont('helvetica', 'bold');
  doc.text('Component', 25, tableY + 7);
  doc.text('Amount (INR)', pageWidth / 2 - 10, tableY + 7, { align: 'right' });
 
  doc.text('Deduction', pageWidth / 2 + 10, tableY + 7);
  doc.text('Amount (INR)', pageWidth - 25, tableY + 7, { align: 'right' });
 
  tableY += 15;
 
  let earningsY = tableY;
  let deductionY = tableY;
 
  let totalEarnings = 0;
  let totalDeductions = 0;
 
  (p.details || []).forEach((d: any) => {
 
    const amount = safeNumber(d.amount);
 
    if (d.type === 'Earning') {
      doc.text(d.componentName, 25, earningsY);
      doc.text(currency(amount), pageWidth / 2 - 10, earningsY, { align: 'right' });
      totalEarnings += amount;
      earningsY += 8;
    }
 
    if (d.type === 'Deduction') {
      doc.text(d.componentName, pageWidth / 2 + 10, deductionY);
      doc.text(currency(amount), pageWidth - 25, deductionY, { align: 'right' });
      totalDeductions += amount;
      deductionY += 8;
    }
 
  });
 
  const finalY = Math.max(earningsY, deductionY) + 10;
 
  /* ================= TOTAL ================= */
 
  doc.setFont('helvetica', 'bold');
 
  doc.setTextColor(200, 0, 0);
  doc.text(`Total Earnings: INR ${currency(totalEarnings)}`, 20, finalY);
 
  doc.setTextColor(0);
  doc.text(`Total Deductions: INR ${currency(totalDeductions)}`, 20, finalY + 8);
 
  const net = totalEarnings - totalDeductions;
 
  doc.setFontSize(14);
  doc.setTextColor(200, 0, 0);
  doc.text(`Net Pay: INR ${currency(net)}`, pageWidth - 20, finalY + 8, { align: 'right' });
 
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`(Rupees ${currency(net)} Only)`, 20, finalY + 16);
 
  /* ================= FOOTER ================= */
 
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    '© CORTRACKER IT SOLUTIONS PVT LTD — This is a system generated payslip.',
    pageWidth / 2,
    finalY + 25,
    { align: 'center' }
  );
 
  doc.save(`Payslip_${emp?.employeeCode}_${monthName}.pdf`);
}
  get paginatedPayroll() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.payrollList.slice(start, start + this.pageSize);
  }
}

import { Component } from '@angular/core';
import { EmployeePayRollService } from '../../../../employee-pay-roll.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-hr-payslip',
  standalone: false,
  templateUrl: './hr-payslip.component.html',
  styleUrl: './hr-payslip.component.css'
})
export class HrPayslipComponent {
  selectAll: boolean = false;
  requests: any[] = [];
  payrollList: any[] = [];

  selectedEmployee: any = null;
  fromMonth!: number;
  toMonth!: number;
  year!: number;
  //selectedEmployee: number | null = null;
  employees: any[] = [];

  EmployeeId = Number(sessionStorage.getItem('UserId'));
  companyId = Number(sessionStorage.getItem('CompanyId'));
  regionId = Number(sessionStorage.getItem('RegionId'));

  constructor(private payrollService: EmployeePayRollService) { }

months = [
  { value: 1, name: 'Jan' },
  { value: 2, name: 'Feb' },
  { value: 3, name: 'Mar' },
  { value: 4, name: 'Apr' },
  { value: 5, name: 'May' },
  { value: 6, name: 'Jun' },
  { value: 7, name: 'Jul' },
  { value: 8, name: 'Aug' },
  { value: 9, name: 'Sep' },
  { value: 10, name: 'Oct' },
  { value: 11, name: 'Nov' },
  { value: 12, name: 'Dec' }
];

  ngOnInit() {
    this.loadPendingRequests();
  }

  // 🔥 LOAD PENDING
  loadPendingRequests() {

    const payload = {
      companyId: this.companyId,
      regionId: this.regionId,
      email: sessionStorage.getItem('Email')
    };

    this.payrollService.getPendingRequests(payload).subscribe({
      next: (res) => {
        this.requests = res.map(r => ({
          ...r,
          isSelected: false
        }));

        
        //Swal.fire('Success', 'Pending requests loaded', 'success');
      },
      error: () => {
        Swal.fire('Error', 'Failed to load requests', 'error');
      }
    });
  }

  // 🔥 APPROVE
  approve(r: any) {
    const payload = {
      payrollIds: r.payrollIds,
      action: 'Approved'
    };

    this.payrollService.approveReject(payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Approved successfully', 'success');
        this.loadPendingRequests();
      },
      error: () => {
        Swal.fire('Error', 'Approval failed', 'error');
      }
    });
  }

  // 🔥 REJECT
  reject(r: any) {
    const payload = {
      payrollIds: r.payrollIds,
      action: 'Rejected'
    };

    this.payrollService.approveReject(payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Rejected successfully', 'success');
        this.loadPendingRequests();
      },
      error: () => {
        Swal.fire('Error', 'Rejection failed', 'error');
      }
    });
  }

  // 🔥 BULK
  bulkApprove() {
    const ids = this.requests.filter(x => x.isSelected).flatMap(x => x.payrollIds);

    if (ids.length === 0) {
      Swal.fire('Warning', 'Please select at least one record', 'warning');
      return;
    }

    const payload = {
      payrollIds: ids,
      action: 'Approved'
    };

    this.payrollService.approveReject(payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Bulk approved successfully', 'success');
        this.loadPendingRequests();
      },
      error: () => {
        Swal.fire('Error', 'Bulk approve failed', 'error');
      }
    });
  }

  bulkReject() {
    const ids = this.requests.filter(x => x.isSelected).flatMap(x => x.payrollIds);

    if (ids.length === 0) {
      Swal.fire('Warning', 'Please select at least one record', 'warning');
      return;
    }

    const payload = {
      payrollIds: ids,
      action: 'Rejected'
    };

    this.payrollService.approveReject(payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Bulk rejected successfully', 'success');
        this.loadPendingRequests();
      },
      error: () => {
        Swal.fire('Error', 'Bulk reject failed', 'error');
      }
    });
  }

  toggleAll() {
    this.requests.forEach(r => r.isSelected = this.selectAll);
  }

  updateSelectAll() {
    this.selectAll = this.requests.every(r => r.isSelected);
  }

  // 🔥 LOAD ALL PAYROLLS
loadPayrolls() {

  if (!this.fromMonth || !this.toMonth || !this.year) {
    Swal.fire('Error', 'Please select From Month, To Month and Year', 'error');
    return;
  }

  const payload = {
    companyId: this.companyId,
    regionId: this.regionId,
    employeeId: this.selectedEmployee,
    fromMonth: this.fromMonth,
    toMonth: this.toMonth,
    year: this.year
  };

  this.payrollService.getAllPayrolls(payload).subscribe({
    next: (res: any[]) => {

      console.log('📥 API Raw Response:', res); // 🔥 full response

this.payrollList = res.map(p => ({
  ...p,
  monthName: this.getMonthName(p.month),
  salary: p.netSalary,
  details: p.details || []   // 🔥 IMPORTANT
}));

      this.currentPage = 1;
      this.updatePagination();
    },

    error: (err) => {
      console.error('❌ API Error:', err);
      Swal.fire('Error', 'Failed to load payrolls', 'error');
    }
  });
}

  getMonthName(month: number): string {
    return this.months.find(m => m.value === month)?.name || '';
  }

download(p: any) {

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  const safeText = (val: any) => val ? String(val) : '';
  const safeNumber = (val: any) => isNaN(Number(val)) ? 0 : Number(val);

  const currency = (val: any) =>
    safeNumber(val).toLocaleString('en-IN');

  const printDate = new Date().toLocaleDateString('en-GB');
  const monthName = p.monthName || '';

  let y = 20;

  /* ================= WATERMARK ================= */
  doc.setTextColor(230, 230, 230);
  doc.setFontSize(40);

  doc.text('CORTRACKER IT SOLUTIONS', pageWidth / 2, 150, {
    align: 'center',
    angle: 30
  });

  doc.setTextColor(0);

  /* ================= HEADER ================= */

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(200, 0, 0);
  doc.text('CORTRACKER IT SOLUTIONS PVT LTD', 20, y);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Flat No. 1101, 11th Floor, B-Block Asian Sun City', 20, y + 5);
  doc.text('Hyderabad, Telangana 500084', 20, y + 9);

  doc.setTextColor(0);
  doc.setFontSize(10);

  doc.text(`Print Date: ${printDate}`, pageWidth - 20, y, { align: 'right' });
  doc.text(`Payslip for ${monthName} ${p.year}`, pageWidth - 20, y + 5, { align: 'right' });

  doc.setDrawColor(200, 0, 0);
  doc.line(20, y + 12, pageWidth - 20, y + 12);

  /* ================= EMPLOYEE DETAILS ================= */

  y += 20;

  doc.setFontSize(10);

  doc.text(`Name: ${safeText(p.employeeName)}`, 20, y);
  doc.text(`Designation: ${safeText(p.designation)}`, 20, y + 6);
  doc.text(`Department: ${safeText(p.department)}`, 20, y + 12);
  doc.text(`Location: ${safeText(p.location || 'Hyderabad')}`, 20, y + 18);
  doc.text(`Joining Date: ${safeText(p.joiningDate)}`, 20, y + 24);

  doc.text(`Employee No: ${safeText(p.employeeCode)}`, pageWidth / 2, y);
  doc.text(`Bank: ${safeText(p.bank || '-')}`, pageWidth / 2, y + 6);
  doc.text(`A/C No: ${safeText(p.accountNo || '-')}`, pageWidth / 2, y + 12);
  doc.text(`PAN: ${safeText(p.pan || '-')}`, pageWidth / 2, y + 18);

  /* ================= TABLE ================= */

  let tableY = y + 35;

  doc.setFillColor(245, 245, 245);
  doc.rect(20, tableY, pageWidth - 40, 10, 'F');

  doc.setFont('helvetica', 'bold');

  doc.text('Earnings', 25, tableY + 7);
  doc.text('Amount (INR)', pageWidth / 2 - 10, tableY + 7, { align: 'right' });

  doc.text('Deduction', pageWidth / 2 + 10, tableY + 7);
  doc.text('Amount (INR)', pageWidth - 25, tableY + 7, { align: 'right' });

  tableY += 15;

  let earningsY = tableY;
  let deductionY = tableY;

  let totalEarnings = 0;
  let totalDeductions = 0;

  /* ================= DETAILS ================= */

  if (p.details && Array.isArray(p.details) && p.details.length > 0) {

    p.details.forEach((d: any) => {

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

  } else {

    /* 🔥 FALLBACK IF NO DETAILS */
    doc.text('Basic Salary', 25, earningsY);
    doc.text(currency(p.salary), pageWidth / 2 - 10, earningsY, { align: 'right' });

    totalEarnings = safeNumber(p.salary);
    earningsY += 8;
  }

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

  doc.save(`Payslip_${p.employeeName}_${monthName}.pdf`);
}

downloadReport() {

  if (!this.payrollList || this.payrollList.length === 0) {
    Swal.fire('Error', 'No data to download', 'error');
    return;
  }

  const doc = new jsPDF();

  const currency = (val: any) =>
    Number(val || 0).toLocaleString('en-IN');

  const printDate = new Date().toLocaleDateString('en-GB');

  /* ========= HEADER ========= */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(200, 0, 0);
  doc.text('CORTRACKER IT SOLUTIONS PVT LTD', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Report Date: ${printDate}`, 14, 28);

  doc.text(
    `From ${this.getMonthName(this.fromMonth)} To ${this.getMonthName(this.toMonth)} - ${this.year}`,
    14,
    34
  );

  /* ========= TABLE ========= */
  const tableData = this.payrollList.map(p => [
    p.employeeName,
    p.monthName,
    p.year,
    currency(p.salary)
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['Employee', 'Month', 'Year', 'Salary']],
    body: tableData,
  });

  /* ========= FOOTER ========= */
  doc.setFontSize(9);
  doc.text(
    'Generated by CORTRACKER',
    105,
    290,
    { align: 'center' }
  );

  doc.save(`Payroll_Report_${this.year}.pdf`);
}


  // Pagination code ====================================================
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  paginatedPayrolls: any[] = [];
  updatePagination() {
    this.totalPages = Math.ceil(this.payrollList.length / this.pageSize);

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedPayrolls = this.payrollList.slice(start, end);
  }
  changePage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
}


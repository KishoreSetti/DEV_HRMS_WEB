import { Component } from '@angular/core';
import { EmployeePayRollService } from '../../../../employee-pay-roll.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService } from '../../../../admin/servies/admin.service';
import { environment } from '../../../../../environments/environment';

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
  companyLogoBase64: string = '';
  companyName: string = '';
  companyAddress: string = '';


  selectedEmployee: any = null;
  fromMonth!: number;
  toMonth!: number;
  year!: number;
  //selectedEmployee: number | null = null;
  employees: any[] = [];

  EmployeeId = Number(sessionStorage.getItem('UserId'));
  companyId = Number(sessionStorage.getItem('CompanyId'));
  regionId = Number(sessionStorage.getItem('RegionId'));

  constructor(private payrollService: EmployeePayRollService, private adminService: AdminService) { }
  loadCompanyDetails() {
  
    const companyId = Number(sessionStorage.getItem('CompanyId'));
  
    this.adminService.getCompanyById(companyId).subscribe({
      next: async (company: any) => {
  
        this.companyName = company?.companyName || 'Company';
        this.companyAddress = company?.companyAddress || 'Hyderabad, Telangana';
  
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
  
      error: () => {
        this.setDefaultLogo();
      }
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
    this.loadCompanyDetails();
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
  const pageHeight = doc.internal.pageSize.getHeight();

  /* 🔴 RED BORDER */
  doc.setDrawColor(200, 0, 0);
  doc.setLineWidth(1);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

  /* 🔥 WATERMARK LOGO */
  if (this.companyLogoBase64) {

    const imgWidth = 120;
    const imgHeight = 120;

    const x = (pageWidth - imgWidth) / 2;
    const y = 40;

    try {
      doc.saveGraphicsState?.();
      doc.setGState?.(new (doc as any).GState({ opacity: 0.08 }));

      doc.addImage(this.companyLogoBase64, 'PNG', x, y, imgWidth, imgHeight);

      doc.restoreGraphicsState?.();
    } catch {
      doc.addImage(this.companyLogoBase64, 'PNG', x, y, imgWidth, imgHeight);
    }
  }

  const currency = (val: any) =>
    Number(val || 0).toLocaleString('en-IN');

  const monthName = p.monthName;
  const printDate = new Date().toLocaleDateString('en-GB');

  let y = 20;

  /* 🔥 HEADER */
  if (this.companyLogoBase64) {
    doc.addImage(this.companyLogoBase64, 'PNG', pageWidth / 2 - 20, 5, 40, 15);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(200, 0, 0);
  doc.text(this.companyName?.toUpperCase() || 'COMPANY NAME', 20, y);

  doc.setFontSize(9);
  doc.setTextColor(100);
  // 🔥 COMPANY ADDRESS (Dynamic)
if (this.companyAddress) {

  const addressLines = this.companyAddress.split(',');

  addressLines.forEach((line: string, index: number) => {
    doc.text(line.trim(), 20, y + 5 + (index * 4));
  });

}

  doc.setTextColor(0);
  doc.setFontSize(10);

  doc.text(`Print Date: ${printDate}`, pageWidth - 20, y, { align: 'right' });
  doc.text(`Payslip for ${monthName} ${p.year}`, pageWidth - 20, y + 5, { align: 'right' });

  doc.setDrawColor(200, 0, 0);
  doc.line(20, y + 12, pageWidth - 20, y + 12);

  /* 🔥 EMPLOYEE DETAILS */
  y += 20;

  doc.text(`Name: ${p.employeeName || ''}`, 20, y);
  doc.text(`Designation: ${p.designation || ''}`, 20, y + 6);
  doc.text(`Department: ${p.department || ''}`, 20, y + 12);
  doc.text(`Location: ${p.location || 'Hyderabad'}`, 20, y + 18);
  doc.text(`Joining Date: ${p.joiningDate || ''}`, 20, y + 24);

  doc.text(`Employee No: ${p.employeeCode || ''}`, pageWidth / 2, y);
  doc.text(`Bank: ${p.bank || '-'}`, pageWidth / 2, y + 6);
  doc.text(`A/C No: ${p.accountNo || '-'}`, pageWidth / 2, y + 12);
  doc.text(`PAN: ${p.pan || '-'}`, pageWidth / 2, y + 18);

  /* 🔥 TABLE */
  let tableY = y + 35;

  doc.setFillColor(245, 245, 245);
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

    const amount = Number(d.amount || 0);

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

  /* 🔥 TOTAL */
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

  /* 🔥 FOOTER */
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `© ${this.companyName || 'Company'} — This is a system generated payslip.`,
    pageWidth / 2,
    finalY + 25,
    { align: 'center' }
  );

  doc.save(`Payslip_${p.employeeName}_${p.monthName}.pdf`);
}

downloadReport() {

  if (!this.payrollList || this.payrollList.length === 0) {
    Swal.fire('Error', 'No data to download', 'error');
    return;
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const currency = (val: any) =>
    Number(val || 0).toLocaleString('en-IN');

  const printDate = new Date().toLocaleDateString('en-GB');

  /* 🔴 RED BORDER */
  doc.setDrawColor(200, 0, 0);
  doc.setLineWidth(1);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

  /* 🔥 LOGO TOP CENTER */
  if (this.companyLogoBase64) {
    doc.addImage(
      this.companyLogoBase64,
      'PNG',
      pageWidth / 2 - 20,
      8,
      40,
      15
    );
  }

  let y = 30;

  /* 🔥 COMPANY NAME */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(200, 0, 0);
  doc.text(
    this.companyName?.toUpperCase() || 'COMPANY NAME',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  y += 8;

  /* 🔥 REPORT DETAILS */
  doc.setFontSize(10);
  doc.setTextColor(0);

  doc.text(`Report Date: ${printDate}`, 20, y);

  doc.text(
    `From ${this.getMonthName(this.fromMonth)} To ${this.getMonthName(this.toMonth)} - ${this.year}`,
    20,
    y + 6
  );

  /* 🔴 LINE */
  doc.setDrawColor(200, 0, 0);
  doc.line(20, y + 10, pageWidth - 20, y + 10);

  /* ========= TABLE ========= */
  const tableData = this.payrollList.map(p => [
    p.employeeName,
    p.monthName,
    p.year,
    currency(p.salary)
  ]);

  autoTable(doc, {
    startY: y + 15,
    head: [['Employee', 'Month', 'Year', 'Salary']],
    body: tableData,
    styles: {
      fontSize: 9
    },
    headStyles: {
      fillColor: [200, 0, 0] // 🔴 red header
    }
  });

  /* 🔥 FOOTER */
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(
    `© ${this.companyName || 'Company'} — Generated Report`,
    pageWidth / 2,
    pageHeight - 10,
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


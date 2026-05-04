import { Component } from '@angular/core';
import { EmployeePayRollService } from '../../../../employee-pay-roll.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { AdminService } from '../../../../admin/servies/admin.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-employee-payslip',
  standalone: false,
  templateUrl: './employee-payslip.component.html',
  styleUrl: './employee-payslip.component.css'
})
export class EmployeePayslipComponent {

  EmployeeId = Number(sessionStorage.getItem('UserId'));
  companyId = Number(sessionStorage.getItem('CompanyId'));
  regionId = Number(sessionStorage.getItem('RegionId'));

  fromMonth: number | null = null;
  toMonth: number | null = null;
  year: number | null = null;

  payslips: any[] = [];
  selectedPayroll: any = null;
  selectedRange: any[] = [];
  today: Date = new Date();
  hrEmail: string = '';
  companyLogo: string = '';
  companyLogoBase64: string = '';
  companyName: string = '';
  companyAddress: string = '';

  // 🔥 Separate flags
  showViewPopup: boolean = false;
  showRequestPopup: boolean = false;

  constructor(private payrollService: EmployeePayRollService, private adminService: AdminService) { }
  ngOnInit() {
  this.loadCompanyDetails();
}
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

  // 🔥 LOAD DATA
  loadPayslips() {

    // 🔴 VALIDATION
    if (!this.fromMonth || !this.toMonth || !this.year) {
      Swal.fire('Error', 'Please select From Month, To Month and Year', 'error');
      return;
    }

    // 🔵 LOADING ALERT
    Swal.fire({
      title: 'Loading...',
      text: 'Fetching payslips',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const payload = {
      EmployeeId: this.EmployeeId,
      companyId: this.companyId,
      regionId: this.regionId,
      fromMonth: this.fromMonth,
      toMonth: this.toMonth,
      year: this.year
    };

    this.payrollService.getPayslipsByRange(payload)
      .subscribe({
        next: (res: any[]) => {
          console.log('months range pay slips',res);

          Swal.close(); // 🔥 close loader

          if (!res || res.length === 0) {
            this.payslips = [];

            Swal.fire(
              'No Data',
              'No payslips found for selected range',
              'info'
            );
            return;
          }

          this.payslips = res.map(p => ({
            ...p,
            monthName: this.months.find(m => m.value === p.month)?.name
          }));

          this.selectedRange = this.payslips;

          // ✅ SUCCESS MESSAGE
          Swal.fire(
            'Success',
            'Payslips loaded successfully',
            'success'
          );
        },

        error: () => {
          Swal.close(); // 🔥 close loader

          Swal.fire(
            'Error',
            'Failed to load payslips',
            'error'
          );
        }
      });
  }

  // 🔥 VIEW POPUP
  openPopup(p: any) {
    this.selectedPayroll = p;
    this.showViewPopup = true;
    this.showRequestPopup = false;
  }

  // 🔥 REQUEST POPUP
  openRequestPopup() {
    this.showRequestPopup = true;
    this.showViewPopup = false;
  }

  closePopup() {
    this.showViewPopup = false;
    this.showRequestPopup = false;
    this.selectedPayroll = null;
  }


  // 🔥 SEND REQUEST
  sendRequest() {

    if (!this.hrEmail) {
      Swal.fire('Error', 'Enter HR email', 'error');
      return;
    }

    const payload = {
      payrollIds: this.selectedRange.map(x => x.payrollId),
      email: this.hrEmail,
      fromMonth: this.fromMonth,
      toMonth: this.toMonth,
      year: this.year
    };

    this.payrollService.requestPayslipEmail(payload)
      .subscribe({
        next: () => {
          Swal.fire('Success', 'Request sent for all months', 'success');
          this.hrEmail = '';
          this.closePopup();
        },
        error: () => {
          Swal.fire('Error', 'Failed to send request', 'error');
        }
      });
  }


  downloadPayslip(p: any) {

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    /* 🔴 FULL PAGE RED BORDER */
doc.setDrawColor(200, 0, 0); // red color
doc.setLineWidth(1);         // border thickness
doc.rect(5, 5, pageWidth - 10, pageHeight - 10); // margin border
    /* ================= WATERMARK LOGO ================= */
if (this.companyLogoBase64) {

  const imgWidth = 120;
  const imgHeight = 120;

  const x = (pageWidth - imgWidth) / 2;
  const y = 40;

  try {
    doc.saveGraphicsState?.();

    // fade effect (if supported)
    doc.setGState?.(new (doc as any).GState({ opacity: 0.08 }));

    doc.addImage(
      this.companyLogoBase64,
      'PNG',
      x,
      y,
      imgWidth,
      imgHeight
    );

    doc.restoreGraphicsState?.();

  } catch (e) {
    // fallback (if opacity not supported)
    doc.addImage(this.companyLogoBase64, 'PNG', x, y, imgWidth, imgHeight);
  }
}

    const currency = (val: any) =>
      Number(val || 0).toLocaleString('en-IN');

    const monthName = p.monthName;
    const printDate = new Date().toLocaleDateString('en-GB');

    let y = 20;

    doc.setTextColor(0);

    /* ================= HEADER ================= */

   if (this.companyLogoBase64) {
  doc.addImage(this.companyLogoBase64, 'PNG', pageWidth / 2 - 20, 5, 40, 15);
}
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(200, 0, 0);
    doc.text(this.companyName?.toUpperCase() || 'COMPANY NAME', 20, y);
    doc.setFontSize(9);
    doc.setTextColor(100);
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

    /* ================= EMPLOYEE DETAILS ================= */

    y += 20;

    doc.setFontSize(10);

    doc.text(`Name: ${p.employeeName || ''}`, 20, y);
    doc.text(`Designation: ${p.designation || ''}`, 20, y + 6);
    doc.text(`Department: ${p.department || ''}`, 20, y + 12);
    doc.text(`Location: ${p.location || 'Hyderabad'}`, 20, y + 18);
    doc.text(`Joining Date: ${p.joiningDate || ''}`, 20, y + 24);

    doc.text(`Employee No: ${p.employeeCode || ''}`, pageWidth / 2, y);
    doc.text(`Bank: ${p.bank || '-'}`, pageWidth / 2, y + 6);
    doc.text(`A/C No: ${p.accountNo || '-'}`, pageWidth / 2, y + 12);
    doc.text(`PAN: ${p.pan || '-'}`, pageWidth / 2, y + 18);

    /* ================= TABLE ================= */

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
        `© ${this.companyName || 'Company'} — This is a system generated payslip.`,
        pageWidth / 2,
        finalY + 25,
        { align: 'center' }
      );

    doc.save(`Payslip_${p.monthName}_${p.year}.pdf`);
  }
}
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-leave-report',
  standalone: false,
  templateUrl: './leave-report.component.html',
  styleUrl: './leave-report.component.css'
})
export class LeaveReportComponent {
   constructor(private adminService: AdminService,private fb: FormBuilder) {}
  currentPage = 1;
pageSize = 5;
filterForm!: FormGroup;
leaveList: any[] = [];
companyLogoBase64: string = '';
companyAddress: string = '';
employees: any[] = [];
  userId!: number;
  companyId!: number;
  companyName: string = '';
  regionId!: number;
  today = new Date().toISOString().split('T')[0];
ngOnInit() {
   this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
      const today = new Date().toISOString().split('T')[0]; 
  this.companyName = sessionStorage.getItem("CompanyName") || 'My Company';
  this.loadCompanyDetails();
  this.filterForm = this.fb.group({
    userId: ['',Validators.required],
    fromDate: [today, Validators.required],
    toDate: [today, Validators.required],
    status: ['']
  });

  this.loadEmployees();
  this.search();
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
// downloadPDF() {
//   if (!this.leaveList.length) {
//     Swal.fire("No Data", "No records to export", "warning");
//     return;
//   }

//   const doc = new jsPDF();

//   const tableData = this.leaveList.map(item => [
//     item.employeeName,
//     item.leaveType,
//     new Date(item.startDate).toLocaleDateString(),
//     new Date(item.endDate).toLocaleDateString(),
//     item.totalDays,
//     item.status
//   ]);

//   autoTable(doc, {
//     head: [['Employee', 'Leave Type', 'From', 'To', 'Days', 'Status']],
//     body: tableData
//   });

//   doc.save('Leave_Report.pdf');
// }
downloadPDF() {
  if (!this.leaveList.length) {
    Swal.fire("No Data", "No records to export", "warning");
    return;
  }

  const doc = new jsPDF();

  const { fromDate, toDate } = this.filterForm.value;

  const from = new Date(fromDate).toLocaleDateString();
  const to = new Date(toDate).toLocaleDateString();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ================= HEADER =================

  // 🟢 Company Name (LEFT)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(this.companyName, 14, 12);

  // 🟢 Generated Date (RIGHT)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    pageWidth - 14,
    12,
    { align: 'right' }
  );

  // 🟢 LOGO (CENTER)
  if (this.companyLogoBase64) {
    doc.addImage(
      this.companyLogoBase64,
      'PNG',
      (pageWidth / 2) - 20,
      5,
      40,
      20
    );
  }

  // 🟢 LINE
  doc.setDrawColor(200);
  doc.line(14, 30, pageWidth - 14, 30);

  // ================= TITLE =================
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LEAVE REPORT", pageWidth / 2, 42, { align: 'center' });

  // 🟢 DATE RANGE
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`(${from} to ${to})`, pageWidth / 2, 50, { align: 'center' });

  // ================= WATERMARK =================
  if (this.companyLogoBase64) {
    doc.saveGraphicsState();

    // Transparency (0 = invisible, 1 = solid)
(doc as any).setGState(new (doc as any).GState({ opacity: 0.08 }));
    doc.addImage(
      this.companyLogoBase64,
      'PNG',
      pageWidth / 2 - 60,
      pageHeight / 2 - 40,
      120,
      80
    );

    doc.restoreGraphicsState();
  }

  // ================= TABLE =================
  const tableData = this.leaveList.map(item => [
    item.employeeName,
    item.leaveType,
    new Date(item.startDate).toLocaleDateString(),
    new Date(item.endDate).toLocaleDateString(),
    item.totalDays,
    item.status
  ]);

  autoTable(doc, {
    startY: 60,
    head: [['Employee', 'Leave Type', 'From', 'To', 'Days', 'Status']],
    body: tableData,

    theme: 'grid',

    styles: {
      fontSize: 10,
      cellPadding: 3,
      valign: 'middle',
      halign: 'center'
    },

    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },

    didParseCell: (data) => {
      if (data.column.index === 5 && data.cell.section === 'body') {

        const status = (data.cell.raw || '').toString().toLowerCase();

        if (status === 'approved') {
          data.cell.styles.textColor = [0, 128, 0];
          data.cell.styles.fontStyle = 'bold';
        } 
        else if (status === 'rejected') {
          data.cell.styles.textColor = [255, 0, 0];
          data.cell.styles.fontStyle = 'bold';
        } 
        else if (status === 'pending') {
          data.cell.styles.textColor = [255, 165, 0];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },

    didDrawPage: () => {
      // ================= FOOTER =================
      doc.setFontSize(9);
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  });

  // ================= DOWNLOAD =================
  doc.save(`Leave_Report_${from}_to_${to}.pdf`);
}

downloadExcel() {
  if (!this.leaveList.length) {
    Swal.fire("No Data", "No records to export", "warning");
    return;
  }

  const exportData = this.leaveList.map(item => ({
    Employee: item.employeeName,
    LeaveType: item.leaveType,
    From: new Date(item.startDate).toLocaleDateString(),
    To: new Date(item.endDate).toLocaleDateString(),
    Days: item.totalDays,
    Status: item.status
  }));

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Leave Report': worksheet },
    SheetNames: ['Leave Report']
  };

  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const data: Blob = new Blob([excelBuffer], {
    type: 'application/octet-stream'
  });

  FileSaver.saveAs(data, 'Leave_Report.xlsx');
}

onFromDateChange() {
  const fromDate = this.filterForm.get('fromDate')?.value;

  if (fromDate) {
    this.filterForm.patchValue({
      toDate: fromDate
    });

    // 🔥 Force validation update
    this.filterForm.get('toDate')?.updateValueAndValidity();
  }
}
trackByFn(index: number, item: any) {
  return item.leaveRequestId || index;
}
  loadEmployees() {
    this.adminService.GetcmpregAllUsers().subscribe(
      (r:any) => {
        this.employees = r.map((u:any) => ({
          companyID: u.companyId || 0,
          regionID: u.regionId || 0,
          userId:  u.userId || 0,
          employeeCode: u.employeeCode || '',
          fullName: u.fullName || '',
          email: u.email || '',
          status: u.status || '',
          roleName: (u.roleId !== undefined && u.roleId !== null) ? u.roleId.toString() : ''
        }));
      }, 
      (err:any) => {
        console.error('Error loading users:', err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to load employees. Please try again'
        });
      }
    );

    
  }
get paginatedList() {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.leaveList.slice(start, start + this.pageSize);
}

get totalPages() {
  return this.leaveList.length > 0
    ? Math.ceil(this.leaveList.length / this.pageSize)
    : 1;
}
changePage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
}

search() {
 

  const { fromDate, toDate } = this.filterForm.value;

  if (toDate < fromDate) {
    Swal.fire('Validation', 'To Date cannot be less than From Date', 'warning');
    return;
  }

  const payload = {
    companyId: this.companyId,
    regionId: this.regionId,
    userId: this.filterForm.value.userId || null,
    fromDate,
    toDate,
      status: this.filterForm.value.status || null
  };

  this.adminService.getLeaveReport(payload).subscribe(res => {
    this.leaveList = res.data;
    this.currentPage = 1; // reset pagination
  });
}
}

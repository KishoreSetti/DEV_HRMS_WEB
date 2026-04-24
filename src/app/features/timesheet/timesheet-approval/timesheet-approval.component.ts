import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { TimesheetService } from '../service/timesheet.service';
import { environment } from '../../../../environments/environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AdminService } from '../../../admin/servies/admin.service';
import ExcelJS from 'exceljs';
@Component({
  selector: 'app-timesheet-approval',
  standalone: false,
  templateUrl: './timesheet-approval.component.html',
  styleUrl: './timesheet-approval.component.css'
})
export class TimesheetApprovalComponent {
selectAll = false;
  selectedTimesheet: any = null;
  timesheetList: any[] = [];
  managerId!: number;
  companyLogo: string = '';

  // ===== PAGINATION =====
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // ===== SORTING =====
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  searchName: string = '';
  fromDate: string = '';
  toDate: string = '';
  statusFilter: string = 'Today';

  constructor(private timesheetService: TimesheetService, private adminService: AdminService) {}

  ngOnInit() {
    this.managerId = Number(sessionStorage.getItem('UserId'));
    this.loadManagerTimesheets();
    this.loadCompanyLogo();
  }
  loadCompanyLogo() {
  const companyId = Number(sessionStorage.getItem('CompanyId'));

  this.adminService.getCompanyById(companyId).subscribe({
    next: (company: any) => {
      const logo = company?.companyLogo;

      if (logo && logo.trim() !== '') {
        if (logo.startsWith('data:')) {
          this.companyLogo = logo;
        } else {
          const logoPath = logo.replace(/\\/g, '/');
          this.companyLogo = `${environment.baseurl}/${logoPath}`;
        }
      } else {
        this.companyLogo = '/assets/images/cor-logo.png';
      }
    },
    error: () => {
      this.companyLogo = '/assets/images/cor-logo.png';
    }
  });
}
getBase64ImageFromURL(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };

    img.onerror = error => reject(error);
    img.src = url;
  });
}
getPaginatedTimesheets() {
  const data = this.filteredTimesheets();

  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;

  return data.slice(startIndex, endIndex);
}
  // ================= LOAD MANAGER TIMESHEETS =================
  loadManagerTimesheets() {
    this.timesheetService.getManagerTimesheets(this.managerId).subscribe(res => {
      this.timesheetList = res.map((x: any) => {
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
          selected: false,
          comments: x.comments || '',
          totalMinutes,
          otMinutes,
          totalHoursText,
          otHoursText,
        };
      });
    });
  }

  // ================= SELECT ALL =================
  toggleSelectAll() {
    this.timesheetList.forEach(t => {
      if (t.status === 'Submitted') t.selected = this.selectAll;
    });
  }

  checkSelectAll() {
    this.selectAll = this.timesheetList
      .filter(t => t.status === 'Submitted')
      .every(t => t.selected);
  }

  // ================= VIEW MODAL =================
  openViewModal(ts: any) {
  this.selectedTimesheet = null;

  this.timesheetService.getTimesheetDetail(ts.timesheetId).subscribe(res => {
    const apiData = res.data ?? res;  // Use API response

    // Only take requests for this timesheet
    const relatedRequests = (apiData.requests || []).map((r: any) => ({
      ...r,
      fileUrl: r.filePath ? `${environment.baseurl}/${r.filePath}` : null,
      fileName: r.fileName ?? 'Attachment'
    }));

    this.selectedTimesheet = {
      ...apiData,
      requests: relatedRequests
    };

    // Calculate total and OT hours
    const totalMinutes = this.selectedTimesheet.projects?.reduce(
      (sum: number, p: any) => sum + (Number(p.totalMinutes) || 0), 0
    ) || 0;

    const otMinutes = this.selectedTimesheet.projects?.reduce(
      (sum: number, p: any) => sum + (Number(p.otMinutes) || 0), 0
    ) || 0;

    this.selectedTimesheet.totalHoursText =
      `${Math.floor(totalMinutes / 60)} Hours ${totalMinutes % 60} Minutes`;
    this.selectedTimesheet.otHoursText =
      otMinutes > 0
        ? `${Math.floor(otMinutes / 60)} Hours ${otMinutes % 60} Minutes`
        : '0 Hours';

    this.selectedTimesheet.projects = this.selectedTimesheet.projects || [];
    this.selectedTimesheet.comments = this.selectedTimesheet.comments || '';
  });
}
  closeViewModal() {
  this.selectedTimesheet = null;
}

  // ================= APPROVE / REJECT =================
  approveSelected() {
    const selected = this.timesheetList.filter(t => t.selected);
    if (!selected.length) {
      Swal.fire("No selection", "Select at least one record", "warning");
      return;
    }

    Swal.fire({
      title: "Approve selected timesheets?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve"
    }).then(result => {
      if (result.isConfirmed) {
        const ids = selected.map(x => x.timesheetId);
        const comments = selected.map(x => x.comments || '').join(', ');
        this.timesheetService.approveTimesheets(ids, comments).subscribe(() => {
          Swal.fire("Approved!", "Timesheets approved successfully.", "success");
          selected.forEach(ts => {
            ts.status = "Approved";
            ts.selected = false;
          });
          this.selectAll = false;
        });
      }
    });
  }

  rejectSelected() {
    const selected = this.timesheetList.filter(t => t.selected);
    if (!selected.length) {
      Swal.fire("No selection", "Select at least one record", "warning");
      return;
    }

    Swal.fire({
      title: "Reject selected timesheets?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject"
    }).then(result => {
      if (result.isConfirmed) {
        const ids = selected.map(x => x.timesheetId);
        const comments = selected.map(x => x.comments || '').join(', ');
        this.timesheetService.rejectTimesheets(ids, comments).subscribe(() => {
          Swal.fire("Rejected!", "Timesheets rejected successfully.", "success");
          selected.forEach(ts => {
            ts.status = "Rejected";
            ts.selected = false;
          });
          this.selectAll = false;
        });
      }
    });
  }

  // ================= APPROVE / REJECT FROM MODAL =================
  approveFromPopup() {
    if (!this.selectedTimesheet) return;

    Swal.fire({
      title: "Approve this timesheet?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve"
    }).then(result => {
      if (result.isConfirmed) {
        this.timesheetService.approveTimesheets(
          [this.selectedTimesheet.timesheetId],
          this.selectedTimesheet.comments || ''
        ).subscribe(() => {
          Swal.fire("Approved!", "Timesheet approved.", "success");
          this.selectedTimesheet.status = "Approved";
          const row = this.timesheetList.find(x => x.timesheetId === this.selectedTimesheet.timesheetId);
          if (row) row.status = "Approved";
        });
      }
    });
  }

  rejectFromPopup() {
    if (!this.selectedTimesheet) return;

    Swal.fire({
      title: "Reject this timesheet?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject"
    }).then(result => {
      if (result.isConfirmed) {
        this.timesheetService.rejectTimesheets(
          [this.selectedTimesheet.timesheetId],
          this.selectedTimesheet.comments || ''
        ).subscribe(() => {
          Swal.fire("Rejected!", "Timesheet rejected.", "success");
          this.selectedTimesheet.status = "Rejected";
          const row = this.timesheetList.find(x => x.timesheetId === this.selectedTimesheet.timesheetId);
          if (row) row.status = "Rejected";
        });
      }
    });
  }

  // ================== SORTING ==================
  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortedTimesheets() {
    let data = [...this.timesheetList];
    if (this.sortColumn) {
      data.sort((a, b) => {
        let valA = a[this.sortColumn!];
        let valB = b[this.sortColumn!];

        if (valA instanceof Date) valA = valA.getTime();
        if (valB instanceof Date) valB = valB.getTime();

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }
  filteredTimesheets() {
  return this.getFilteredForExport();
}

  // ================== PAGINATION ==================
  getFilteredForExport() {
  let data = [...this.timesheetList];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (this.statusFilter === 'Today') {
    data = data.filter(ts => {
      const tsDate = new Date(ts.timesheetDate);
      tsDate.setHours(0,0,0,0);
      return tsDate.getTime() === today.getTime();
    });
  }

  if (this.statusFilter && this.statusFilter !== 'Today' && this.statusFilter !== 'All') {
    data = data.filter(ts => ts.status === this.statusFilter);
  }

  if (this.searchName) {
    data = data.filter(ts =>
      ts.employeeName?.toLowerCase().includes(this.searchName.toLowerCase())
    );
  }

  if (this.fromDate) {
    const from = new Date(this.fromDate);
    data = data.filter(ts => new Date(ts.timesheetDate) >= from);
  }
  if (this.toDate) {
    const to = new Date(this.toDate);
    to.setHours(23, 59, 59, 999);
    data = data.filter(ts => new Date(ts.timesheetDate) <= to);
  }

  // ✅ Sorting
  if (this.sortColumn) {
    data.sort((a, b) => {
      let valA = a[this.sortColumn!];
      let valB = b[this.sortColumn!];
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return data;
}

  get totalPages() {
    return Math.ceil(this.filteredTimesheets().length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }
  // ===================== EXPORT PDF =====================
async downloadPDF() {
  const fullData = await this.getFullTimesheetData();

  if (!fullData.length) {
    Swal.fire("No Data", "No records to export", "warning");
    return;
  }

  const doc = new jsPDF();

  // ✅ LOAD LOGO
  let logoBase64 = '';
  try {
    logoBase64 = await this.getBase64ImageFromURL(this.companyLogo);
  } catch {
    console.warn('Logo load failed');
  }

  let y = 10;

  // ================= HEADER =================
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 10, y, 40, 15);
  }

  doc.setFontSize(18);
  doc.text('Timesheet Report', 105, y + 8, { align: 'center' });

  // ✅ FROM - TO DATE FILTER
  doc.setFontSize(10);
  let filterText = '';

  if (this.fromDate && this.toDate) {
    filterText = `From: ${new Date(this.fromDate).toLocaleDateString()}  To: ${new Date(this.toDate).toLocaleDateString()}`;
  } else if (this.statusFilter === 'Today') {
    filterText = `Date: ${new Date().toLocaleDateString()}`;
  } else {
    filterText = `Filter: ${this.statusFilter}`;
  }

  doc.text(filterText, 105, y + 15, { align: 'center' });

  y += 30;

  doc.setDrawColor(0);
  doc.line(10, y, 200, y);
  y += 10;

  // ================= DATA =================
  fullData.forEach((ts: any) => {

    // ✅ EMPLOYEE HIGHLIGHT
    doc.setTextColor(0, 102, 204); // blue
    doc.setFont('helvetica', 'bold');
    doc.text(`Employee: ${ts.employeeName} (${ts.employeeCode})`, 10, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    y += 6;

    doc.text(`Date: ${new Date(ts.timesheetDate).toLocaleDateString()}`, 10, y);
    y += 6;

    doc.text(`Status: ${ts.status}`, 10, y);
    y += 6;

    doc.text(`Comments: ${ts.comments || '-'}`, 10, y);
    y += 8;

    // ✅ PROJECT TABLE (RED HEADER)
    const projectRows = (ts.projects || []).map((p: any) => [
      p.projectName,
      p.startTime,
      p.endTime,
      p.totalHoursText,
      p.otHoursText
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Project', 'Start', 'End', 'Hours', 'OT']],
      body: projectRows,
      headStyles: {
        fillColor: [220, 53, 69], // 🔴 RED
        textColor: 255
      }
    });

    y = (doc as any).lastAutoTable.finalY + 6;

    // Attachments
    if (ts.requests?.length) {
      doc.text('Attachments:', 10, y);
      y += 6;

      ts.requests.forEach((r: any) => {
        doc.text(`- ${r.fileName}`, 12, y);
        y += 5;
      });
    }

    y += 6;

    // separator line
    doc.setDrawColor(150);
    doc.line(10, y, 200, y);
    y += 10;

    // page break
    if (y > 270) {
      doc.addPage();

      // HEADER AGAIN
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 10, 10, 40, 15);
      }

      doc.setFontSize(18);
      doc.text('Timesheet Report', 105, 18, { align: 'center' });

      doc.setFontSize(10);
      doc.text(filterText, 105, 25, { align: 'center' });

      doc.line(10, 30, 200, 30);
      y = 40;
    }
  });

  doc.save('Timesheet_Report.pdf');
}

// ===================== EXPORT EXCEL =====================
async downloadExcel() {

  const fullData = await this.getFullTimesheetData();

  if (!fullData.length) {
    Swal.fire("No Data", "No records to export", "warning");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Timesheet Report');

  // ================= HEADER TITLE =================
  sheet.mergeCells('A1:J1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'TIMESHEET REPORT';
  titleCell.font = { size: 18, bold: true };
  titleCell.alignment = { horizontal: 'center' };

  // ================= FILTER INFO =================
  sheet.mergeCells('A2:J2');
  sheet.getCell('A2').value =
    `From: ${this.fromDate || 'All'}   To: ${this.toDate || 'All'}`;
  sheet.getCell('A2').alignment = { horizontal: 'center' };

  // ================= COLUMN HEADERS =================
  const headerRow = sheet.addRow([
    'Employee',
    'Date',
    'Status',
    'Comments',
    'Project',
    'Start',
    'End',
    'Hours',
    'OT',
    'Attachments'
  ]);

  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' }
    };
    cell.alignment = { horizontal: 'center' };
  });

  // ================= DATA =================
  fullData.forEach((ts: any) => {

    if (ts.projects?.length) {
      ts.projects.forEach((p: any) => {

        const row = sheet.addRow([
          `${ts.employeeName} (${ts.employeeCode})`,
          new Date(ts.timesheetDate).toLocaleDateString(),
          ts.status,
          ts.comments || '',
          p.projectName,
          p.startTime,
          p.endTime,
          p.totalHoursText,
          p.otHoursText,
          (ts.requests || []).map((r: any) => r.fileName).join(', ')
        ]);

        // ================= EMPLOYEE HIGHLIGHT =================
        const empCell = row.getCell(1);
        empCell.font = { bold: true, color: { argb: 'FF0000FF' } };

      });
    } else {

      const row = sheet.addRow([
        `${ts.employeeName} (${ts.employeeCode})`,
        new Date(ts.timesheetDate).toLocaleDateString(),
        ts.status,
        ts.comments || '',
        '-',
        '-',
        '-',
        '-',
        '-',
        (ts.requests || []).map((r: any) => r.fileName).join(', ')
      ]);

      row.getCell(1).font = { bold: true, color: { argb: 'FF0000FF' } };
    }
  });

  // ================= COLUMN WIDTH =================
  sheet.columns.forEach(col => {
    col.width = 18;
  });

  // ================= EXPORT =================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  saveAs(blob, 'Timesheet_Report.xlsx');
}
async getFullTimesheetData() {
  const filtered = this.getFilteredForExport();

  const fullData = await Promise.all(
    filtered.map((ts: any) =>
      this.timesheetService.getTimesheetDetail(ts.timesheetId).toPromise()
    )
  );

  return fullData.map((res: any) => {
    const data = res.data ?? res;

    const requests = (data.requests || []).map((r: any) => ({
      fileName: r.fileName ?? 'Attachment',
      fileUrl: r.filePath ? `${environment.baseurl}/${r.filePath}` : ''
    }));

    return {
      ...data,
      requests
    };
  });
}
}

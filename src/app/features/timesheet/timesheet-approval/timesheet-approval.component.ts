import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { TimesheetService } from '../service/timesheet.service';
import { environment } from '../../../../environments/environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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

  constructor(private timesheetService: TimesheetService) {}

  ngOnInit() {
    this.managerId = Number(sessionStorage.getItem('UserId'));
    this.loadManagerTimesheets();
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
    return Math.ceil(this.timesheetList.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }
  // ===================== EXPORT PDF =====================
downloadPDF() {
  const filteredData = this.getFilteredForExport();

  if (!filteredData.length) {
    Swal.fire("No Data", "No records to export based on filters", "warning");
    return;
  }

  const today = new Date();
  const todayStr = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('Timesheet Approvals', 14, 10);
  doc.setFontSize(10);
  doc.text(`Downloaded: ${todayStr}`, 140, 10);

  const tableData = filteredData.map(ts => [
    ts.employeeCode,
    ts.employeeName,
    ts.timesheetDate ? new Date(ts.timesheetDate).toLocaleDateString() : '',
    ts.totalHoursText,
    ts.otHoursText,
    ts.status,
    ts.comments || ''
  ]);

  autoTable(doc, {
    startY: 22,
    head: [['Emp ID','Emp Name','Date','Total Hours','OT Hours','Status','Comments']],
    body: tableData
  });

  doc.save(`Timesheet_Approvals_${todayStr}.pdf`);
}

// ===================== EXPORT EXCEL =====================
downloadExcel() {
  const filteredData = this.getFilteredForExport();

  if (!filteredData.length) {
    Swal.fire("No Data", "No records to export based on filters", "warning");
    return;
  }

  const today = new Date();
  const todayStr = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;

  const worksheetData = filteredData.map(ts => ({
    'Employee ID': ts.employeeCode,
    'Employee Name': ts.employeeName,
    'Date': ts.timesheetDate ? new Date(ts.timesheetDate).toLocaleDateString() : '',
    'Total Hours': ts.totalHoursText,
    'OT Hours': ts.otHoursText,
    'Status': ts.status,
    'Comments': ts.comments || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = { Sheets: { 'Timesheet Approvals': worksheet }, SheetNames: ['Timesheet Approvals'] };
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `Timesheet_Approvals_${todayStr}.xlsx`);
}
}

import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService, AttendanceStatus } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-attendance-status',
  standalone: false,
  templateUrl: './attendance-status.component.html',
  styleUrl: './attendance-status.component.css'
})
export class AttendanceStatusComponent {
  isDuplicate = false;
  isSubmitting = false;

  companyId!: number;
  regionId!: number;
  userId!: number;
  // attendance: AttendanceStatus = this.getEmptyAttendance();
  attendanceList: AttendanceStatus[] = [];

  attendanceModel: any = {};
  attendance!: AttendanceStatus;
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  currentPage = 1;
  pageSize = 5;

  sortColumn = 'attendanceStatusId';
  sortDirection: 'asc' | 'desc' = 'desc';

  showUploadPopup = false;
  companies: any[] = [];
  regions: any[] = [];

  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};


  constructor(private admin: AdminService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
    const user = sessionStorage.getItem('currentUser');

    if (user) {
      const currentUser = JSON.parse(user);

      this.companyId = currentUser.companyId;
      this.regionId = currentUser.regionId;
      this.userId = currentUser.userId;
    } else {
      Swal.fire('Session Expired', 'Please login again.', 'warning');
      return;
    }
    this.attendance = this.getEmptyAttendance();
    this.loadCompanies();
    this.loadAttendanceStatus();
  }
  loadCompanies() {
    this.admin.getCompanies(null, this.userId).subscribe(res => {
      this.companies = res || [];

      this.companyMap = {};
      this.companies.forEach(c => {
        this.companyMap[c.companyId] = c.companyName;
      });

      this.loadRegions();
    });
  }

  loadRegions() {
    this.admin.getRegions(null, this.userId).subscribe(res => {
      const all = res || [];

      this.regionMap = {};
      all.forEach(r => {
        this.regionMap[r.regionID] = r.regionName;
      });

      this.regions = all.filter(r => r.companyID == this.companyId);

      if (!this.regionId && this.regions.length > 0) {
        this.regionId = this.regions[0].regionID;
      }

      this.attendance.regionId = this.regionId;
    });
  }
  onCompanyChange() {
    this.attendance.companyId = this.companyId;
    this.regionId = 0;
    this.loadRegions();
  }

  onRegionChange() {
    this.attendance.regionId = this.regionId;
  }


  /** Default new record */
  // getEmptyAttendance(): AttendanceStatus {
  //   return {
  //     AttendanceStatusID: 0,
  //     AttendanceStatusName: '',
  //     IsActive: true,
  //     CompanyID: this.companyId,
  //     RegionID: this.regionId
  //   };
  // }
  getEmptyAttendance(): AttendanceStatus {
    return {
      attendanceStatusId: 0,
      attendanceStatusName: '',
      isActive: true,
      companyId: this.companyId,
      regionId: this.regionId,
      createdBy: this.userId,
      modifiedBy: this.userId,
      userId: this.userId
    };
  }
  checkDuplicate(): void {
    const name = this.attendance.attendanceStatusName?.trim().toLowerCase();

    this.isDuplicate = this.attendanceList.some(x =>
      x.attendanceStatusName.toLowerCase() === name &&
      x.attendanceStatusId !== this.attendance.attendanceStatusId
    );
  }
  /** Load Data */
  loadAttendanceStatus(): void {
    this.spinner.show();
    this.admin.getAttendanceStatus(this.userId).subscribe({
      next: res => {
        this.attendanceList = res.data;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Attendance Status.', 'error');
      }
    });
  }

  /** Submit Create / Update */
  // onSubmit(): void {
  //   this.spinner.show();
  //   if (this.isEditMode) {
  //     this.admin.updateAttendanceStatus(this.attendance).subscribe({
  //       next: () => {
  //         this.spinner.hide();
  //         Swal.fire('Updated', 'Attendance Status updated successfully!', 'success');
  //         this.loadAttendanceStatus();
  //         this.resetForm();
  //       },
  //       error: () => {
  //         this.spinner.hide();
  //         Swal.fire('Error', 'Update failed.', 'error');
  //       }
  //     });
  //   } else {
  //     this.admin.createAttendanceStatus(this.attendance).subscribe({
  //       next: () => {
  //         this.spinner.hide();
  //         Swal.fire('Created', 'Attendance Status created successfully!', 'success');
  //         this.loadAttendanceStatus();
  //         this.resetForm();
  //       },
  //       error: () => {
  //         this.spinner.hide();
  //         Swal.fire('Error', 'Create failed.', 'error');
  //       }
  //     });
  //   }
  // }
  onSubmit(form: any): void {
    if (!this.attendance.attendanceStatusName?.trim()) {
      Swal.fire('Validation', 'Status name is required.', 'warning');
      return;
    }

    if (this.isDuplicate) {
      Swal.fire('Duplicate', 'Attendance Status already exists.', 'warning');
      return;
    }

    this.isSubmitting = true;
    this.spinner.show();
    this.attendance.companyId = this.companyId;
    this.attendance.regionId = this.regionId;
    this.attendance.createdBy = this.userId;
    this.attendance.userId = this.userId;


    this.attendance.attendanceStatusName =
      this.attendance.attendanceStatusName.trim();

    const request = this.isEditMode
      ? this.admin.updateAttendanceStatus(this.attendance)
      : this.admin.createAttendanceStatus(this.attendance);
    if (this.isEditMode) {
      this.attendance.modifiedBy = this.userId;
    } else {
      this.attendance.createdBy = this.userId;
    }

    request.subscribe({
      next: () => {
        this.spinner.hide();
        this.isSubmitting = false;

        Swal.fire(
          this.isEditMode ? 'Updated' : 'Created',
          `Attendance Status ${this.isEditMode ? 'updated' : 'created'} successfully!`,
          'success'
        );

        this.loadAttendanceStatus();

        form.resetForm();      // ✅ VERY IMPORTANT
        this.resetForm();      // reset model variables
      },
      error: () => {
        this.spinner.hide();
        this.isSubmitting = false;
        Swal.fire('Error', 'Operation failed.', 'error');
      }
    });
  }

  /** Edit */
  // editAttendance(item: AttendanceStatus): void {
  //   this.attendance = { ...item };
  //   this.isEditMode = true;
  // }
  editAttendance(item: AttendanceStatus): void {
    this.attendance = { ...item };
    this.companyId = item.companyId;
    this.regionId = item.regionId;

    this.loadRegions();
    this.isEditMode = true;
    this.isDuplicate = false;
  }

  /** Delete */
  deleteAttendance(item: AttendanceStatus): void {
    Swal.fire({
      title: `Delete "${item.attendanceStatusName}"?`,
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.admin.deleteAttendanceStatus(item.attendanceStatusId).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', 'Attendance Status deleted successfully.', 'success');
            this.loadAttendanceStatus();
            this.resetForm();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed.', 'error');
          }
        });
      }
    });
  }

  /** Reset form */
  resetForm(): void {
    this.attendance = this.getEmptyAttendance();
    this.isEditMode = false;
    this.isDuplicate = false;
    this.isSubmitting = false;

  }

  /** Filtered Data */
  // filteredAttendance(): AttendanceStatus[] {
  //   return this.attendanceList.filter(c => {
  //     const matchSearch = c.AttendanceStatusName.toLowerCase().includes(this.searchText.toLowerCase());
  //     const matchStatus = this.statusFilter === '' || c.IsActive === this.statusFilter;
  //     return matchSearch && matchStatus;
  //   });
  // }
  filteredAttendance(): AttendanceStatus[] {
    this.currentPage = 1;

    return this.attendanceList.filter(c => {
      const matchSearch =
        c.attendanceStatusName.toLowerCase()
          .includes(this.searchText.toLowerCase());

      const matchStatus =
        this.statusFilter === '' || c.isActive === this.statusFilter;

      return matchSearch && matchStatus;
    });
  }

  /** Sorting */
  sortTable(column: string) {
    if (this.sortColumn === column)
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  /** Pagination + Sorted List */
  get pagedAttendance(): AttendanceStatus[] {
    const filtered = this.filteredAttendance();

    filtered.sort((a: any, b: any) => {
      const valA = a[this.sortColumn]?.toString().toLowerCase() || '';
      const valB = b[this.sortColumn]?.toString().toLowerCase() || '';

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAttendance().length / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  /** Export */
  exportAs(type: 'excel' | 'pdf') {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel() {
    const data = this.attendanceList.map(c => ({
      'Status Name': c.attendanceStatusName,
      'Active': c.isActive ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Status');
    XLSX.writeFile(wb, 'AttendanceStatus.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const data = this.attendanceList.map(c => [c.attendanceStatusName, c.isActive ? 'Yes' : 'No']);
    autoTable(doc, { head: [['Status Name', 'Active']], body: data });
    doc.save('AttendanceStatus.pdf');
  }

  /** Bulk Upload */
  openUploadPopup() { this.showUploadPopup = true; }
  closeUploadPopup() { this.showUploadPopup = false; }

  onBulkUploadComplete(data: any): void {
    if (!data || !data.length) {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
      return;
    }

    this.admin.bulkInsertData('AttendanceStatus', data).subscribe({
      next: () => {
        Swal.fire('Success', 'Attendance Status uploaded successfully!', 'success');
        this.loadAttendanceStatus();
        this.closeUploadPopup();
      },
      error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
    });
  }
}

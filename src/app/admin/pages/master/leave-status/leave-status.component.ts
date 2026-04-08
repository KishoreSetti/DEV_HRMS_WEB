import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService,Company,LeaveStatus, Region } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-leave-status',
  standalone: false,
  templateUrl: './leave-status.component.html',
  styleUrl: './leave-status.component.css'
})
export class LeaveStatusComponent {
      leaveList: LeaveStatus[] = [];
  leave: LeaveStatus = this.getEmptyLeave();

  isEditMode = false;

  searchText = '';
  statusFilter: boolean | '' = '';

  pageSize = 5;
  currentPage = 1;

  sortColumn = 'leaveStatusName';
  sortDirection: 'asc' | 'desc' = 'asc';

  showUploadPopup = false;
  leaveModel: any;

  companyID = 0;
  regionID = 0;
  userId = 0;
  companies: any;
  regions: any;

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {

      const user = sessionStorage.getItem('currentUser');

  if (user) {
    const currentUser = JSON.parse(user);
    this.userId = currentUser.userId;
  
  }

  this.leave = this.getEmptyLeave();

  // 🔥 Call these
  this.loadCompanies();
  this.loadRegions();
    
    this.leave = this.getEmptyLeave();
    this.loadLeaveStatus();
  }

 getEmptyLeave(): LeaveStatus {
  return {
    LeaveStatusID: 0,
    LeaveStatusName: '',
    Description: '',
    isActive: true,
    ModifiedBy: 0,
    CompanyID: this.companyID,
    RegionID: this.regionID,
    CreatedBy: 0,
    UserID: this.userId
  } as any;
}


  /* ================= LOAD ================= */

  loadLeaveStatus(): void {
    this.spinner.show();

    this.adminService
      .getLeaveStatus(this.userId)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.leaveList = res.data || [];
            this.currentPage = 1;
          } else {
            Swal.fire('Warning', res.message, 'warning');
          }
          this.spinner.hide();
        },
        error: (err) => {
          this.spinner.hide();
          //Swal.fire('Error', err?.error?.message || 'Failed to load data', 'error');
        }
      });
  }

  // loadcompanies
 loadCompanies(): void {
  this.spinner.show();

  this.adminService.getCompanies(null, this.userId).subscribe({
    next: (res: Company[]) => {
      this.companies = res;

      // 🔥 Set default company (first one or matching user)
      if (this.companies.length > 0) {
        this.leave.companyID = this.companies[0].companyId;
      }

      this.spinner.hide();
      console.log('Loaded companies:', this.companies);
    },
    error: (err) => {
      console.error('Error loading companies:', err);
      this.spinner.hide();
    }
  });
}
loadRegions(): void {
  this.spinner.show();

  this.adminService.getRegions(null, this.userId).subscribe({
    next: (data: Region[]) => {
      this.regions = data.sort((a, b) => b.regionID - a.regionID);

      // 🔥 Set default region
      if (this.regions.length > 0) {
        this.leave.regionID = this.regions[0].regionID;
      }

      this.spinner.hide();
    },
    error: (err) => {
      console.error('Error loading regions:', err);
      this.spinner.hide();
    }
  });
}
  /* ================= SUBMIT ================= */

  onSubmit(form: any): void {
    // this.leave.companyID = this.companyID;
    // this.leave.regionID = this.regionID;
    // this.leave.userID = this.userId;
    const user = sessionStorage.getItem('currentUser');
    if (user) {
      const currentUser = JSON.parse(user);
      this.companyID = currentUser.companyId;
      this.regionID = currentUser.regionId;
      this.userId = currentUser.userId;
    }

    this.spinner.show();

    const request = this.isEditMode
      ? this.adminService.updateLeaveStatus(this.leave.leaveStatusID, this.leave)
      : this.adminService.createLeaveStatus(this.leave);

    request.subscribe({
      next: (res: any) => {
        if (res.success) {
          Swal.fire('Success', res.message, 'success');
          this.loadLeaveStatus();
          form.resetForm();
          this.leave = this.getEmptyLeave();
          this.isEditMode = false;
        } else {
          Swal.fire('Warning', res.message, 'warning');
        }
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
        Swal.fire('Error', err?.error?.message || 'Unexpected error', 'error');
      }
    });
  }

  /* ================= EDIT ================= */

  editLeave(item: LeaveStatus): void {
    this.leave = { ...item };
    console.log(this.leave)
    this.isEditMode = true;
  }

  /* ================= DELETE ================= */

  deleteLeave(item: LeaveStatus): void {
    Swal.fire({
      title: `Delete ${item.leaveStatusName}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then(result => {
      if (result.isConfirmed) {

        this.spinner.show();

        this.adminService
          .deleteLeaveStatus(item.leaveStatusID)
          .subscribe({
            next: (res: any) => {
              if (res.success) {
                Swal.fire('Deleted!', res.message, 'success');
                this.loadLeaveStatus();
              }
              this.spinner.hide();
            },
            error: () => {
              this.spinner.hide();
              Swal.fire('Error', 'Delete failed', 'error');
            }
          });
      }
    });
  }

  /* ================= FILTER ================= */

  filteredLeave(): LeaveStatus[] {
    return this.leaveList.filter(l =>
      l.leaveStatusName.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.statusFilter === '' || l.isActive === this.statusFilter)
    );
  }

  /* ================= PAGINATION ================= */

  get totalPages(): number {
    return Math.ceil(this.filteredLeave().length / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  get pagedLeave(): LeaveStatus[] {
    const sorted = [...this.filteredLeave()].sort((a: any, b: any) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  /* ================= SORT ================= */

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc'
      ? 'fa-sort-up'
      : 'fa-sort-down';
  }

  /* ================= BULK ================= */

  openUploadPopup(): void {
    this.showUploadPopup = true;
  }

  closeUploadPopup(): void {
    this.showUploadPopup = false;
  }

exportAs(type: 'pdf' | 'excel'): void {

  const data = this.filteredLeave();

  if (!data.length) {
    Swal.fire('Info', 'No data to export', 'info');
    return;
  }

  if (type === 'excel') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LeaveStatus');
    XLSX.writeFile(workbook, 'LeaveStatus.xlsx');
  }

  if (type === 'pdf') {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [['ID', 'Name', 'Description', 'Status']],
      body: data.map(item => [
        item.leaveStatusID,
        item.leaveStatusName,
        item.description,
        item.isActive ? 'Active' : 'Inactive'
      ])
    });

    doc.save('LeaveStatus.pdf');
  }
}

 
   // Bulk Upload
 
   onBulkUploadComplete(data: any): void {
     if (data && data.length > 0) {
       this.adminService.bulkInsertData('LeaveStatus', data).subscribe({
         next: () => {
           Swal.fire('Success', 'Leave Status uploaded successfully!', 'success');
           this.loadLeaveStatus();
           this.closeUploadPopup();
         },
         error: () => Swal.fire('Error', 'Failed to upload leave status.', 'error')
       });
     } else {
       Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
     }
    }
}

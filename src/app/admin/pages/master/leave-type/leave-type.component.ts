import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService, LeaveType, Company, Region } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-leave-type',
  standalone: false,
  templateUrl: './leave-type.component.html',
  styleUrl: './leave-type.component.css'
})
export class LeaveTypeComponent {
    companies: Company[] = [];
  regions: Region[] = [];
companyLoaded = false;
userId = Number(sessionStorage.getItem("UserId"));
  companyId: number = Number(sessionStorage.getItem('CompanyId')) || 0;
  regionId: number = Number(sessionStorage.getItem('RegionId')) || 0;
companyMap: { [key: number]: string } = {};
  regionMap: { [key: number]: string } = {};
  leave: any = this.getEmptyLeaveType();
  
  leaveTypeList: LeaveType[] = [];

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  currentPage = 1;
  pageSize = 5;

  sortColumn = 'LeaveTypeName';
  sortDirection: 'asc' | 'desc' = 'asc';

  showUploadPopup = false;

  constructor(
    private admin: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadRegions();
    this.loadCompanies();
    
    this.loadLeaveType();
  }

  // ================= MASTER DATA =================
getEmptyLeaveType(): any {
  return {
    leaveTypeID: 0,
    leaveTypeName: '',
    leaveDays: 1,
    IsActive: true,
    CompanyID: this.companyId,
    RegionID: this.regionId,
    companyName: this.companyMap[this.companyId] || '',
    regionName: this.regionMap[this.regionId] || '',
    userId: Number(sessionStorage.getItem("UserId"))
  };
}

  


  // ================= DROPDOWN EVENTS =================
  onCompanyChange(): void {
    sessionStorage.setItem('CompanyId', this.companyId.toString());

    this.regionId = 0;
    this.regions = [];
    this.leave.CompanyID = this.companyId;

    this.loadRegions();
  }

  onRegionChange(): void {
    sessionStorage.setItem('RegionId', this.regionId.toString());
    this.leave.RegionID = this.regionId;
    this.loadLeaveType();
  }

  // ================= CRUD =================
loadLeaveType(): void {
  if (!this.companyId || !this.regionId) return;
  this.spinner.show();
  this.admin.getLeaveType().subscribe({
  next: (res: LeaveType[]) => {
   this.leaveTypeList = res;
    this.spinner.hide();
  },
  error: () => {
    this.spinner.hide();
    Swal.fire('Error', 'Failed to load Leave Types.', 'error');
  }
});

}

  onSubmit(): void {
 
    this.leave.CompanyID = this.companyId;
    this.leave.RegionID = this.regionId;
 this.leave.userId = this.userId;
  this.leave.companyName = this.companyMap[this.companyId] || '';
  this.leave.regionName = this.regionMap[this.regionId] || '';
    this.spinner.show();
    const obs = this.isEditMode
      ? this.admin.updateLeaveType(this.leave)
      : this.admin.createLeaveType(this.leave);

    obs.subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire(
          this.isEditMode ? 'Updated' : 'Created',
          `Leave Type ${this.isEditMode ? 'updated' : 'created'} successfully`,
          'success'
        );
        
      this.loadLeaveType();  
      this.resetForm();      
      this.spinner.hide();    
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Operation failed', 'error');
      }
    });
  }

 editLeaveType(item: LeaveType): void {
  
  this.isEditMode = true;

  this.leave = { ...item };

  this.companyId = item.CompanyID;
  this.admin.getRegions(this.companyId).subscribe({
    next: (res: Region[]) => {
      this.regions = res || [];
      this.regionId = item.RegionID;
      this.leave.CompanyID = this.companyId;
      this.leave.RegionID = this.regionId;
      this.loadLeaveType(); 
             this.spinner.hide();

    },
    error: () => Swal.fire('Error', 'Failed to load regions', 'error')
  });
}


  deleteLeaveType(item: LeaveType): void {
      console.log('Deleting ID:', item.leaveTypeID); 

    Swal.fire({
      title: `Delete "${item.leaveTypeName}"?`,
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
   this.admin.deleteLeaveType(item.leaveTypeID).subscribe({
          next: () => {
            Swal.fire('Deleted', 'Leave Type deleted successfully', 'success');
            this.loadLeaveType();
                   this.spinner.hide();

          },
          error: (err) => {
            Swal.fire(
              'Error',
              err?.error ?? 'Leave Type already deleted or not found',
              'error'
            );
          }
        });


      }
    });
  }

  resetForm(): void {
  this.leave = {
      leaveTypeID: 0,
      leaveTypeName: '',
      leaveDays: 1,
      IsActive: true,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      companyName: this.companyMap[this.companyId],
      regionName: this.regionMap[this.regionId]
    };

    this.isEditMode = false;
  }

  // ================= FILTER + SORT + PAGE =================
  filteredLeaveType(): LeaveType[] {
    return this.leaveTypeList.filter(c => {
      const matchSearch = c.leaveTypeName.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus = this.statusFilter === '' || c.IsActive === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  get pagedLeaveType(): LeaveType[] {
    const filtered = this.filteredLeaveType();

    filtered.sort((a: any, b: any) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      return this.sortDirection === 'asc'
        ? valA < valB ? -1 : 1
        : valA > valB ? -1 : 1;
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLeaveType().length / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  sortTable(column: string) {
    if (this.sortColumn === column)
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // ================= EXPORT =================
  exportAs(type: 'excel' | 'pdf') {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel() {
    const data = this.leaveTypeList.map(c => ({
      'Company': c.companyName,
      'Region': c.regionName,
      'Leave Type': c.leaveTypeName,
      'Days': c.leaveDays,
      'Active': c.IsActive ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Types');
    XLSX.writeFile(wb, 'LeaveType.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const data = this.leaveTypeList.map(c => [
      c.companyName || '',
      c.regionName || '',
      c.leaveTypeName || '',
      c.leaveDays || '',
      c.IsActive ? 'Yes' : 'No'
    ]);
    autoTable(doc, { head: [['Company', 'Region', 'Leave Type', 'Days', 'Active']], body: data });
    doc.save('LeaveType.pdf');
  }

  // ================= BULK UPLOAD =================
  openUploadPopup() { 
    this.leaveTypeModel = {};
    this.showUploadPopup = true; 
  }
  closeUploadPopup() { this.showUploadPopup = false; }


  leaveTypeModel: any = {};

onBulkUploadComplete(event: any) {
  console.log('Bulk upload completed', event);
  this.closeUploadPopup();
  this.loadLeaveType();
}
loadCompanies(): void {
    this.admin.getCompanies(null,this.userId).subscribe({
      next: (res:any) => (this.companies = res),
      error: () => Swal.fire('Error', 'Failed to load companies.', 'error')
    });
  }

  loadRegions(): void {
    this.admin.getRegions(null,this.userId).subscribe({
      next: (res:any) => (this.regions = res),
      error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
    });
  }
}

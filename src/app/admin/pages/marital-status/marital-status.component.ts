import { Component, OnInit } from '@angular/core';
import { AdminService, MaritalStatus, Company, Region } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-marital-status',
  standalone: false,
  templateUrl: './marital-status.component.html',
  styleUrl: './marital-status.component.css'
})
export class MaritalStatusComponent {
// marital: MaritalStatus = this.getEmptyStatus();
//   statuses: MaritalStatus[] = [];
//   userId = Number(sessionStorage.getItem("UserId"));
//   companyId = Number(sessionStorage.getItem("CompanyId"));
//   regionId = Number(sessionStorage.getItem("RegionId"));

//   companies: Company[] = [];
//   regions: Region[] = [];
//   filteredRegions: Region[] = [];

//   isEditMode = false;
//   searchText = '';
//   statusFilter: boolean | '' = '';
//   pageSize = 5;
//   currentPage = 1;

//   sortColumn = 'statusName';
//   sortDirection: 'asc' | 'desc' = 'asc';
 
//   showUploadPopup = false;
//   maritalModel: any = {};

//   constructor(
//     private adminService: AdminService,
//     private spinner: NgxSpinnerService
//   ) {}

//   ngOnInit(): void {
//     this.loadCompanies();
//     this.loadRegions();
//     this.loadStatuses();
//   }

//   getEmptyStatus(): MaritalStatus {
//     return {
//       maritalStatusID: 0,
//       companyID: 0,
//       regionID: 0,
//       statusName: '',
//       description: '',
//       isActive: true,
//       userId:Number(sessionStorage.getItem("UserId"))
//     };
//   }

//   // ---------------- LOAD DATA ----------------
//   loadStatuses(): void {
//     this.spinner.show();
//     this.adminService.getMaritalStatuses(this.userId).subscribe({
//       next: (res: any[]) => {
//         this.statuses = (res ?? []).map(r => ({
//           maritalStatusID: r.maritalStatusId ?? 0,
//           companyID: r.companyId ?? 0,
//           regionID: r.regionId ?? 0,
//           statusName: r.maritalStatusName ?? '',
//           description: r.description ?? '',
//           isActive: r.isActive ?? false,
//           userId:r.userId
//         }));
//         this.spinner.hide();
//       },
//       error: () => {
//         this.spinner.hide();
//         Swal.fire('Error', 'Failed to load marital statuses', 'error');
//       }
//     });
//   }

//   loadCompanies(): void {
//     this.adminService.getCompanies(null,this.userId).subscribe({
//       next: res => this.companies = res ?? [],
//       error: () => Swal.fire('Error', 'Failed to load companies', 'error')
//     });
//   }

//   loadRegions(): void {
//     this.adminService.getRegions(null,this.userId).subscribe({
//       next: res => {
//         this.regions = res ?? [];
//         this.filteredRegions = [...this.regions];
//       },
//       error: () => Swal.fire('Error', 'Failed to load regions', 'error')
//     });
//   }

//   // ---------------- COMPANY CHANGE ----------------
//   onCompanyChange(): void {
//     const companyId = Number(this.marital.companyID);
//     this.filteredRegions = companyId ? this.regions.filter(r => r.companyID === companyId) : [...this.regions];
//     this.marital.regionID = 0;
//   }

//   // ---------------- CRUD ----------------
//   onSubmit(): void { this.isEditMode ? this.updateStatus() : this.createStatus(); }

//   createStatus(): void {
//     this.spinner.show();
//     this.adminService.createMaritalStatus(this.marital).subscribe({
//       next: () => {
//         this.spinner.hide();
//         Swal.fire('Success', 'Marital status created', 'success');
//         this.resetForm();
//         this.loadStatuses();
//       },
//       error: () => {
//         this.spinner.hide();
//         Swal.fire('Error', 'Create failed', 'error');
//       }
//     });
//   }

//   updateStatus(): void {
//     this.spinner.show();
//     this.adminService.updateMaritalStatus(this.marital).subscribe({
//       next: () => {
//         this.spinner.hide();
//         Swal.fire('Updated', 'Marital status updated', 'success');
//         this.resetForm();
//         this.loadStatuses();
//       },
//       error: () => {
//         this.spinner.hide();
//         Swal.fire('Error', 'Update failed', 'error');
//       }
//     });
//   }

//   editStatus(s: MaritalStatus): void {
//     this.marital = { ...s };
//     this.filteredRegions = this.regions.filter(r => r.companyID === Number(s.companyID));
//     this.isEditMode = true;
//   }

//   deleteStatus(s: MaritalStatus): void {
//     Swal.fire({ title: 'Delete?', showCancelButton: true, confirmButtonText: 'Yes' })
//       .then(res => {
//         if (res.isConfirmed) {
//           this.adminService.deleteMaritalStatus(s.maritalStatusID).subscribe(() => {
//             Swal.fire('Deleted', 'Record deleted', 'success');
//             this.loadStatuses();
//           });
//         }
//       });
//   }

//   resetForm(): void {
//     this.marital = this.getEmptyStatus();
//     this.filteredRegions = [...this.regions];
//     this.isEditMode = false;
//   }

//   // ---------------- FILTER / PAGINATION ----------------
//   filteredStatuses(): MaritalStatus[] {
//     const search = (this.searchText || '').toLowerCase();
//     return this.statuses.filter(s =>
//       (s.statusName || '').toLowerCase().includes(search) &&
//       (this.statusFilter === '' || s.isActive === this.statusFilter)
//     );
//   }

//   get pagedStatuses(): MaritalStatus[] {
//     const start = (this.currentPage - 1) * this.pageSize;
//     return this.filteredStatuses().slice(start, start + this.pageSize);
//   }

//   get totalPages(): number {
//     return Math.ceil(this.filteredStatuses().length / this.pageSize);
//   }

//   goToPage(p: number): void {
//     if (p >= 1 && p <= this.totalPages) this.currentPage = p;
//   }

//   getMin(a: number, b: number): number { return Math.min(a, b); }

//   // ---------------- SORTING ----------------
//   sortTable(column: string): void {
//     if (this.sortColumn === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
//     else { this.sortColumn = column; this.sortDirection = 'asc'; }

//     this.statuses.sort((a, b) => {
//       const valA = (a as any)[column];
//       const valB = (b as any)[column];
//       if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
//       if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
//       return 0;
//     });
//   }

//   getSortIcon(column: string): string {
//     if (this.sortColumn !== column) return 'fa-sort';
//     return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
//   }

//   // ---------------- EXPORT ----------------
//   exportAs(type: 'excel' | 'pdf'): void { type === 'excel' ? this.exportExcel() : this.exportPDF(); }

//   exportExcel(): void {
//     const data = this.statuses.map(s => ({
//       Status: s.statusName,
//       Company: this.getCompanyName(s.companyID),
//       Region: this.getRegionName(s.regionID),
//       Active: s.isActive ? 'Active' : 'Inactive'
//     }));

//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'MaritalStatus');
//     XLSX.writeFile(wb, 'MaritalStatus.xlsx');
//   }

//   exportPDF(): void {
//     const doc = new jsPDF();
//     autoTable(doc, {
//       head: [['Status', 'Company', 'Region', 'Active']],
//       body: this.statuses.map(s => [
//         s.statusName,
//         this.getCompanyName(s.companyID),
//         this.getRegionName(s.regionID),
//         s.isActive ? 'Active' : 'Inactive'
//       ])
//     });
//     doc.save('MaritalStatus.pdf');
//   }

//   getCompanyName(id: number): string { return this.companies.find(c => c.companyId === id)?.companyName || ''; }
//   getRegionName(id: number): string { return this.regions.find(r => r.regionID === id)?.regionName || ''; }

//   // ---------------- BULK UPLOAD ----------------
//   openUploadPopup(): void { this.showUploadPopup = true; }
//   closeUploadPopup(): void { this.showUploadPopup = false; }
//   onBulkUploadComplete(event: any): void { this.loadStatuses(); this.closeUploadPopup(); }
// }
marital: MaritalStatus = this.getEmptyStatus();
  statuses: MaritalStatus[] = [];
  userId = Number(sessionStorage.getItem("UserId"));
  companyId = Number(sessionStorage.getItem("CompanyId"));
  regionId = Number(sessionStorage.getItem("RegionId"));

  companies: Company[] = [];
  regions: Region[] = [];
  filteredRegions: Region[] = [];

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  pageSize = 5;
  currentPage = 1;

  sortColumn = 'statusName';
  sortDirection: 'asc' | 'desc' = 'asc';
 
  showUploadPopup = false;
  maritalModel: any = {};

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadRegions();
    this.loadStatuses();
  }

  getEmptyStatus(): MaritalStatus {
    return {
      maritalStatusID: 0,
      companyID: 0,
      regionID: 0,
      statusName: '',
      description: '',
      isActive: true,
      userId:Number(sessionStorage.getItem("UserId"))
    };
  }

  // ---------------- LOAD DATA ----------------
  loadStatuses(): void {
    this.spinner.show();
    this.adminService.getMaritalStatuses(this.userId).subscribe({
      next: (res: any[]) => {
        this.statuses = (res ?? []).map(r => ({
          maritalStatusID: r.maritalStatusId ?? 0,
          companyID: r.companyId ?? 0,
          regionID: r.regionId ?? 0,
          statusName: r.maritalStatusName ?? '',
          description: r.description ?? '',
          isActive: r.isActive ?? false,
          userId:r.userId
        }));
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load marital statuses', 'error');
      }
    });
  }

loadCompanies(): void {
  this.adminService.getCompanies(null, this.userId).subscribe({
    next: (res: any) => {
      console.log('All Companies 👉', res);

      const data = res?.data ?? res ?? [];

      // 🔥 Only active companies
      this.companies = data.filter((c: any) => c.isActive === true);

      console.log('Active Companies 👉', this.companies);
    },
    error: () => Swal.fire('Error', 'Failed to load companies', 'error')
  });
}

loadRegions(): void {
  this.adminService.getRegions(null, this.userId).subscribe({
    next: (res: any) => {
      console.log('All Regions 👉', res);

      const data = res?.data ?? res ?? [];

      // 🔥 Only active regions
      this.regions = data.filter((r: any) => r.isActive === true);

      // ✅ Important: update filtered list also
      this.filteredRegions = [...this.regions];

      console.log('Active Regions 👉', this.regions);
    },
    error: () => Swal.fire('Error', 'Failed to load regions', 'error')
  });
}

  // ---------------- COMPANY CHANGE ----------------
  onCompanyChange(): void {
    const companyId = Number(this.marital.companyID);
    this.filteredRegions = companyId ? this.regions.filter(r => r.companyID === companyId) : [...this.regions];
    this.marital.regionID = 0;
  }

  // ---------------- CRUD ----------------
  onSubmit(): void { this.isEditMode ? this.updateStatus() : this.createStatus(); }

  // createStatus(): void {
  //   this.spinner.show();
  //   this.adminService.createMaritalStatus(this.marital).subscribe({
  //     next: () => {
  //       this.spinner.hide();
  //       Swal.fire('Success', 'Marital status created', 'success');
  //       this.resetForm();
  //       this.loadStatuses();
  //     },
  //     error: () => {
  //       this.spinner.hide();
  //       Swal.fire('Error', 'Create failed', 'error');
  //     }
  //   });
  // }
  createStatus(): void {


  const exists = this.statuses.some(s =>
    s.statusName.toLowerCase() === this.marital.statusName.toLowerCase() &&
    s.companyID === this.marital.companyID &&
    s.regionID === this.marital.regionID
  );

  if (exists) {
    Swal.fire('Warning', 'Marital Status already exists!', 'warning');
    return;
  }
    this.spinner.show();
    this.adminService.createMaritalStatus(this.marital).subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire('Success', 'Marital status created', 'success');
        this.resetForm();
        this.loadStatuses();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Create failed', 'error');
      }
    });
  }


  // updateStatus(): void {
  //   this.spinner.show();
  //   this.adminService.updateMaritalStatus(this.marital).subscribe({
  //     next: () => {
  //       this.spinner.hide();
  //       Swal.fire('Updated', 'Marital status updated', 'success');
  //       this.resetForm();
  //       this.loadStatuses();
  //     },
  //     error: () => {
  //       this.spinner.hide();
  //       Swal.fire('Error', 'Update failed', 'error');
  //     }
  //   });
  // }
updateStatus(): void {

      const exists = this.statuses.some(s =>
    s.statusName.toLowerCase() === this.marital.statusName.toLowerCase() &&
    s.companyID === this.marital.companyID &&
    s.regionID === this.marital.regionID &&
    s.maritalStatusID !== this.marital.maritalStatusID
  );

  if (exists) {
    Swal.fire('Warning', 'Duplicate marital status not allowed!', 'warning');
    return;
  }
    this.spinner.show();
    this.adminService.updateMaritalStatus(this.marital).subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire('Updated', 'Marital status updated', 'success');
        this.resetForm();
        this.loadStatuses();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Update failed', 'error');
      }
    });
  }

  editStatus(s: MaritalStatus): void {
    this.marital = { ...s };
    this.filteredRegions = this.regions.filter(r => r.companyID === Number(s.companyID));
    this.isEditMode = true;
  }

  deleteStatus(s: MaritalStatus): void {
    Swal.fire({ title: 'Delete?', showCancelButton: true, confirmButtonText: 'Yes' })
      .then(res => {
        if (res.isConfirmed) {
          this.adminService.deleteMaritalStatus(s.maritalStatusID).subscribe(() => {
            Swal.fire('Deleted', 'Record deleted', 'success');
            this.loadStatuses();
          });
        }
      });
  }

  resetForm(): void {
    this.marital = this.getEmptyStatus();
    this.filteredRegions = [...this.regions];
    this.isEditMode = false;
  }

  // ---------------- FILTER / PAGINATION ----------------
  filteredStatuses(): MaritalStatus[] {
    const search = (this.searchText || '').toLowerCase();
    return this.statuses.filter(s =>
      (s.statusName || '').toLowerCase().includes(search) &&
      (this.statusFilter === '' || s.isActive === this.statusFilter)
    );
  }

  get pagedStatuses(): MaritalStatus[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredStatuses().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStatuses().length / this.pageSize);
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  getMin(a: number, b: number): number { return Math.min(a, b); }

  // ---------------- SORTING ----------------
  sortTable(column: string): void {
    if (this.sortColumn === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortColumn = column; this.sortDirection = 'asc'; }

    this.statuses.sort((a, b) => {
      const valA = (a as any)[column];
      const valB = (b as any)[column];
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // ---------------- EXPORT ----------------
  exportAs(type: 'excel' | 'pdf'): void { type === 'excel' ? this.exportExcel() : this.exportPDF(); }

  exportExcel(): void {
    const data = this.statuses.map(s => ({
      Status: s.statusName,
      Company: this.getCompanyName(s.companyID),
      Region: this.getRegionName(s.regionID),
      Active: s.isActive ? 'Active' : 'Inactive'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MaritalStatus');
    XLSX.writeFile(wb, 'MaritalStatus.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Status', 'Company', 'Region', 'Active']],
      body: this.statuses.map(s => [
        s.statusName,
        this.getCompanyName(s.companyID),
        this.getRegionName(s.regionID),
        s.isActive ? 'Active' : 'Inactive'
      ])
    });
    doc.save('MaritalStatus.pdf');
  }

  getCompanyName(id: number): string { return this.companies.find(c => c.companyId === id)?.companyName || ''; }
  getRegionName(id: number): string { return this.regions.find(r => r.regionID === id)?.regionName || ''; }

  // ---------------- BULK UPLOAD ----------------
  openUploadPopup(): void { this.showUploadPopup = true; }
  closeUploadPopup(): void { this.showUploadPopup = false; }
  onBulkUploadComplete(event: any): void { this.loadStatuses(); this.closeUploadPopup(); }
  onCancel(): void {
  this.resetForm();

}
}

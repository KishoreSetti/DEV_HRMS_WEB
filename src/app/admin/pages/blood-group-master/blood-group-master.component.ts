import { Component, OnInit } from '@angular/core';
import { AdminService, BloodGroup } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-blood-group-master',
  standalone: false,
  templateUrl: './blood-group-master.component.html',
  styleUrl: './blood-group-master.component.css'
})
export class BloodGroupMasterComponent {
bloodGroups: BloodGroup[] = [];
  bloodGroup: BloodGroup = this.getEmptyBloodGroup();
  bloodGroupModel: any;
  showUploadPopup = false;
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  pageSize = 5;
  currentPage = 1;

  roleId = 0;
  userId: number = sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0;

  sortColumn = 'bloodGroupID';
  sortDirection: 'asc' | 'desc' = 'desc';
  companies: any[] = [];
  regions: any[] = [];
  filteredRegions: any[] = [];

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
      const currentUser = JSON.parse(user);
      this.userId = currentUser.userId;
      this.roleId = currentUser.roleId;
    }

    this.resetForm();
    this.loadBloodGroups();
    this.loadCompanies();
    this.loadRegions();
  }

  getEmptyBloodGroup(): BloodGroup {
    return {
      bloodGroupID: 0,
      companyID: 0,
      regionID: 0,
      bloodGroupName: '',
      description: '',
      isActive: true,
      userID: this.userId
      
    };
  }

onBloodGroupInput() {
  this.bloodGroup.bloodGroupName =
    this.bloodGroup.bloodGroupName?.toUpperCase().trim();
}


  loadBloodGroups(): void {
    this.spinner.show();
    this.adminService.getBloodGroupsbyID(this.userId).subscribe({
      next: (res: any) => {
       this.bloodGroups = res.data.map((b: any) => ({
        ...b,
        companyName: this.getCompanyName(b.companyID),
        regionName: this.getRegionName(b.regionID)
      }));

      this.spinner.hide();
    },
    error: () => this.spinner.hide()
  });
  }
  loadCompanies(): void {
  this.adminService.getCompanies(null, this.userId).subscribe({
    next: (res: any) => {
      console.log('COMPANIES 👉', res);
      this.companies = res;
    },
    error: () => Swal.fire('Error', 'Failed to load companies', 'error')
  });
}

loadRegions(): void {
  this.adminService.getRegions(null, this.userId).subscribe({
    next: (res: any) => {
      console.log('REGIONS 👉', res);
      this.regions = res;
    },
    error: () => Swal.fire('Error', 'Failed to load regions', 'error')
  });
}

onCompanyChange(): void {
  this.bloodGroup.regionID = 0;

  this.filteredRegions = this.bloodGroup.companyID
    ? this.regions.filter(r => Number(r.companyID) === Number(this.bloodGroup.companyID))
    : [];
}
getCompanyName(companyId: number): string {
  const c = this.companies.find((x: any) =>
    Number(x.companyId ?? x.companyID) === Number(companyId)
  );

  return c ? c.companyName : '-';
}

getRegionName(regionId: number): string {
  const r = this.regions.find((x: any) =>
    Number(x.regionID ?? x.regionId) === Number(regionId)
  );

  return r ? r.regionName : '-';
}
mapNames(): void {
  this.bloodGroups = this.bloodGroups.map(b => ({
    ...b,
    companyName: this.getCompanyName(b.companyID),
    regionName: this.getRegionName(b.regionID)
  }));
}
 onSubmit(form: any): void {

  this.bloodGroup.userID = this.userId;

  this.spinner.show();

  const request = this.isEditMode
    ? this.adminService.updateBloodGroup(
        this.bloodGroup.bloodGroupID,
        this.bloodGroup
      )
    : this.adminService.createBloodGroup(this.bloodGroup);

  request.subscribe({
    next: (res: any) => {
      if (res.success) {
        Swal.fire('Success', res.message, 'success');
        this.loadBloodGroups();
        form.resetForm();     
        this.resetForm();    
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


  editBloodGroup(b: BloodGroup): void {
  this.bloodGroup = {
    ...b,
    description: b.description || ''  
  };
  this.isEditMode = true;
  this.filteredRegions = this.regions.filter(r =>
    Number(r.companyID) === Number(this.bloodGroup.companyID)
  );
}

  deleteBloodGroup(b: BloodGroup): void {
    debugger
    Swal.fire({
      title: `Delete ${b.bloodGroupName}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteBloodGroup(b.bloodGroupID).subscribe({
          next: () => {
             this.loadBloodGroups();
            Swal.fire('Deleted!', '', 'success');
           
            this.spinner.hide();
          },
          error: () => this.spinner.hide()
        });
      }
    });
  }

  resetForm(): void {
    this.bloodGroup = this.getEmptyBloodGroup();
    this.isEditMode = false;
  }

  filteredBloodGroups(): BloodGroup[] {
    return this.bloodGroups.filter(b =>
      b.bloodGroupName.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.statusFilter === '' || b.isActive === this.statusFilter)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredBloodGroups().length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  get pagedBloodGroups(): BloodGroup[] {
    const sorted = [...this.filteredBloodGroups()].sort((a: any, b: any) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  exportAs(type: 'excel' | 'pdf') {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }

  exportExcel() {
    const exportData = this.bloodGroups.map(b => ({
      'Blood Group Name': b.bloodGroupName,
      'Status': b.isActive ? 'Active' : 'Inactive'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BloodGroups');
    XLSX.writeFile(wb, 'BloodGroupList.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const exportData = this.bloodGroups.map(b => [
      b.bloodGroupName,
      b.isActive ? 'Active' : 'Inactive'
    ]);

    autoTable(doc, {
      head: [['Blood Group Name', 'Status']],
      body: exportData
    });

    doc.save('BloodGroupList.pdf');
  }

  // Bulk Upload

  onBulkUploadComplete(data: any): void {
    if (data && data.length > 0) {
      this.adminService.bulkInsertData('BloodGroup', data).subscribe({
        next: () => {
          Swal.fire('Success', 'Blood Groups uploaded successfully!', 'success');
          this.loadBloodGroups();
          this.closeUploadPopup();
        },
        error: () => Swal.fire('Error', 'Failed to upload blood groups.', 'error')
      });
    } else {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
    }
  }

  openUploadPopup() {
    this.showUploadPopup = false;
    setTimeout(() => (this.showUploadPopup = true), 0);
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
  }
  onCancel(): void {
  this.resetForm();

}
}

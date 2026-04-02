import { Component, OnInit } from '@angular/core';
import { AdminService,Relationship } from '../../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-relationship',
  standalone: false,
  templateUrl: './relationship.component.html',
  styleUrl: './relationship.component.css'
})
export class RelationshipComponent {
   userId!: number;
  companyId!: number;
  regionId!: number;
relationship: Relationship = this.getEmptyRelationship();
  relationships: Relationship[] = [];
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  showUploadPopup = false;

  

  currentPage = 1;
  pageSize = 5;
  sortColumn = 'RelationshipID';
  sortDirection: 'asc' | 'desc' = 'desc';
relationshipModel: any = {
  relationshipName: '',
  isActive: true
};
  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
     this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    this.loadRelationships();
    this.loadCompanies();
    this.loadRegions();
  }

  // Empty model
  getEmptyRelationship(): Relationship {
    return {
      relationshipId: 0,
      relationshipName: '',
      companyName: '',
      regionName: '',
      companyId: sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : 0,
      regionId: sessionStorage.getItem('RegionId') ? Number(sessionStorage.getItem('RegionId')) : 0,
      userId:sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0,
      isActive: true
    };
  }
  companies: any[] = [];
  regions: any[] = [];
loadCompanies(): void {
  this.adminService.getCompanies(null, this.userId).subscribe((res: any) => {
    console.log('All Companies 👉', res);

    const data = res?.data ?? res ?? [];

    // 🔥 Filter only active companies
    this.companies = data.filter((c: any) => c.isActive === true);

    // ✅ Build company map correctly
    this.companyMap = this.companies.reduce((map: any, c: any) => {
      map[c.companyId] = c.companyName;
      return map;
    }, {});

    console.log('Active Companies 👉', this.companies);
    console.log('Company Map 👉', this.companyMap);
  });
}

loadRegions(): void {
  debugger;

  this.adminService.getRegions(null, this.userId).subscribe((res: any) => {
    console.log('All Regions 👉', res);

    const data = res?.data ?? res ?? [];

    // 🔥 Filter only active regions
    this.regions = data.filter((r: any) => r.isActive === true);

    // ✅ Build region map correctly
    this.regionMap = this.regions.reduce((map: any, r: any) => {
      map[r.regionID] = r.regionName;
      return map;
    }, {});

    console.log('Active Regions 👉', this.regions);
    console.log('Region Map 👉', this.regionMap);
  });
}
  // Load
  loadRelationships(): void {

    debugger;
    this.spinner.show();
   this.adminService.getcmpregRelationships(this.userId)
  .subscribe({
    next: (res: any) => {

      const list = res.data?.data || res;

      this.relationships = list
        .map((r: any) => ({
          ...r,
          companyName: this.companyMap[r.companyId] ?? '',
          regionName: this.regionMap[r.regionId] ?? ''
        }))
        .sort((a: any, b: any) => b.RelationshipID - a.RelationshipID);

      this.spinner.hide();
    },
    error: () => {
      this.spinner.hide();
      Swal.fire('Error', 'Failed to load Relationship data.', 'error');
    }
  });
  }

  // Submit (Create / Update)
  onSubmit(): void {
    this.spinner.show();
    if (this.isEditMode) {
      this.adminService.updateRelationship(this.relationship).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Updated', `${this.relationship.relationshipName} updated successfully!`, 'success');
          this.loadRelationships();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed. Please contact IT Administrator.', 'error');
        }
      });
    } else {
      this.adminService.createRelationship(this.relationship).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Added', `${this.relationship.relationshipName} added successfully!`, 'success');
          this.loadRelationships();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed. Please contact IT Administrator.', 'error');
        }
      });
    }
  }

  // Edit
  editRelationship(r: Relationship): void {
    this.relationship = { ...r };
    this.isEditMode = true;
  }

  // Delete
  deleteRelationship(r: Relationship): void {
    Swal.fire({
      title: `Are you sure you want to delete ${r.relationshipName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteRelationship(r.relationshipId).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', `${r.relationshipName} deleted successfully.`, 'success');
            this.loadRelationships();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed. Please contact IT Administrator.', 'error');
          }
        });
      }
    });
  }

  // Reset
  resetForm(): void {
    this.relationship = this.getEmptyRelationship();
    this.isEditMode = false;
  }

  // Filter + Search
  filteredRelationships(): Relationship[] {
    const search = this.searchText.toLowerCase();
    return this.relationships.filter(r => {
      const matchesSearch = r.relationshipName.toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === '' || r.isActive === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredRelationships().length / this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  // Sorting
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  applySorting(): void {
    this.relationships.sort((a: any, b: any) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
companyMap: Record<number, string> = {};
regionMap: Record<number, string> = {};
  // Paginated Data
  get pagedRelationships(): Relationship[] {
    const sorted = [...this.filteredRelationships()];
    this.applySorting();
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  // Export
  exportAs(type: 'excel' | 'pdf') {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }

  exportExcel() {
    const exportData = this.relationships.map(r => ({
      'Relationship Name': r.relationshipName,
      'Status': r.isActive ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relationship');
    XLSX.writeFile(wb, 'RelationshipList.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const exportData = this.relationships.map(r => [
      r.relationshipName,
      r.isActive ? 'Active' : 'Inactive'
    ]);
    autoTable(doc, {
      head: [['Relationship Name', 'Status']],
      body: exportData
    });
    doc.save('RelationshipList.pdf');
  }

  // Bulk Upload
  onBulkUploadComplete(data: any): void {
    if (data && data.length > 0) {
      this.adminService.bulkInsertData('Relationship', data).subscribe({
        next: () => {
          Swal.fire('Success', 'Relationship data uploaded successfully!', 'success');
          this.loadRelationships();
          this.closeUploadPopup();
        },
        error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
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
}

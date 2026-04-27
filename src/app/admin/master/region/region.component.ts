import { Component, OnInit } from '@angular/core';
import { AdminService, Region, Company } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-region',
  standalone: false,
  templateUrl: './region.component.html',
  styleUrl: './region.component.css'
})
export class RegionComponent {
 regions: Region[] = [];
  companies: Company[] = [];
  region: Region = this.getEmptyRegion();

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  showUploadPopup = false;

  // Sorting
  sortColumn: string = 'regionID';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  pagedRegions: Region[] = [];

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadRegions();
  }

  // ✅ Load Companies
  loadCompanies(): void {
    this.adminService.getCompanies(null, this.region.userId).subscribe({
    next: (data: any[]) => {
      console.log('All Companies 👉', data);

      // 🔥 Filter only active companies
      this.companies = (data || []).filter((c: any) => c.isActive === true);

      console.log('Active Companies 👉', this.companies);
    },
    error: (err) => console.error('Error loading companies:', err)
  });
  }

  // ✅ Get Company Name
  getCompanyName(companyID: number): string {
    debugger;
    const company = this.companies.find(c => c.companyId === companyID);
    return  company ? company.companyName : '-';
  }

  // ✅ Empty Region Template
  getEmptyRegion(): Region {
    return { regionID: 0, companyID: 0, regionName: '', country: '', isActive: true,userId: sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0 };
  }

  // ✅ Load Regions (Latest First)
  loadRegions(): void {
    this.spinner.show();
    this.adminService.getRegions(null,this.region.userId).subscribe({
      next: (data: Region[]) => {
        debugger;
        // Sort by regionID descending → latest first
        this.regions = data.sort((a, b) => b.regionID - a.regionID);
        this.applySorting();
        this.updatePagedRegions();
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error loading regions:', err);
        this.spinner.hide();
      }
    });
  }

  // ✅ Save / Update Region
  onSubmit(): void {
    this.spinner.show();
    const operation = this.isEditMode
      ? this.adminService.updateRegion(this.region.regionID, this.region)
      : this.adminService.createRegion(this.region);

    operation.subscribe({
      next: () => {
        Swal.fire('Success!', this.isEditMode ? 'Region updated.' : 'Region added.', 'success');
        this.loadRegions();
        this.resetForm();
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error!', 'Operation failed. Contact admin.', 'error');
      }
    });
  }

  editRegion(r: Region): void {
    this.region = { ...r };
    this.isEditMode = true;
  }

  deleteRegion(r: Region): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete region "${r.regionName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteRegion(r.regionID).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Region deleted successfully.', 'success');
            this.loadRegions();
            this.spinner.hide();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error!', 'Unable to delete region.', 'error');
          }
        });
      }
    });
  }

  // ✅ Filter + Sorting + Pagination Combined
  filteredRegions(): Region[] {
    const search = this.searchText.trim().toLowerCase();
    let filtered = this.regions.filter(r => {
      const matchesSearch = !search || r.regionName.toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === '' || r.isActive === this.statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Apply sorting
    filtered = filtered.sort((a, b) => this.compareValues(a, b));

    return filtered;
  }

  // ✅ Sorting Logic
  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  applySorting(): void {
    this.regions.sort((a, b) => this.compareValues(a, b));
    this.updatePagedRegions();
  }

  compareValues(a: any, b: any): number {
    const valA = a[this.sortColumn];
    const valB = b[this.sortColumn];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return this.sortDirection === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    if (typeof valA === 'boolean' && typeof valB === 'boolean') {
      return this.sortDirection === 'asc'
        ? Number(valA) - Number(valB)
        : Number(valB) - Number(valA);
    }

    return this.sortDirection === 'asc' ? valA - valB : valB - valA;
  }

  // ✅ Pagination
  updatePagedRegions(): void {
    const filtered = this.filteredRegions();
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedRegions = filtered.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedRegions();
  }

  changePageSize(event: any): void {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
    this.updatePagedRegions();
  }

  toggleStatus(r: Region): void {
    r.isActive = !r.isActive;
    this.adminService.updateRegion(r.regionID, r).subscribe({
      next: () => Swal.fire('Success!', 'Status updated.', 'success'),
      error: () => Swal.fire('Error!', 'Failed to update status.', 'error')
    });
  }

  exportExcel(): void {
    const exportData = this.regions.map((r, index) => ({
      'S.No': index + 1,
      'Region Name': r.regionName,
      'Company': this.getCompanyName(r.companyID),
      'Country': r.country,
      'Status': r.isActive ? 'Active' : 'Inactive'
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Regions');
    XLSX.writeFile(workbook, 'RegionList.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text('Region List', 40, 40);
    autoTable(doc, {
      startY: 60,
      head: [['S.No', 'Region Name', 'Company', 'Country', 'Status']],
      body: this.regions.map((r, i) => [
        i + 1,
        r.regionName,
        this.getCompanyName(r.companyID),
        r.country,
        r.isActive ? 'Active' : 'Inactive'
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    doc.save('RegionList.pdf');
  }

  resetForm(): void {
    this.region = this.getEmptyRegion();
    this.isEditMode = false;
  }

  regionModel: any;
  openUploadPopup(): void {
    this.regionModel = [
      { regionName: 'South Zone', companyName: 'ABC Technologies Pvt Ltd', country: 'India', isActive: true },
      { regionName: 'North Zone', companyName: 'Global Solutions Ltd', country: 'India', isActive: false }
    ];
    this.showUploadPopup = false;
    setTimeout(() => (this.showUploadPopup = true), 0);
  }

  closeUploadPopup(): void {
    this.showUploadPopup = false;
  }

  onBulkUploadComplete(event: any): void {
    if (event?.success) {
      Swal.fire('Upload Complete!', event.message, 'success');
      this.loadRegions();
    }
  }
    onCancel(): void {
  this.resetForm();

}
}

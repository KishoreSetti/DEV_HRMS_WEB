import { Component, OnInit } from '@angular/core';
import { AdminService,Department,Company,Region } from '../../../servies/admin.service';

import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-department',
  standalone: false,
  templateUrl: './department.component.html',
  styleUrl: './department.component.css'
})
export class DepartmentComponent {
  // Data Lists
  Math: any = Math;
  departments: any[] = [];
  companies: any[] = [];
  regions: any[] = [];

  // Form Model
  department: any = this.getEmptyDepartment();

  // UI Controls
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  pageSize = 5;
  currentPage = 1;
  showUploadPopup = false;
userId: number = sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0;
  // Bulk Upload sample model
  departmentModel: any;

  constructor(
    private departmentService: AdminService,
  
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadCompanies();
    this.loadRegions();
  }

  // ------------------------------------------------------------
  // 🔹 Create empty department model
  // ------------------------------------------------------------
  getEmptyDepartment() {
    return {
      departmentId: 0,
      departmentName: '',
      description: '',
      companyId: '',
      regionId: '',
      isActive: true,
      userId:sessionStorage.getItem("UserId")
    };
  }

  // ------------------------------------------------------------
  // 🔹 Load data
  // ------------------------------------------------------------
  loadDepartments(): void {
    this.departmentService.getDepartments(Number(sessionStorage.getItem("UserId"))).subscribe({
      next: (res:any) => {
        debugger;
        this.departments = res.data;
      },
      error: () => Swal.fire('Error', 'Failed to load departments.', 'error')
    });
  }

  loadCompanies(): void {
    this.departmentService.getCompanies(null,this.userId).subscribe({
      next: (res:any) => {
        debugger;
        this.companies = res;
      },
      error: () => Swal.fire('Error', 'Failed to load companies.', 'error')
    });
  }

  loadRegions(): void {
    this.departmentService.getRegions(null,this.userId).subscribe({
      next: (res:any) => (this.regions = res),
      error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
    });
  }

  // ------------------------------------------------------------
  // 🔹 Create / Update Department
  // ------------------------------------------------------------
  onSubmit(): void {
    debugger;
    if (this.isEditMode) {
      this.department.departmentName=this.department.description;
      this.departmentService.updateDepartment(this.department.departmentId, this.department).subscribe({
        next: () => {
          Swal.fire('Updated!', 'Department updated successfully.', 'success');
          this.loadDepartments();
          this.resetForm();
        },
        error: () => Swal.fire('Error', 'Update failed.', 'error')
      });
    } else {
      this.departmentService.createDepartment(this.department).subscribe({
        next: () => {
          Swal.fire('Added!', 'Department created successfully.', 'success');
          this.loadDepartments();
          this.resetForm();
        },
        error: () => Swal.fire('Error', 'Create failed.', 'error')
      });
    }
  }

  // ------------------------------------------------------------
  // 🔹 Edit / Delete / Status toggle
  // ------------------------------------------------------------
  editDepartment(d: any): void {
    this.department = { ...d };
    this.isEditMode = true;
  }

  deleteDepartment(d: any): void {
    Swal.fire({
      title: `Delete "${d.description}"?`,
      text: 'This will deactivate the department.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        d.isActive = false;
        d.departmentName=d.description;
        this.departmentService.updateDepartment(d.departmentId, d).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Department deactivated successfully.', 'success');
            this.loadDepartments();
          },
          error: () => Swal.fire('Error', 'Delete failed.', 'error')
        });
      }
    });
  }

  toggleStatus(d: any): void {
    const updated = { ...d, isActive: !d.isActive };
    this.departmentService.updateDepartment(d.departmentId, updated).subscribe({
      next: () => {
        d.isActive = updated.isActive;
        Swal.fire('Success', 'Status updated successfully.', 'success');
      },
      error: () => Swal.fire('Error', 'Status update failed.', 'error')
    });
  }

  // ------------------------------------------------------------
  // 🔹 Reset Form
  // ------------------------------------------------------------
  resetForm(): void {
    this.department = this.getEmptyDepartment();
    this.isEditMode = false;
  }

  // ------------------------------------------------------------
  // 🔹 Filter + Pagination
  // ------------------------------------------------------------
  filteredDepartments(): any[] {
    if (!this.departments.length) return [];
    const search = this.searchText.toLowerCase();
    return this.departments.filter((d) => {
      const matchesSearch =
        d.departmentName?.toLowerCase().includes(search) ||
        d.description?.toLowerCase().includes(search);
      const matchesStatus =
        this.statusFilter === '' || d.isActive === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get pagedDepartments(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredDepartments().slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDepartments().length / this.pageSize);
  }

  changePageSize(event: any): void {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  getCompanyName(companyId: number): string {
    const c = this.companies.find((x) => x.companyId === companyId);
    return c ? c.companyName : '-';
  }

  getRegionName(regionId: number): string {
    const r = this.regions.find((x) => x.regionID === regionId);
    return r ? r.regionName : '-';
  }

  // ------------------------------------------------------------
  // 🔹 Export Excel / PDF
  // ------------------------------------------------------------
  exportAs(type: 'excel' | 'pdf') {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }

  exportExcel() {
    const data = this.filteredDepartments().map((d) => ({     
      Description: d.description,
      'Company Name': this.getCompanyName(d.companyId),
      'Region Name': this.getRegionName(d.regionId),
      Status: d.isActive ? 'Active' : 'Inactive'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Departments');
    XLSX.writeFile(wb, 'DepartmentList.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[ 'Description', 'Company', 'Region', 'Status']],
      body: this.filteredDepartments().map((d) => [       
        d.description,
        this.getCompanyName(d.companyId),
        this.getRegionName(d.regionID),
        d.isActive ? 'Active' : 'Inactive'
      ])
    });
    doc.save('DepartmentList.pdf');
  }

  // ------------------------------------------------------------
  // 🔹 Download Template (Excel with sample data)
  // ------------------------------------------------------------
  downloadTemplate() {
    const sampleData = [
      {
       
        Description: 'Handles infrastructure & systems',
        CompanyName: 'ABC Technologies Pvt Ltd',
        RegionName: 'Bangalore',
        IsActive: true
      },
      {
       
        Description: 'Manages employee records & payroll',
        CompanyName: 'Global Solutions Ltd',
        RegionName: 'Mumbai',
        IsActive: true
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'DepartmentTemplate.xlsx');

    Swal.fire('Downloaded!', 'Department template downloaded.', 'success');
  }

  // ------------------------------------------------------------
  // 🔹 Bulk Upload Popup
  // ------------------------------------------------------------
  openUploadPopup() {
    this.departmentModel = [
      {
       
        description: 'Handles IT systems and support',
        companyName: 'ABC Technologies Pvt Ltd',
        regionName: 'Bangalore',
        isActive: true
      },
      {
       
        description: 'Manages financial operations',
        companyName: 'Global Solutions Ltd',
        regionName: 'Mumbai',
        isActive: false
      }
    ];
    this.showUploadPopup = false;
    setTimeout(() => (this.showUploadPopup = true), 0);
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
  }

  onBulkUploadComplete(event: any) {
    Swal.fire('Success', 'Bulk upload completed successfully.', 'success');
    this.loadDepartments();
    this.showUploadPopup = false;
  }
}

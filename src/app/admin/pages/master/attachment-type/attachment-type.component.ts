import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService, AttachmentType } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-attachment-type',
  standalone: false,
  templateUrl: './attachment-type.component.html',
  styleUrl: './attachment-type.component.css'
})
export class AttachmentTypeComponent {
   
  companyId = sessionStorage.getItem('CompanyId') ? +sessionStorage.getItem('CompanyId')! : 0;
  regionId = sessionStorage.getItem('RegionId') ? +sessionStorage.getItem('RegionId')! : 0;
userId = sessionStorage.getItem('UserId') ? +sessionStorage.getItem('UserId')! : 0;
  attachment: AttachmentType = this.getEmptyAttachment();
  attachments: AttachmentType[] = [];
  attachmentsModel: any = {};
  isEditMode = false;

  searchText = '';
  statusFilter: boolean | '' = '';
  currentPage = 1;
  pageSize = 5;

  sortColumn = 'attachmentTypeId';
  sortDirection: 'asc' | 'desc' = 'desc';

  showUploadPopup = false;

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadAttachments();
  }

  getEmptyAttachment(): AttachmentType {
    return {
      attachmentTypeId: 0,
      attachmentCategory: '',   // ✅ Added
      attachmentTypeName: '',
      isActive: true,
      companyId: this.companyId,
      regionId: this.regionId,
      userId : this.userId
    };
  }

  loadAttachments(): void {
    this.spinner.show();
    this.adminService.getAttachmentTypes(this.companyId, this.regionId).subscribe({
      next: res => {
         console.log("API Response:", res); 
        this.attachments = res.data?.data || res;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Attachment Types.', 'error');
      }
    });
  }

  /** ======================
   * Create / Update
   * ====================== */

  onSubmit(): void {
    this.spinner.show();

    if (this.isEditMode) {
      this.adminService.updateAttachmentType(this.attachment).subscribe({
        next: () => {
          debugger;
          this.spinner.hide();
          Swal.fire('Updated', `${this.attachment.attachmentTypeName} updated successfully!`, 'success');
          this.loadAttachments();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed.', 'error');
        }
      });
    } else {
      this.adminService.createAttachmentType(this.attachment).subscribe({
        next: (res: any) => {
          debugger;
          console.log("Create Response:", res);
          this.spinner.hide();
          // Check if response indicates success
         
            Swal.fire('Created', `${this.attachment.attachmentTypeName} added successfully!`, 'success');
            this.loadAttachments();
            this.resetForm();
         
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed.', 'error');
        }
      });
    }
  }

  editAttachment(a: AttachmentType): void {
    this.attachment = { ...a };
    this.isEditMode = true;
  }

  deleteAttachment(a: AttachmentType): void {
    Swal.fire({
      title: `Delete ${a.attachmentTypeName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteAttachmentType(a.attachmentTypeId!).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', `${a.attachmentTypeName} deleted successfully.`, 'success');
            this.loadAttachments();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed.', 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.attachment = this.getEmptyAttachment();
    this.isEditMode = false;
  }

  /** ======================
   * Filtering + Sorting + Pagination
   * ====================== */

  filteredAttachments(): AttachmentType[] {
    return this.attachments.filter(a => {
      const matchesSearch =
        a.attachmentTypeName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        a.attachmentCategory?.toLowerCase().includes(this.searchText.toLowerCase()); // ✅ search category

      const matchesStatus =
        this.statusFilter === '' || a.isActive === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  sortTable(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  get pagedAttachments(): AttachmentType[] {
    const filtered = this.filteredAttachments();

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
    return Math.ceil(this.filteredAttachments().length / this.pageSize) || 1;
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

  /** ======================
   * Export
   * ====================== */

  exportAs(type: 'excel' | 'pdf') {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel() {
    const data = this.attachments.map(a => ({
      'Category': a.attachmentCategory,   // ✅ added
      'Attachment Type': a.attachmentTypeName,
      'Active': a.isActive ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attachments');
    XLSX.writeFile(wb, 'AttachmentTypes.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();

    const data = this.attachments.map(a => [
      a.attachmentCategory,  // ✅ added
      a.attachmentTypeName,
      a.isActive ? 'Yes' : 'No'
    ]);

    autoTable(doc, {
      head: [['Category', 'Attachment Type', 'Active']],
      body: data
    });

    doc.save('AttachmentTypes.pdf');
  }

  /** ======================
   * Bulk Upload
   * ====================== */

  openUploadPopup() { this.showUploadPopup = true; }
  closeUploadPopup() { this.showUploadPopup = false; }

  onBulkUploadComplete(data: any): void {
    if (!data || !data.length) {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
      return;
    }

    this.adminService.bulkInsertData('AttachmentType', data).subscribe({
      next: () => {
        Swal.fire('Success', 'Attachment Type data uploaded successfully!', 'success');
        this.loadAttachments();
        this.closeUploadPopup();
      },
      error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
    });
  }
}
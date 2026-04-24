import { Component, OnInit } from '@angular/core';
import { EmployeeDocument } from '../../../../admin/layout/models/employee-document.model';
import Swal from 'sweetalert2';
import { AdminService } from '../../../../admin/servies/admin.service';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-employee-document',
  standalone: false,
  templateUrl: './employee-document.component.html',
  styleUrl: './employee-document.component.css'
})
export class EmployeeDocumentComponent {
// Sorting
  sortColumn: keyof EmployeeDocument | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
 documentTypes: any[] = [];

  // Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // Search & confidentiality
  searchTerm: string = '';
  // showConfidential true means HR/Admin view; false hides confidential docs from list
  showConfidential: boolean = true;

  // Simulate current user role — set to true if user is HR/Admin (can view confidential)
  isAdmin = true;

  // Form model
  form: any = this.resetForm();

  // File handling
  selectedFile: File | null = null;

  // Edit flag
  editId: number | null = null;

  // Initial data
  documents: EmployeeDocument[] = [];
   userId!: number;
  companyId!: number;
  regionId!: number;
 submitted = false;
issuedFutureError = false;
expiryError = false;
titleRegex = /^[A-Za-z0-9\s\-\/&]+$/;
   fileError: string = '';
  dateError: boolean = false;
  constructor(private adminService: AdminService) {}
ngOnInit() {
  this.loadDocumentTypes();
      this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
 
}

 loadEmployeeDocument() {
  this.adminService.getEmployeeDocumentByEmployeeId(this.userId).subscribe({
    next: (res: any[]) => {
      this.documents = res.map(x => ({
        id: x.id,
        type: this.getDocumentTypeName(x.documentTypeId),  // convert ID → name
        title: x.documentName,
        number: x.documentNumber,
        issuedDate: x.issuedDate,
        expiryDate: x.expiryDate,
        fileName: x.fileName,
         filePath: x.filePath, 
        confidential: x.isConfidential,
        remarks: x.remarks
      }));
    },
    error: (err) => console.error(err)
  });
}
getDocumentTypeName(id: number): string {
  const type = this.documentTypes.find(t => t.id === id);
  return type ? type.typeName : '';
}

 viewDocument(path: string,download = false) {
    this.adminService.ViewDocument(path, download);
  }

loadDocumentTypes() {
  this.adminService.getAttachmentTypesByCategory('Documents')
    .subscribe({
      next: (res: any[]) => {
        this.documentTypes = res.map(x => ({
          id: x.attachmentTypeId,
          typeName: x.attachmentTypeName
        }));
      },
      error: (err) => {
        console.error('Failed to load document types', err);
      }
    });
}


  // ---------------------- SORTING --------------------------
  sortBy(column: keyof EmployeeDocument) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  private getSortedDocuments(): EmployeeDocument[] {
    let data = [...this.documents];

    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = (a[this.sortColumn!] ?? '').toString().toLowerCase();
        const valB = (b[this.sortColumn!] ?? '').toString().toLowerCase();

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }

  // ---------------------- FILTER + PAGINATION --------------------------
  private filtered(): EmployeeDocument[] {
    const term = this.searchTerm.trim().toLowerCase();

    let data = this.getSortedDocuments().filter(d => {
      // confidentiality filter
      if (!this.showConfidential && d.confidential) return false;
      if (!this.isAdmin && d.confidential) return false;

      if (!term) return true;
      return (d.title || '').toLowerCase().includes(term)
        || (d.type || '').toLowerCase().includes(term)
        || (d.number || '').toLowerCase().includes(term);
    });

    return data;
  }

  pagedDocuments(): EmployeeDocument[] {
    const data = this.filtered();
    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered().length / this.pageSize));
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  onSearch() {
    this.currentPage = 1;
  }

  // ---------------------- FORM HELPERS & VALIDATION --------------------------
  onTypeChange() {
    // Called when document type changes so dynamic rules can apply
  }

  isNumberRequired(): boolean {
    const requiredFor = ['PAN', 'Aadhaar', 'Passport', 'Driving Licence', 'Voter ID', 'ESIC', 'PF', 'UAN'];
    return requiredFor.includes((this.form.type || '').trim());
  }

  // file selection and validation
  onFileSelected(event: any) {
    const file: File = event.target.files?.[0];
    if (!file) return;

    const allowed = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = (file.name.split('.').pop() || '').toLowerCase();

    if (!allowed.includes(ext)) {
      Swal.fire({ icon: 'error', title: 'Invalid File Type', text: 'Allowed formats: PDF, JPG, PNG' });
      this.selectedFile = null;
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'File Too Large', text: 'Maximum file size is 5 MB.' });
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.form.fileName = file.name;
  }

  // Convert yyyy-mm-dd to dd/mm/yyyy for display
  formatDate(dateStr?: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = ('0' + d.getDate()).slice(-2);
    const mm = ('0' + (d.getMonth() + 1)).slice(-2);
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // ---------------------- SAVE / UPDATE --------------------------
  saveDocument() {
 this.submitted = true;
  this.issuedFutureError = false;
  this.expiryError = false;

  // Basic required checks
  if (!this.form.type || !this.form.title || !this.form.issuedDate) return;

  // Title checks
  if (this.form.title.length > 150 || !this.titleRegex.test(this.form.title)) return;

  // Document number required for some types
  if (this.isNumberRequired() && !this.form.number) return;
  if (this.form.number && this.form.number.length > 50) return;

  // Issued date future check
  const today = new Date().toISOString().split('T')[0];
  if (this.form.issuedDate > today) {
    this.issuedFutureError = true;
    return;
  }

  // Expiry date check
  if (this.form.expiryDate && this.form.expiryDate < this.form.issuedDate) {
    this.expiryError = true;
    return;
  }

  // File required for NEW upload only
  if (!this.selectedFile && !this.editId) return;

  // Build formData (append Id only for update)
  const formData = new FormData();

  if (this.editId) {
    formData.append("Id", this.editId.toString());
  }
  formData.append("UserId", String(this.userId));
  formData.append("CompanyId", String(this.companyId));
  formData.append("RegionId", String(this.regionId));
  formData.append("DocumentTypeId", this.getDocumentTypeId(this.form.type).toString());
  formData.append("DocumentName", this.form.title);
  formData.append("DocumentNumber", this.form.number ?? "");
  formData.append("IssuedDate", this.form.issuedDate);
  formData.append("ExpiryDate", this.form.expiryDate ?? "");
  formData.append("IsConfidential", this.form.confidential ? "true" : "false");
  formData.append("Remarks", this.form.remarks ?? "");

  if (this.selectedFile) {
    formData.append("DocumentFile", this.selectedFile);
  }

  // CREATE (POST)
  if (!this.editId) {
    this.adminService.addEmployeeDocument(formData).subscribe({
      next: () => {
        Swal.fire('Saved!', 'Document saved successfully.', 'success');
        this.loadEmployeeDocument();
        this.resetForm();
      },
      error: err => {
        console.error('Add document error:', err);
        Swal.fire('Error', 'Failed to save document', 'error');
      }
    });
  }
  // UPDATE (PUT)
  else {
    this.adminService.updateEmployeeDocument(this.editId, formData).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Document updated successfully.', 'success');
        this.loadEmployeeDocument();
        this.resetForm();
        this.editId = null;
      },
      error: err => {
        console.error('Update document error:', err);
        Swal.fire('Error', 'Failed to update document', 'error');
      }
    });
  }
}


  getDocumentTypeId(typeName: string): number {
  const type = this.documentTypes.find(t => t.typeName === typeName);
  return type ? type.id : 0;
}

  // ---------------------- EDIT --------------------------
  editDocument(doc: EmployeeDocument) {
    this.form = { ...doc };
    this.editId = doc.id;
    this.selectedFile = null; // file replace optional
    Swal.fire({ icon: 'info', title: 'Editing Mode', text: 'You can now update the document.' });
    // scroll to top or focus if needed
  }

  // ---------------------- VIEW --------------------------
  canViewFile(doc: EmployeeDocument) {
    if (doc.confidential && !this.isAdmin) return false;
    return !!doc.fileName;
  }

  viewFile(doc: EmployeeDocument) {
    if (!this.canViewFile(doc)) {
      Swal.fire('Access denied', 'You are not authorized to view this confidential document.', 'error');
      return;
    }
    // In real app you'd open a URL to download/view. For demo, show filename in modal.
    Swal.fire({ title: 'File', text: `Open file: ${doc.fileName}`, icon: 'info' });
  }

  // ---------------------- DELETE --------------------------
  deleteDocument(id: number) {
  Swal.fire({
    title: 'Are you sure you want to delete this employee document?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete',
    cancelButtonText: 'Cancel'
  }).then(result => {
    if (result.isConfirmed) {

      this.adminService.deleteEmployeeDocument(id).subscribe({
        next: () => {
          Swal.fire('Deleted!', 'Document deleted.', 'success');
          this.loadEmployeeDocument(); // refresh table
        },
        error: () => Swal.fire('Error', 'Failed to delete document', 'error')
      });

    }
  });
}


  // ---------------------- RESET --------------------------
  resetForm() {
    this.form = {
      type: '',
      title: '',
      number: '',
      issuedDate: '',
      expiryDate: '',
      fileName: '',
      remarks: '',
      confidential: false
    };
    this.editId = null;
    this.selectedFile = null;
    this.currentPage = 1;
    return this.form;
  }

  // small helper to expose to template
  isNumberFieldRequired() {
    return this.isNumberRequired();
  }
}

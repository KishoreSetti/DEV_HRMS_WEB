import { Component } from '@angular/core';
import { EmployeeForm } from '../../../../admin/layout/models/employee-forms.model';
import Swal from 'sweetalert2';
import { AdminService } from '../../../../admin/servies/admin.service';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-employee-forms',
  standalone: false,
  templateUrl: './employee-forms.component.html',
  styleUrl: './employee-forms.component.css'
})
export class EmployeeFormsComponent {
// ---------- STATIC DATA LIST ----------
  formsList: EmployeeForm[] = [];

  // -------- FORM BINDING VARIABLES --------
  documentTypeId: number | string = "";

  documentName: string = "";
  employeeCode: string = "";
  issuedDate: string = "";
  remarks: string = "";
  confidential: boolean = false;
  fileName: string = "";
  

  selectedFile: File | null = null;

  // EDIT MODE
  isEdit: boolean = false;
  editId: number | null = null;

  // Validation / UI helpers
  showValidation = false;
  fileError = '';
  dateError = '';

  // Sorting
  sortColumn: keyof EmployeeForm | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  userId!: number;
  companyId!: number;
  regionId!: number;

  // Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // Search & confidentiality
  searchTerm: string = '';
  showConfidential: boolean = true; // toggle to hide/show confidential in listing
  isAdmin = true; // simulate role
  documentTypes: any[] = [];
  constructor(private adminService: AdminService) {}
 ngOnInit() {
   
   this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
    this.loadDocumentTypes();
    // this.loadEmployeeForms();
 }
 
 loadEmployeeForms() {
  this.adminService.getEmployeeFormsByEmployeeId(this.userId).subscribe({
    next: (res) => {
      this.formsList = res.map((api: any) => {

        // find matching document type from loaded dropdown list
        const typeObj = this.documentTypes.find(d => d.id == api.documentTypeId);

        return {
          id: api.id,
          type: typeObj ? typeObj.typeName : '',   // <-- FIX HERE
          name: api.documentName,
          employee: api.employeeCode,
          date: api.issueDate,
          remarks: api.remarks,
          confidential: api.isConfidential,
          fileName: api.fileName 
          || api.uploadFileName
          || api.uploadFile
          || api.filePath
          || api.fileUrl
          || ''


        };
      });
    },
    error: (err) => console.error(err)
  });
}


//  loadDocumentTypes() {
//    this.adminService.getActiveDocumentTypes().subscribe({
//      next: (res: any) => {
//        this.documentTypes = res; 
//        this.loadEmployeeForms();    
//      },
//      error: (err) => {
//        console.error('Failed to load document types', err);
//      }
//    });
//  }


 loadDocumentTypes() {
  this.adminService.getAttachmentTypesByCategory('Forms')
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

  // ---------------- FILE UPLOAD ----------------
  onFileSelect(event: any) {
    this.fileError = '';
    const f: File = event.target.files?.[0];
    if (!f) return;
    const allowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    if (!allowed.includes(ext)) {
      this.selectedFile = null;
      this.fileName = '';
      this.fileError = 'Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG';
      Swal.fire({ icon: 'error', title: 'Invalid File Type', text: this.fileError });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      this.selectedFile = null;
      this.fileName = '';
      this.fileError = 'File too large. Max 5 MB';
      Swal.fire({ icon: 'error', title: 'File Too Large', text: this.fileError });
      return;
    }
    this.selectedFile = f;
    this.fileName = f.name;
  }

  // viewDocument(fileName: string) {
  //   if (!fileName) {
  //     Swal.fire('File not found!', '', 'error');
  //     return;
  //   }
  
  //   const fileUrl = `${environment.apiUrl}/uploads/EmployeeForms/${fileName}`;
  
  //   const link = document.createElement('a');
  //   link.href = fileUrl;
  //   link.target = "_blank"; 
  //   link.download = fileName;
  //   link.click();
  // }

 viewDocument(path: string,download = false) {
    this.adminService.ViewDocument(path, download);
  }

  // ---------------- ADD / UPDATE FORM ----------------
onSubmit() {
  this.showValidation = true;
  this.dateError = '';
  this.fileError = '';

  if (!this.documentTypeId || !this.documentName || !this.employeeCode || !this.issuedDate || !this.selectedFile) {


    Swal.fire({ icon: 'warning', title: 'Required fields missing', text: 'Please fill all required fields.' });
    return;
  }

  const formData = new FormData();
   if (this.editId) {
    formData.append("Id", this.editId.toString());
  }
  formData.append("DocumentTypeId", this.documentTypeId.toString());

  formData.append("DocumentName", this.documentName);
  formData.append("EmployeeCode", this.employeeCode);
  formData.append("IssueDate", this.issuedDate);
  formData.append("Remarks", this.remarks ?? "");
  formData.append("IsConfidential", this.confidential ? "true" : "false");
  formData.append("UserId", this.userId.toString());
  formData.append("CompanyId", this.companyId.toString());
  formData.append("RegionId", this.regionId.toString());
  

  if (this.selectedFile) {
    formData.append("UploadFile", this.selectedFile);

  }

  if (this.isEdit && this.editId) {
    // ---------- PUT ----------
    this.adminService.updateEmployeeForms(this.editId, formData).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Record updated successfully.' });
        this.loadEmployeeForms();
        this.resetFormInternal();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to update record', 'error');
      }
    });
  } else {
    // ---------- POST ----------
    this.adminService.addEmployeeForms(formData).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Saved!', text: 'Form uploaded successfully.' });
        this.loadEmployeeForms();
        this.resetFormInternal();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to upload form', 'error');
      }
    });
  }
}


  // ---------------- EDIT ----------------
  editRecord(record: EmployeeForm) {
  this.isEdit = true;
  this.editId = record.id;

  const docType = this.documentTypes.find(d => d.typeName === record.type);
  this.documentTypeId = docType ? docType.id : '';
  this.documentName = record.name;
  this.employeeCode = record.employee;
  this.issuedDate = record.date;
  this.remarks = record.remarks;
  this.confidential = record.confidential;
  this.fileName = record.fileName;

  this.selectedFile = null; // user may upload new file

  Swal.fire({ icon: 'info', title: 'Edit Mode', text: 'Form loaded for editing.' });
}


  // ---------------- VIEW FILE ----------------
  viewFile(f: EmployeeForm) {
    if (f.confidential && !this.isAdmin) {
      Swal.fire('Access Denied', 'You are not authorized to view this confidential file.', 'error');
      return;
    }
    // in real app you'd open a URL; for demo show filename
    Swal.fire({ title: 'File', text: `Open file: ${f.fileName}`, icon: 'info' });
  }

  // ---------------- DELETE ----------------
deleteRecord(id: number) {
  Swal.fire({
    title: 'Are you sure you want to delete this record?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete',
    cancelButtonText: 'Cancel'
  }).then(result => {
    if (result.isConfirmed) {
      this.adminService.deleteEmployeeForms(id).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Record removed successfully.' });
          this.loadEmployeeForms();
          if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Failed to delete record', 'error');
        }
      });
    }
  });
}


  // ---------------- RESET ----------------
  onReset() {
    Swal.fire({
      title: 'Reset form?',
      text: 'This will clear the form fields.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset',
      cancelButtonText: 'Cancel'
    }).then(res => {
      if (res.isConfirmed) {
        this.resetFormInternal();
        Swal.fire({ icon: 'success', title: 'Reset', text: 'Form cleared.' });
      }
    });
  }
  getTypeName(id: number): string {
  const found = this.documentTypes.find(x => x.id === id);
  return found ? found.typeName : '';
}


private resetFormInternal() {
  this.documentTypeId  = "";
  this.documentName = "";
  this.employeeCode = "";
  this.issuedDate = "";
  this.remarks = "";
  this.confidential = false;
  this.fileName = "";
  this.selectedFile = null;
  this.isEdit = false;
  this.editId = null;
  this.showValidation = false;
  this.fileError = '';
  this.dateError = '';
  this.currentPage = 1;
}


  // ---------------- SORTING ----------------
  sortBy(column: keyof EmployeeForm) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  private getSorted(): EmployeeForm[] {
    let data = [...this.formsList];

    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = (String((a as any)[this.sortColumn!]) || '').toLowerCase();
        const valB = (String((b as any)[this.sortColumn!]) || '').toLowerCase();
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }

  // ---------------- FILTER + PAGINATION ----------------
  private filtered(): EmployeeForm[] {
    const term = this.searchTerm.trim().toLowerCase();

    let data = this.getSorted().filter(d => {
      if (!this.showConfidential && d.confidential) return false;
      if (!this.isAdmin && d.confidential) return false;

      if (!term) return true;
      return (d.name || '').toLowerCase().includes(term)
        || (d.type || '').toLowerCase().includes(term)
        || (d.employee || '').toLowerCase().includes(term);
    });

    return data;
  }

  pagedForms(): EmployeeForm[] {
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

  toggleConfidential() {
    this.showConfidential = !this.showConfidential;
    this.currentPage = 1;
  }

  // ---------------- HELPERS ----------------
  formatDate(dateStr?: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = ('0' + d.getDate()).slice(-2);
    const mm = ('0' + (d.getMonth() + 1)).slice(-2);
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // onTypeChange() {
  //   // placeholder for conditional behaviour if required per type
  // }

  onDateChange() {
    this.dateError = '';
    const today = new Date().toISOString().split('T')[0];
    if (this.issuedDate && this.issuedDate > today) {
      this.dateError = 'Issued date cannot be a future date.';
    }
  }
}

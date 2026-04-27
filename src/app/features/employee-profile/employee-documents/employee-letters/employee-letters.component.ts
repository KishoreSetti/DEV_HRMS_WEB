import { Component, OnInit } from '@angular/core';
import { EmployeeLetter } from '../../../../admin/layout/models/employee-letter.model';
import Swal from 'sweetalert2';
import { AdminService } from '../../../../admin/servies/admin.service';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-employee-letters',
  standalone: false,
  templateUrl: './employee-letters.component.html',
  styleUrl: './employee-letters.component.css'
})
export class EmployeeLettersComponent {
  sortColumn: keyof EmployeeLetter | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  today: string = new Date().toISOString().split('T')[0];

  userId!: number;
  companyId!: number;
  regionId!: number;
  // Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];
  employees: any[] = [];
  letters: EmployeeLetter[] = [];

  // File
  //selectedFile: File | null = null;

  // Form model
  form: EmployeeLetter = this.resetForm();

  isEdit: boolean = false;
  documentTypes: any[] = [];
  showEmpDropdown = false;

  selectedEmployees: any[] = [];   // multiple employees
  selectedFiles: File[] = [];      // multiple files

  constructor(private adminService: AdminService) { }
  ngOnInit() {
    this.loadDocumentTypes();
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
    this.loadEmployeeLetters();
    this.loadEmployees();
  }
  onEmployeeToggle(emp: any, event: any) {
    if (event.target.checked) {
      this.selectedEmployees.push(emp);
    } else {
      this.selectedEmployees = this.selectedEmployees.filter(
        x => x.employeeCode !== emp.employeeCode
      );
    }
  }
  onFilesSelected(event: any) {
    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const allowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!allowed.includes(ext)) {
        Swal.fire('Error', `${file.name} is invalid format`, 'error');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', `${file.name} exceeds 5MB`, 'error');
        continue;
      }

      // ✅ prevent duplicate files
      const exists = this.selectedFiles.some(f => f.name === file.name);
      if (!exists) {
        this.selectedFiles.push(file);
      }
    }

    // ✅ reset input so same file can be selected again
    event.target.value = '';
  }

  isEmployeeSelected(emp: any): boolean {
    return this.selectedEmployees.some(
      x => x.employeeCode === emp.employeeCode
    );
  }

  loadEmployeeLetters() {
    this.adminService.getEmployeeLettersByEmployeeId(this.userId).subscribe({
      next: (res) => {
        this.letters = res.map((x: any) => ({
          id: x.id,
          documentType: String(x.documentTypeId),
          title: x.documentName,
          empCode: x.employeeCode,
          empName: x.employeeName,
          issuedDate: x.issuedDate,
          validityDate: x.validityDate,
          fileName: x.fileName,
          remarks: x.remarks,
          confidential: x.isConfidential
        }));

      },
      error: (err) => console.error(err)
    });
  }

  viewDocument(path: string, download = false) {
    this.adminService.ViewDocument(environment.LettersPath + path, download);
  }

  getDocumentTypeName(id: string | number): string {
    const numericId = Number(id);
    const doc = this.documentTypes.find(d => d.id === numericId);
    return doc ? doc.typeName : '';
  }


  loadDocumentTypes() {
    this.adminService.getAttachmentTypesByCategory('Letters')
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

  // ------------------------ SORTING -------------------------
  sortBy(column: keyof EmployeeLetter) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortedLetters(): EmployeeLetter[] {
    let data = [...this.letters];

    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = a[this.sortColumn!] ?? '';
        const valB = b[this.sortColumn!] ?? '';

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }

  filteredLetters(): EmployeeLetter[] {
    let data = this.getSortedLetters();
    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.letters.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  // ------------------------ RESET FORM -------------------------
  resetForm() {
    return {
      id: 0,
      documentType: '',
      title: '',
      empCode: '',
      empName: '',
      issuedDate: '',
      validityDate: '',
      fileName: '',
      remarks: '',
      confidential: false
    };
  }

  // ------------------- FILE VALIDATION ------------------------
  // onFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   const allowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
  //   const ext = file.name.split('.').pop().toLowerCase();

  //   if (!allowed.includes(ext)) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Invalid File Type',
  //       text: 'Allowed formats: PDF, DOC, DOCX, JPG, PNG'
  //     });
  //     this.selectedFile = null;
  //     return;
  //   }

  //   if (file.size > 5 * 1024 * 1024) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'File Too Large',
  //       text: 'Maximum file size is 5 MB.'
  //     });
  //     this.selectedFile = null;
  //     return;
  //   }

  //   this.selectedFile = file;
  //   this.form.fileName = file.name;
  // }
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }
  // ------------------- SAVE LETTER (VALIDATION + SAVE) ------------------------
  saveLetter(form: any) {
    

    if (form.invalid || this.selectedEmployees.length === 0 || this.selectedFiles.length === 0) {
      Swal.fire('Error', 'Select employees and files', 'error');
      return;
    }

    const formData = new FormData();
  formData.append("Id", String(this.form.id)); 

    // ✅ combine employees
    const empCodes = this.selectedEmployees.map(e => e.employeeCode).join(',');
    const empNames = this.selectedEmployees.map(e => e.employeeName).join(',');

    formData.append("DocumentTypeId", String(this.form.documentType));
    formData.append("DocumentName", this.form.title);

    formData.append("EmployeeCode", empCodes);
    formData.append("EmployeeName", empNames);

    formData.append("IssuedDate", this.form.issuedDate);
    formData.append("ValidityDate", this.form.validityDate || "");
    formData.append("Remarks", this.form.remarks || "");
    formData.append("IsConfidential", String(this.form.confidential));

    formData.append("UserId", String(this.userId));
    formData.append("CompanyId", String(this.companyId));
    formData.append("RegionId", String(this.regionId));

    // ✅ only first file (temporary limitation)
  this.selectedFiles.forEach(file => {
  formData.append("DocumentFiles", file);
});

    // this.adminService.addEmployeeLetter(formData).subscribe({
    //   next: () => {
    //     Swal.fire('Saved!', 'Letter saved successfully!', 'success');
    //     this.loadEmployeeLetters();
    //     this.resetFormFields();
    //   },
    //   error: (err) => console.error(err)
    // });
    if (this.isEdit) {

  this.adminService.updateEmployeeLetter(this.form.id,formData).subscribe({
    next: () => {
      Swal.fire('Updated!', 'Letter updated successfully!', 'success');
      this.loadEmployeeLetters();
      this.resetFormFields();
    },
    error: (err) => console.error(err)
  });

} else {

  this.adminService.addEmployeeLetter(formData).subscribe({
    next: () => {
      Swal.fire('Saved!', 'Letter saved successfully!', 'success');
      this.loadEmployeeLetters();
      this.resetFormFields();
    },
    error: (err) => console.error(err)
  });

}
  }
  getFileUrl(fileName: string): string {
  return environment.LettersPath + fileName;
}

  // ------------------- EDIT ------------------------
  editLetter(item: EmployeeLetter) {
    this.form = {
      ...item,
      documentType: item.documentType   // This is DocumentTypeId
    };
     if (item.empCode && item.empName) {
    const codes = item.empCode.split(',');
    const names = item.empName.split(',');

    this.selectedEmployees = codes.map((code: string, index: number) => ({
      employeeCode: code,
      employeeName: names[index]
    }));
  }
  // ✅ FIX: bind existing files for display
this.selectedFiles = [];

if (item.fileName) {
  const files = item.fileName.split(',');

  this.selectedFiles = files.map((f: string) => ({
    name: f
  } as File));
}
    this.isEdit = true;

  }


  // ------------------- DELETE ------------------------
  deleteLetter(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete'
    }).then(result => {
      if (result.isConfirmed) {

        this.adminService.deleteEmployeeLetter(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Letter deleted successfully.', 'success');
            this.loadEmployeeLetters();   // reload from backend
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Failed to delete letter', 'error');
          }
        });
      }
    });
  }


  resetFormFields() {
    this.form = this.resetForm();
    this.selectedFiles = [];
    this.selectedEmployees = [];
    this.isEdit = false;
  }


  onEmployeeChange(code: any) {

    const emp = this.employees.find(x => x.employeeCode == code);

    if (emp) {
      this.form.empCode = emp.employeeCode;
      this.form.empName = emp.employeeName;
    }

  }


  loadEmployees() {
    this.adminService.getEmployees(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.employees = res;
        },
        error: (err) => console.error(err)
      });
  }
}

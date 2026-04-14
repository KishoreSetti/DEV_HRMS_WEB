import { Component } from '@angular/core';
import { EmployeeLetter } from '../../../../admin/layout/models/employee-letter.model';
import { environment } from '../../../../../environments/environment';
import { AdminService } from '../../../../admin/servies/admin.service';
import { EmployeeForm } from '../../../../admin/layout/models/employee-forms.model';

@Component({
  selector: 'app-employee-my-letters-forms',
  standalone: false,
  templateUrl: './employee-my-letters-forms.component.html',
  styleUrl: './employee-my-letters-forms.component.css'
})
export class EmployeeMyLettersFormsComponent {
sortColumn: keyof EmployeeLetter | null = null;
formsList: EmployeeForm[] = [];
sortDirection: 'asc' | 'desc' = 'asc';
   documentTypes: any[] = [];
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];
  letters: EmployeeLetter[] = [];
 userId!: number;
// Letters sorting
letterSortColumn: keyof EmployeeLetter | null = null;
letterSortDirection: 'asc' | 'desc' = 'asc';
letterDocumentTypes: any[] = [];
formDocumentTypes: any[] = [];
// Forms sorting
formSortColumn: keyof EmployeeForm | null = null;
formSortDirection: 'asc' | 'desc' = 'asc';
constructor(private adminService: AdminService) {}
ngOnInit() {
  this.loadDocumentTypes();
   this.userId = Number(sessionStorage.getItem("UserId"));
  this.loadEmployeeLetters();
  this.loadEmployeeForms();
}
 loadEmployeeForms() {
  this.adminService.getEmployeeFormsByEmployeeId(this.userId).subscribe({
    next: (res) => {
      this.formsList = res.map((api: any) => {

        // find matching document type from loaded dropdown list
       const typeObj = this.formDocumentTypes.find(d => d.id == api.documentTypeId);
        
        return {
          id: api.id,
          type: typeObj ? typeObj.typeName : '',   // <-- FIX HERE
          name: api.documentName,
         employee: `${api.employeeName} (${api.employeeCode})`,
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
getSortedForms(): EmployeeForm[] {
  let data = [...this.formsList];

  if (this.formSortColumn) {
    data.sort((a, b) => {
      const valA = a[this.formSortColumn!] ?? '';
      const valB = b[this.formSortColumn!] ?? '';

      if (valA < valB) return this.formSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.formSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return data;
}
  loadDocumentTypes() {

  // 🔹 Letters Types
  this.adminService.getAttachmentTypesByCategory('Letters')
    .subscribe({
      next: (res: any[]) => {
        this.letterDocumentTypes = res.map(x => ({
          id: x.attachmentTypeId,
          typeName: x.attachmentTypeName
        }));
      },
      error: (err) => console.error('Letters types error', err)
    });

  // 🔹 Forms Types
  this.adminService.getAttachmentTypesByCategory('Forms')
    .subscribe({
      next: (res: any[]) => {
        this.formDocumentTypes = res.map(x => ({
          id: x.attachmentTypeId,
          typeName: x.attachmentTypeName
        }));

        // ✅ VERY IMPORTANT → call forms after types loaded
        this.loadEmployeeForms();
      },
      error: (err) => console.error('Forms types error', err)
    });
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

getDocumentTypeName(id: string | number): string {
  const numericId = Number(id);
  const doc = this.letterDocumentTypes.find(d => d.id === numericId);
  return doc ? doc.typeName : '';
}
 viewDocument(path: string,download = false) {
    this.adminService.ViewDocument(environment.LettersPath+path, download);
  }
    filteredLetters(): EmployeeLetter[] {
    let data = this.getSortedLetters();
    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }
   getSortedLetters(): EmployeeLetter[] {
    let data = [...this.letters];

   if (this.letterSortColumn) {
  data.sort((a, b) => {
    const valA = a[this.letterSortColumn!] ?? '';
    const valB = b[this.letterSortColumn!] ?? '';

    if (valA < valB) return this.letterSortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return this.letterSortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

    return data;
  }
   sortLetters(column: keyof EmployeeLetter) {
  if (this.letterSortColumn === column) {
    this.letterSortDirection = this.letterSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.letterSortColumn = column;
    this.letterSortDirection = 'asc';
  }
}
   pagedForms(): EmployeeForm[] {
      const data = this.filtered();
      const start = (this.currentPage - 1) * this.pageSize;
      return data.slice(start, start + this.pageSize);
    }
    sortForms(column: keyof EmployeeForm) {
  if (this.formSortColumn === column) {
    this.formSortDirection = this.formSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.formSortColumn = column;
    this.formSortDirection = 'asc';
  }
}
  filtered(): EmployeeForm[] {
  return this.getSortedForms(); // or your filter logic
}

formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const dd = ('0' + d.getDate()).slice(-2);
  const mm = ('0' + (d.getMonth() + 1)).slice(-2);
  const yyyy = d.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}

}

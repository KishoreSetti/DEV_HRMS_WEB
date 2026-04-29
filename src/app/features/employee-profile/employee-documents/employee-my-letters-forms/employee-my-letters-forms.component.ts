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
 letters: EmployeeLetter[] = [];
  employeeCode: string = '';
documentTypes: any[] = [];
companyId: number = 0;
regionId: number = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDocumentTypes();
    this.employeeCode = sessionStorage.getItem("EmployeeCode") || '';
      this.companyId = Number(sessionStorage.getItem("CompanyId"));
  this.regionId = Number(sessionStorage.getItem("RegionId"));
    this.loadMyLetters();
    
  }
  loadDocumentTypes() {
  this.adminService.getAttachmentTypesByCategory('Letters')
    .subscribe((res: any[]) => {
      this.documentTypes = res.map(x => ({
        id: x.attachmentTypeId,
        name: x.attachmentTypeName
      }));
    });
}
getDocumentTypeName(id: number | string): string {
  const doc = this.documentTypes.find(d => d.id == Number(id));
  return doc ? doc.name : '';
}
loadMyLetters() {
  this.adminService.getMyLetters(
    this.employeeCode,
    this.companyId,
    this.regionId
  ).subscribe({
    next: (res: any[]) => {
      this.letters = res.map(x => ({
        id: x.id,
        documentType: x.documentTypeId,   // FIX
        title: x.documentName,            // FIX
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



  viewDocument(file: string) {
    window.open(environment.LettersPath + file, '_blank');
  }

}

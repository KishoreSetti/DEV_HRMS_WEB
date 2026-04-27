import { Component } from '@angular/core';
import { AdminService } from '../../../../admin/servies/admin.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-employee-myforms',
  standalone: false,
  templateUrl: './employee-myforms.component.html',
  styleUrl: './employee-myforms.component.css'
})
export class EmployeeMyformsComponent {
 forms: any[] = [];
  employeeCode: string = '';
  documentTypes: any[] = [];
employeeFilesMap: { [key: number]: File[] } = {};
companyId: number = 0;
regionId: number = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.employeeCode = sessionStorage.getItem("EmployeeCode") || '';
     this.companyId = Number(sessionStorage.getItem("CompanyId"));
  this.regionId = Number(sessionStorage.getItem("RegionId"));
    this.loadDocumentTypes();
    this.loadMyForms();
  }

  loadDocumentTypes() {
    this.adminService.getAttachmentTypesByCategory('Forms')
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
  

 loadMyForms() {
  this.adminService.getMyForms(this.employeeCode, this.companyId, this.regionId).subscribe({
    next: (res: any[]) => {
      this.forms = res.map(x => ({
        id: x.id,
        documentType: x.documentTypeId,
        name: x.documentName,
        issuedDate: x.issueDate,
        remarks: x.remarks,
        filePaths: x.filePaths || []
      }));
    },
    error: (err) => console.error(err)
  });
}

uploadFiles(formId: number) {
  const files = this.employeeFilesMap[formId];

  if (!files || files.length === 0) {
    alert("Please select files");
    return;
  }

  const formData = new FormData();

  formData.append("Id", formId.toString());
  formData.append("EmployeeCode", this.employeeCode);

  files.forEach(file => {
    formData.append("DocumentFiles", file);
  });

  this.adminService.uploadEmployeeFiles(formData).subscribe({
    next: () => {
      alert("Files uploaded successfully");
      this.employeeFilesMap[formId] = []; // clear after upload
    },
    error: (err) => {
      console.error(err);
      alert("Upload failed");
    }
  });
}
  viewDocument(path: string) {
    const baseUrl = environment.apiUrl.replace('/api', '');
    window.open(`${baseUrl}/${path}`, '_blank');
  }
  onFileSelect(event: any, formId: number) {
  const files = event.target.files;

  if (!this.employeeFilesMap[formId]) {
    this.employeeFilesMap[formId] = [];
  }

  for (let i = 0; i < files.length; i++) {
    this.employeeFilesMap[formId].push(files[i]);
  }
}
}

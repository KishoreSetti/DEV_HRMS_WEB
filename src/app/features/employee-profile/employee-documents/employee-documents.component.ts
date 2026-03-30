import { Component } from '@angular/core';

@Component({
  selector: 'app-employee-documents',
  standalone: false,
  templateUrl: './employee-documents.component.html',
  styleUrl: './employee-documents.component.css'
})
export class EmployeeDocumentsComponent {
canViewLetters :boolean= false;
canViewForms :boolean= false;
canViewDocuments :boolean= false;
ngOninit(){
    this.loadTabPermissions();
  }
loadTabPermissions() {

  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const letters = menus.find((m:any) => 
      m.menuName?.trim().toLowerCase() === "hr letters");

  const forms = menus.find((m:any) => 
      m.menuName?.trim().toLowerCase() === "documents");

  const documents = menus.find((m:any) => 
      m.menuName?.trim().toLowerCase() === "employee Documents");

  this.canViewLetters = letters?.canView ?? false;
  this.canViewForms = forms?.canView ?? false;
  this.canViewDocuments = documents?.canView ?? false;

}
}

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
canViewMyLetters :boolean= false;
selectedTab: string = '';
canViewMyForms :boolean= false;
ngOnInit(){
  
    this.loadTabPermissions();
  }
loadTabPermissions() {

  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const letters = menus.find((m:any) => 
      m.menuName?.trim().toLowerCase() === "hr letters");

  const forms = menus.find((m:any) => 
      m.menuName?.trim().toLowerCase() === "forms");

  const documents = menus.find((m:any) => 
      m.menuName?.trim().toLowerCase() === "employee documents");

    const mylettersforms = menus.find((m:any) => 
        m.menuName?.trim().toLowerCase() === "my letters/forms");
    
    const myforms = menus.find((m:any) => 
        m.menuName?.trim().toLowerCase() === "my forms");

  this.canViewLetters = letters?.canView ?? false;
  this.canViewForms = forms?.canView ?? false;
  this.canViewDocuments = documents?.canView ?? false;
  this.canViewMyLetters = mylettersforms?.canView ?? false;
  this.canViewMyForms = myforms?.canView ?? false;

    if (this.canViewLetters) this.selectedTab = 'tab1';
  else if (this.canViewForms) this.selectedTab = 'tab2';
  else if (this.canViewDocuments) this.selectedTab = 'tab3';
  else if (this.canViewMyLetters) this.selectedTab = 'tab4';
  else if (this.canViewMyForms) this.selectedTab = 'tab5';
}
}

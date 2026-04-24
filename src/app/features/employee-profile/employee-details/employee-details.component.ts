import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-employee-details',
  standalone: false,
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.css'
})
export class EmployeeDetailsComponent {
canViewPersonal = false;
canViewFamily = false;
canViewEmergency = false;
canViewReference = false;
selectedTab: string = '';
constructor(public router: Router) {}
ngOnInit(): void {

  this.loadTabPermissions();   }

loadTabPermissions() {

  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const personal = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "personal details"
  );

  const family = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "family details"
  );

  const emergency = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "emergency contact"
  );

  const reference = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "references"
  );

  this.canViewPersonal = personal?.canView ?? false;
  this.canViewFamily = family?.canView ?? false;
  this.canViewEmergency = emergency?.canView ?? false;
  this.canViewReference = reference?.canView ?? false;

  if (this.canViewPersonal) this.selectedTab = 'tab1';
  else if (this.canViewFamily) this.selectedTab = 'tab2';
  else if (this.canViewEmergency) this.selectedTab = 'tab3';
  else if (this.canViewReference) this.selectedTab = 'tab4';

}
}

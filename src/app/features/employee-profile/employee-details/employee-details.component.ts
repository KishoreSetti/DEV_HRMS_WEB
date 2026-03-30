import { Component } from '@angular/core';

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

}
}

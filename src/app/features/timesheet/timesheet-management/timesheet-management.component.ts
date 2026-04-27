import { Component } from '@angular/core';

@Component({
  selector: 'app-timesheet-management',
  standalone: false,
  templateUrl: './timesheet-management.component.html',
  styleUrl: './timesheet-management.component.css'
})
export class TimesheetManagementComponent {
canViewSubmitTimesheet = false;
canViewApproveTimesheet = false;
selectedTab: string = '';

ngOnInit() {
  this.loadTabPermissions();
}

loadTabPermissions() {

  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const submit = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "submit timesheet"
  );

  const approve = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "approve timesheet"
  );

  

  this.canViewSubmitTimesheet = submit?.canView ?? false;
  this.canViewApproveTimesheet = approve?.canView ?? false;
  

  if (this.canViewSubmitTimesheet) this.selectedTab = 'tab1';
  else if (this.canViewApproveTimesheet) this.selectedTab = 'tab2';
  

}

}

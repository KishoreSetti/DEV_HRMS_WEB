import { Component } from '@angular/core';

@Component({
  selector: 'app-employee-finance',
  standalone: false,
  templateUrl: './employee-finance.component.html',
  styleUrl: './employee-finance.component.css'
})
export class EmployeeFinanceComponent {
 canViewBank :boolean= false;
  canViewDD :boolean= false;
  canViewW4 :boolean= false;
selectedTab:string = '';

  ngOnInit() {
    this.loadTabPermissions();
  }

  loadTabPermissions() {

    const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

    const bank = menus.find((m:any) =>
      m.menuName?.trim().toLowerCase() === "bank details");

    const dd = menus.find((m:any) =>
      m.menuName?.trim().toLowerCase() === "dd");

    const w4 = menus.find((m:any) =>
      m.menuName?.trim().toLowerCase() === "w4");

    this.canViewBank = bank?.canView ?? false;
    this.canViewDD = dd?.canView ?? false;
    this.canViewW4 = w4?.canView ?? false;

     if (this.canViewBank) this.selectedTab = 'tab1';
  else if (this.canViewDD) this.selectedTab = 'tab2';
  else if (this.canViewW4) this.selectedTab = 'tab3';
 
  }
}

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
  }
}

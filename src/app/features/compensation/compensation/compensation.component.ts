import { Component } from '@angular/core';

@Component({
  selector: 'app-compensation',
  standalone: false,
  templateUrl: './compensation.component.html',
  styleUrl: './compensation.component.css'
})
export class CompensationComponent {
   activeTab: string = '';
   selectedTab: string = '';
      setTab(tab: string) {
    this.activeTab = tab;
  }
  payslips = [
    { month: 'October 2025', gross: 5000, net: 4500, status: 'Paid' },
    { month: 'September 2025', gross: 5000, net: 4500, status: 'Paid' },
    { month: 'August 2025', gross: 5000, net: 4500, status: 'Paid' }
  ];

  salaryStructure = [
    { name: 'Basic', amount: 3000 },
    { name: 'HRA', amount: 1000 },
    { name: 'Allowances', amount: 500 },
    { name: 'Bonus', amount: 500 }
  ];

  bonuses = [
    { type: 'Performance Bonus', amount: 500, date: '15-Oct-2025', status: 'Paid' }
  ];

  taxDocs = [
    { name: 'Form 16', year: '2024-25' },
    { name: 'Tax Certificate', year: '2024-25' }
  ];

  benefits = [
    { name: 'Health Insurance', details: 'Company Provided' },
    { name: 'Provident Fund', details: '5% of Basic' }
  ];

  deductions = [
    { type: 'TDS', amount: 300, reason: 'Income Tax' },
    { type: 'Loan EMI', amount: 200, reason: 'Personal Loan' }
  ];

  payslipFilterMonth: string = '';
  showModal = false;
  selectedPayslip: any = null;

  totalGross = 15000;
  totalNet = 13500;
  totalBonus = 1500;
  totalDeduction = 1000;

  filterPayslips() {
    if (this.payslipFilterMonth) {
      const filterMonth = new Date(this.payslipFilterMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
      this.payslips = this.payslips.filter(slip => slip.month === filterMonth);
    }
  }

  viewPayslip(slip: any) {
    this.selectedPayslip = slip;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedPayslip = null;
  }

  downloadPayslip(slip: any) {
    const content = `
Payslip - ${slip.month}
Employee: John Doe (EMP001)
Gross Salary: ${slip.gross}
Net Salary: ${slip.net}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip-${slip.month}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  canViewPayslip: boolean = false;
  canViewHRDashboard: boolean = false;

  ngOnInit() {
    this.loadCompensationPermissions();
  }

  loadCompensationPermissions() {
    const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

    // Employee Payslip
    const payslipMenu = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === "employee payslip"
    );

    // HR Payslip Dashboard
    const hrMenu = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === "hr payslip dashboard"
    );

    this.canViewPayslip = payslipMenu?.canView ?? false;
    this.canViewHRDashboard = hrMenu?.canView ?? false;

    if (this.canViewPayslip) this.selectedTab = 'tab1';
  else if (this.canViewHRDashboard) this.selectedTab = 'tab2';
  }
}

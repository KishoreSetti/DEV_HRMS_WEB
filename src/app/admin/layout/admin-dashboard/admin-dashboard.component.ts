import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { EmployeePayRollService } from '../../../employee-pay-roll.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  userId!: number;

  employees: any[] = [];
  payrollList: any[] = [];
  departments: any[] = [];

  totalPayrollAmount = 0;
  today: Date = new Date();
  stats: any[] = [];

  performanceChart: any;
  deptChart: any;

  // ✅ PAGINATION
  page = 1;
  pageSize = 5;
  departmentMap: { [key: number]: string } = {};
  designationMap: { [key: number]: string } = {};

  constructor(private payrollService: EmployeePayRollService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem('UserId'));
    this.loadDepartments();
    this.loadEmployees();
    this.loadDesignations(); 
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initPerformanceChart();
    }, 500);
  }

  /* ================= PAGINATION ================= */

  get paginatedEmployees() {
    const start = (this.page - 1) * this.pageSize;
    return this.employees.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.employees.length / this.pageSize) || 1;
  }

  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }

  /* ================= DATA ================= */

  loadDepartments() {
  this.payrollService.getDepartments(this.userId)
    .subscribe((res: any) => {

      const deptList =
        res?.data?.data?.data ||   // ✅ correct nested path
        res?.data?.data ||
        res?.data ||
        [];

      this.departments = deptList;

      // ✅ build map: departmentId -> departmentName
      this.departmentMap = {};
      deptList.forEach((d: any) => {
        this.departmentMap[d.departmentId] = d.departmentName;
      });

      this.prepareStats();
      this.mapDepartmentNames(); // in case employees already loaded
    });
}
mapDepartmentNames() {
  this.employees = this.employees.map(emp => ({
    ...emp,
    departmentName: this.departmentMap[emp.departmentId] || '-'
  }));
}
loadDesignations() {
  this.payrollService.getDesignations(this.userId)
    .subscribe((res: any) => {

      const designationList =
        res?.data?.data?.data ||   // ✅ correct
        res?.data?.data ||
        res?.data ||
        [];

      this.designationMap = {};

      designationList.forEach((d: any) => {
        this.designationMap[d.designationID] = d.designationName; // ✅ FIXED KEY
      });

      this.mapDesignationNames(); // apply after loading
    });
}
mapDesignationNames() {
  this.employees = this.employees.map(emp => ({
    ...emp,
    designationName: this.designationMap[emp.designationId] || '-'  // OK
  }));
}

  loadEmployees() {
    this.payrollService.getEmployees(this.userId)
      .subscribe(res => {
        this.employees = res || [];
        this.mapDepartmentNames();
        this.mapDesignationNames();
        this.loadPayroll();
        this.prepareStats();
        this.initDeptChart();
      });
  }

  loadPayroll() {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    this.payrollService
      .getPayrollByMonth(month, year, this.userId)
      .subscribe(res => {

        const empMap: any = {};
        this.employees.forEach(e => empMap[e.userId] = e);

        this.payrollList = (res || []).map((p: any) => ({
          ...p,
          fullName: empMap[p.userId]?.fullName || '-',
          employeeCode: empMap[p.userId]?.employeeCode || '-'
        }));

        this.totalPayrollAmount = this.payrollList
          .reduce((sum, p) => sum + (p.netSalary || 0), 0);

        this.prepareStats();
      });
  }

  prepareStats() {
    this.stats = [
      { title: 'Employees', value: this.employees.length, icon: 'fa-users', color: '#922b21' },
      { title: 'Departments', value: this.departments.length, icon: 'fa-building', color: '#1e88e5' },
      { title: 'Payroll', value: '₹' + this.totalPayrollAmount.toLocaleString(), icon: 'fa-rupee-sign', color: '#43a047' },
      { title: 'Pending', value: this.payrollList.filter(p => p.status !== 'Processed').length, icon: 'fa-clock', color: '#f39c12' }
    ];
  }

  /* ================= CHARTS ================= */

  initPerformanceChart() {
    if (this.performanceChart) this.performanceChart.destroy();

    this.performanceChart = new Chart('performanceChart', {
      type: 'line',
      data: {
        labels: ['Week1', 'Week2', 'Week3', 'Week4'],
        datasets: [{
          label: 'Attendance %',
          data: [94, 96, 92, 97],
          borderColor: '#922b21',
          tension: 0.4
        }]
      }
    });
  }

  initDeptChart() {
    if (this.deptChart) this.deptChart.destroy();

    const counts: any = {};
    this.employees.forEach(e => {
      counts[e.departmentName || 'Others'] =
        (counts[e.departmentName || 'Others'] || 0) + 1;
    });

    this.deptChart = new Chart('deptChart', {
      type: 'doughnut',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          data: Object.values(counts),
          backgroundColor: ['#922b21','#1e88e5','#43a047','#f39c12']
        }]
      }
    });
  }
}

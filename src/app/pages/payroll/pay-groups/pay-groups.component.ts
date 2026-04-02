import { Component, OnInit } from '@angular/core';
import { EmployeePayRollService } from '../../../employee-pay-roll.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-pay-groups',
  standalone: false,
  templateUrl: './pay-groups.component.html',
  styleUrl: './pay-groups.component.css'
})
export class PayGroupsComponent {
 userId!: number;
  companyId!: string;
  regionId!: string;

  salary: any;
  salaries: any[] = [];

  employees: any[] = [];
  structures: any[] = [];

  companies: any[] = [];
  regions: any[] = [];

  companyMap: { [key: string]: string } = {};
  regionMap: { [key: string]: string } = {};

  searchText = '';


  currentPage = 1;
  pageSize = 5;
  constructor(private payrollService: EmployeePayRollService) { }

  // ================= Init =================

  ngOnInit(): void {

    this.userId = Number(sessionStorage.getItem('userCompanyId'));
    this.companyId = sessionStorage.getItem('CompanyId') || '';
    this.regionId = sessionStorage.getItem('RegionId') || '';

    this.salary = this.getEmptySalary();

    this.loadCompanies();
    this.loadRegions();
    this.loadEmployees();
    this.loadStructures();
    this.loadAllAssignedSalaries();
  }

  // ================= Empty Model =================

  getEmptySalary() {
    return {
      employeeId: null,
      structureId: null,
      effectiveFrom: null,   // 🔥 must match DTO name
      ctc: null,             // 🔥 must match DTO
      companyId: this.companyId,
      regionId: this.regionId,
      isActive: true
    };
  }

  //================ Load Salries ==========================

  loadAllAssignedSalaries() {
    this.payrollService.getAllAssignedSalaries(this.userId)
      .subscribe({
        next: (res:any) => {
          console.log("API Response:", res);   // 🔥 ADD THIS
          this.salaries = res || [];
        },
        error: (err:any) => {
          console.error(err);
        }
      });
  }

  getEmployeeName(employeeId: number): string {
    const emp = this.employees.find(e => e.userId == employeeId);
    return emp ? emp.fullName : '';
  }

  getStructureName(structureId: number): string {
    const structure = this.structures.find(s => s.structureId == structureId);
    return structure ? structure.structureName : '';
  }

  // ================= Dropdown Loads =================

  loadCompanies() {
    this.payrollService.getCompanies(this.userId)
      .subscribe((res:any) => {
        this.companies = res || [];
        this.companies.forEach(c => {
          this.companyMap[c.companyId] = c.companyName;
        });
      });
  }

  loadRegions() {
    this.payrollService.getRegions(this.userId)
      .subscribe((res:any) => {
        this.regions = res || [];
        this.regions.forEach(r => {
          this.regionMap[r.regionId] = r.regionName;
        });
      });
  }

  loadEmployees() {
    this.payrollService.getEmployees(this.userId)
      .subscribe((res:any) => this.employees = res || []);
  }

  loadStructures() {
    this.payrollService.getAllSalaryStructures(this.userId)
      .subscribe((res:any) => this.structures = res || []);
  }

  // ================= Assign Salary =================

  onSubmit() {

    if (!this.salary.employeeId || !this.salary.structureId) {
      Swal.fire('Error', 'Select Employee and Structure', 'error');
      return;
    }

    const payload = {
      employeeId: Number(this.salary.employeeId),
      structureId: Number(this.salary.structureId),
      effectiveFrom: this.salary.effectiveFrom,  // 🔥 correct name
      ctc: Number(this.salary.ctc || 0),
      isActive: true
    };

    console.log("Sending Payload:", payload);

    Swal.fire({
      title: 'Processing...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.payrollService.assignSalary(this.userId, payload)
      .subscribe({
        next: () => {
          Swal.close();
          Swal.fire('Assigned!', 'Salary assigned successfully', 'success');
          this.loadAllAssignedSalaries();
          this.getEmployeeSalary(payload.employeeId);
          this.resetForm();
        },
        error: (err:any) => {
          Swal.close();
          console.error(err);
          Swal.fire('Error', 'Something went wrong', 'error');
        }
      });
  }

  // ================= Get Employee Salary =================

  getEmployeeSalary(employeeId: number) {

    this.payrollService.getEmployeeSalary(
      employeeId,
      this.userId
    ).subscribe((res:any) => {
      this.salaries = res || [];
    });
  }

  // ================= When Employee Changes =================

  onEmployeeChange() {
    if (this.salary.employeeId) {
      this.getEmployeeSalary(this.salary.employeeId);
    }
  }

  // ================= Reset =================

  resetForm() {
    this.salary = this.getEmptySalary();
  }

  // ================= Search Filter =================

  filteredSalaries() {
    return this.salaries.filter(s =>
      s.structureName?.toLowerCase()
        .includes(this.searchText.toLowerCase())
    );
  }

  //====================== Pagination Code ========================

  get paginatedSalaries() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.salaries.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.salaries.length / this.pageSize);
  }
}

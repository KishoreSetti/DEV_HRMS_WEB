import { Component } from '@angular/core';
import { AdminService } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-attendance-list',
  standalone: false,
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.css'
})
export class AttendanceListComponent {
fromDate: string = '';
toDate: string = '';

 todayDate: Date = new Date();

  employees: any[] = [];
  reports: any[] = [];

  showReport = false;

  companyId!: number;
  regionId!: number;

  constructor(private adminService: AdminService) {}

  // ================= EMPLOYEE PAGINATION =================

  currentPage = 1;
  itemsPerPage = 10;

  get paginatedEmployees() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.employees.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.employees.length / this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  // ================= REPORT PAGINATION =================

  reportPage = 1;
  reportPerPage = 5;

  get paginatedReports() {
    const start = (this.reportPage - 1) * this.reportPerPage;
    return this.reports.slice(start, start + this.reportPerPage);
  }

  get reportTotalPages() {
    return Math.ceil(this.reports.length / this.reportPerPage);
  }

  changeReportPage(page: number) {
    if (page >= 1 && page <= this.reportTotalPages) {
      this.reportPage = page;
    }
  }

  previousPage() {
    if (this.reportPage > 1) {
      this.reportPage--;
    }
  }

  nextPage() {
    if (this.reportPage < this.reportTotalPages) {
      this.reportPage++;
    }
  }

  // ================= INIT =================

  ngOnInit(): void {

    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    this.loadEmployees();
    this.loadPermission();  // ✅ ADD THIS
if (!this.canView) {
    Swal.fire("Access Denied", "You don't have permission", "error");
    return;
  }

  }

  // ================= LOAD EMPLOYEES =================

  loadEmployees() {
debugger;
    Swal.fire({
      title: 'Loading Employees...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.adminService.getEmployees(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {

          Swal.close();

          console.log(res);

          this.employees = res;

          if (this.employees.length === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'No Employees',
              text: 'No employees found',
              timer: 3000,
              showConfirmButton: false
            });
          }

        },
        error: (err) => {

          Swal.close();

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load employees',
            timer: 3000,
            showConfirmButton: false
          });

          console.error(err);
        }
      });
  }

  // ================= SAVE ATTENDANCE =================

saveAllAttendance() {
   if (!this.canCreate) {
    Swal.fire("No Permission", "You cannot save attendance", "warning");
    return;
  }

  const employees = this.employees.map(emp => ({
    ...emp,
    clockIn: emp.clockIn || null,
    clockOut: emp.clockOut || null,
    grossTime: emp.grossTime || null
  }));

  const payload = {
    companyId: this.companyId,
    regionId: this.regionId,
    attendanceDate: new Date().toISOString().split('T')[0],
    employees: employees
  };

  this.adminService.saveAttendance(payload).subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Attendance saved successfully'
      });
    },
    error: (err) => {
      console.error(err);
    }
  });
}

  // ================= WEEKLY REPORT =================

  weekly() {

    Swal.fire({
      title: 'Fetching Weekly Report...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.adminService.weeklyReport(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {

          Swal.close();

          this.reports = res;
          this.showReport = true;

          // Reset to first page
          this.reportPage = 1;
        },
        error: (err) => {

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load weekly report',
            timer: 3000,
            showConfirmButton: false
          });

          console.error(err);
        }
      });
  }

  // ================= MONTHLY REPORT =================

  monthly() {

    Swal.fire({
      title: 'Fetching Monthly Report...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.adminService.monthlyReport(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {

          Swal.close();

          this.reports = res;
          this.showReport = true;

          // Reset page
          this.reportPage = 1;
        },
        error: (err) => {

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load monthly report',
            timer: 3000,
            showConfirmButton: false
          });

          console.error(err);
        }
      });
  }

  /// Seacrch reports by dates
searchReport() {

  if (!this.fromDate || !this.toDate) {
    alert("Please select From Date and To Date");
    return;
  }

  this.adminService
    .dateRangeReport(this.companyId, this.regionId, this.fromDate, this.toDate)
    .subscribe((res: any) => {

      this.reports = res;
      this.reportPage = 1;
      this.paginatedReports

    });
}


canView: boolean = false;
canCreate: boolean = false;
 
loadPermission() {
 
  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");
 
  const menu = menus.find((m: any) =>
    m.menuName?.trim().toLowerCase() === "attendance list"
  );
 
  if (menu) {
    this.canView = menu.canView;
    this.canCreate = menu.canAdd;
  }
}


}

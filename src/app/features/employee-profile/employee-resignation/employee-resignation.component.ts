import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EmployeeResignationService } from '../employee-services/employee-resignation.service';
import { EmployeeResignation } from '../employee-models/EmployeeResignation';
import { commonConstants } from '../../../core/common';
type ColumnKey =
  | 'showIndex'
  | 'type'
  | 'notice'
  | 'lastDay'
  | 'reason'
  | 'status'
  | 'actions';
@Component({
  selector: 'app-employee-resignation',
  standalone: false,
  templateUrl: './employee-resignation.component.html',
  styleUrl: './employee-resignation.component.css'
})
export class EmployeeResignationComponent {
    canViewResignation = false;
  canViewApproval=false;
  resignations: EmployeeResignation[] = [];
  filteredResignations: EmployeeResignation[] = [];
  resignationModel: EmployeeResignation = { resignationType: '' };
  filter = { resignationType: '', fromDate: '', toDate: '' };
  employeeCode = commonConstants.employeeCode;
  employeeName = commonConstants.employeeName;
  message = '';
  isEditMode = false;
  dateError = '';
  formSubmitted = false;

  // Pagination
  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  totalPagesArray: number[] = [];

  // Session Values
  companyId = Number(sessionStorage.getItem("CompanyId"));
  regionId = Number(sessionStorage.getItem("RegionId"));
  // employeeCode = sessionStorage.getItem("EmployeeCode") || "";
  roleId = Number(sessionStorage.getItem("roleId"));
 activeTab: 'list' | 'manager' | 'hr' = 'list'; // default tab
  constructor(private resignationService: EmployeeResignationService) {}

  ngOnInit(): void {
    this.loadResignations();
     this.loadPermissions();
  }

  loadResignations() {
    this.resignationService.getAll(this.companyId, this.regionId, this.roleId).subscribe({
      next: (data) => {
        this.resignations = data;
        this.filteredResignations = data;
        this.updatePagination();
      },
      error: (err) => console.error('Error loading resignations:', err),
    });
  }
loadPermissions() {

  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const resignation = menus.find((m:any) =>
      m.menuName?.trim().toLowerCase() === "resignation/exit");

  this.canViewResignation = resignation?.canView ?? false;
  this.canViewApproval=resignation?.canView ?? false;;

}
  // ---------------- FILTER --------------------
  applyFilter() {
    const typeInput = (this.filter.resignationType || '').trim().toLowerCase();
    const fromDate = this.filter.fromDate ? new Date(this.filter.fromDate) : null;
    const toDate = this.filter.toDate ? new Date(this.filter.toDate) : null;

    this.filteredResignations = this.resignations.filter(item => {
      const itemType = (item.resignationType || '').trim().toLowerCase();
      const itemDate = item.lastWorkingDay ? new Date(item.lastWorkingDay) : null;

      const typeMatch = typeInput ? itemType.includes(typeInput) : true;
      const dateMatch =
        (!fromDate || (itemDate && itemDate >= fromDate)) &&
        (!toDate || (itemDate && itemDate <= toDate));

      return typeMatch && dateMatch;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  columns: Record<ColumnKey, boolean> = {
    showIndex: true,
    type: true,
    notice: true,
    lastDay: true,
    reason: true,
    status: true,
    actions: true
  };

  allColumns: { key: ColumnKey; label: string; visible: boolean }[] = [
    { key: 'showIndex', label: '#', visible: true },
    { key: 'type', label: 'Type', visible: true },
    { key: 'notice', label: 'Notice Period', visible: true },
    { key: 'lastDay', label: 'Last Working Day', visible: true },
    { key: 'reason', label: 'Reason', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  updateVisibleColumns() {
    this.allColumns.forEach(col => {
      this.columns[col.key] = col.visible;
    });
  }

  resetFilter() {
    this.filter = { resignationType: '', fromDate: '', toDate: '' };
    this.filteredResignations = this.resignations;
    this.updatePagination();
  }

  // ---------------- Pagination --------------------
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredResignations.length / this.pageSize);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ---------------- Validation --------------------
  validateLastWorkingDay() {
    this.dateError = '';
    if (!this.resignationModel.lastWorkingDay) return;

    const selectedDate = new Date(this.resignationModel.lastWorkingDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.dateError = 'Last working day must be today or a future date.';
    }
  }

  saveResignation(form: NgForm) {
    this.formSubmitted = true;
    this.message = '';

    Object.values(form.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });

    if (
      !this.resignationModel.resignationReason ||
      this.resignationModel.resignationReason.trim().length < 10 ||
      form.invalid ||
      this.dateError
    ) return;

    // Add CompanyId + RegionId before saving
    this.resignationModel.companyId = this.companyId;
    this.resignationModel.regionId = this.regionId;
    this.resignationModel.userId = this.roleId;
  // this.resignationModel.employeeId = sessionStorage.getItem("EmployeeCode") || '';
    
    const apiCall = this.isEditMode && this.resignationModel.resignationId
      ? this.resignationService.update(this.resignationModel.resignationId, this.resignationModel)
      : this.resignationService.create(this.resignationModel);

    apiCall.subscribe({
      next: () => {
        this.message = this.isEditMode
          ? 'Resignation updated successfully!'
          : 'Resignation submitted successfully!';
        this.resetForm(form);
        this.loadResignations();
      },
      error: (err) => {
        console.error('Error saving resignation:', err);
        this.message = err.error?.message || 'Failed to save resignation.';
      },
    });
  }

  editResignation(item: EmployeeResignation) {
    this.resignationModel = { ...item };
    this.isEditMode = true;
  }
deleteResignation(id: number) {
  if (confirm('Are you sure you want to delete this resignation?')) {
    this.resignationService
      .delete(id, this.companyId, this.regionId, this.roleId) // ✅ pass all 4 args
      .subscribe({
        next: () => {
          this.message = 'Resignation deleted successfully!';
          this.loadResignations();
        },
        error: (err) => (this.message = 'Failed to delete resignation: ' + err.message),
      });
  }
}

loadForManager() {
  const managerUserId = Number(sessionStorage.getItem('UserId'));
  this.resignationService
    .getResignationsForManager(managerUserId) // ✅ pass companyId, regionId
    .subscribe((res: EmployeeResignation[]) => {
      this.filteredResignations = res;
    });
}




  resetForm(form: NgForm) {
    form.resetForm();
    this.resignationModel = { resignationType: '' };
    this.isEditMode = false;
    this.dateError = '';
    this.formSubmitted = false;
  }
}

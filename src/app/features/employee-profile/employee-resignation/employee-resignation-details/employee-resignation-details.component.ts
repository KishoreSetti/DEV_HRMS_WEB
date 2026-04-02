import { Component } from '@angular/core';
import { EmployeeResignationService } from '../../employee-services/employee-resignation.service';
import { EmployeeResignation } from '../../employee-models/EmployeeResignation';
import { commonConstants } from '../../../../core/common';
import { NgForm } from '@angular/forms';
import { AdminService,ResignationModel } from '../../../../admin/servies/admin.service';
type ColumnKey =
  | 'showIndex'
  | 'type'
  | 'notice'
  | 'lastDay'
  | 'reason'
  | 'status'
  | 'actions';
@Component({
  selector: 'app-employee-resignation-details',
  standalone: false,
  templateUrl: './employee-resignation-details.component.html',
  styleUrl: './employee-resignation-details.component.css'
})
export class EmployeeResignationDetailsComponent {
 resignationTypes: ResignationModel[] = []; // fetched from master table
  resignations: EmployeeResignation[] = [];
  filteredResignations: EmployeeResignation[] = [];
  resignationModel: EmployeeResignation = { resignationType: '' };

  employeeCode = commonConstants.employeeCode;
  employeeName = commonConstants.employeeName;
  filter = { resignationType: '', fromDate: '', toDate: '' };
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
  companyId = Number(sessionStorage.getItem('CompanyId'));
  regionId = Number(sessionStorage.getItem('RegionId'));
  roleId = Number(sessionStorage.getItem('roleId'));

  activeTab: 'list' | 'manager' | 'hr' = 'list';

  constructor(private resignationService: EmployeeResignationService,private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadResignations();
    this.loadResignationTypes();
  }
 loadResignationTypes() {
    this.adminService.getResignations(this.companyId, this.regionId).subscribe({
      next: (res: ResignationModel[]) => {
        // optionally filter active ones only
        this.resignationTypes = res.filter(r => r.isActive);
      },
      error: (err) => console.error('Error loading resignation types:', err)
    });
  }
 onResignationTypeChange() {
  const selected = this.resignationTypes.find(r => r.resignationType === this.resignationModel.resignationType);
  if (selected) {
    this.resignationModel.noticePeriod = selected.noticePeriodDays.toString(); // convert number to string
    this.setLastWorkingDay(this.resignationModel.noticePeriod);
  } else {
    this.resignationModel.noticePeriod = '';
  }
}
setLastWorkingDay(noticePeriodStr: string) {
  const today = new Date();
  const lastDay = new Date();
  lastDay.setDate(today.getDate() + parseInt(noticePeriodStr || '0'));

  // Format date as yyyy-MM-dd (required for input type="date")
  const formattedDate = lastDay.toISOString().split('T')[0];

  this.resignationModel.lastWorkingDay = formattedDate;
}
  // loadResignations() {
  //   this.resignationService.getAll(this.companyId, this.regionId, this.roleId).subscribe({
  //     next: (data) => {
  //       this.resignations = data;
  //       this.filteredResignations = data;
  //       this.updatePagination();
  //     },
  //     error: (err) => console.error('Error loading resignations:', err),
  //   });
  // }
  loadResignations() {
  const loggedEmployeeCode = sessionStorage.getItem('EmployeeCode');

  this.resignationService.getAll(this.companyId, this.regionId, this.roleId).subscribe({
    next: (data) => {

      // ✅ FILTER ONLY LOGIN USER DATA
      this.resignations = data.filter(r => r.employeeId === loggedEmployeeCode);

      this.filteredResignations = this.resignations;
      this.updatePagination();
    },
    error: (err) => console.error('Error loading resignations:', err),
  });
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

    this.resignationModel.userId = Number(sessionStorage.getItem('UserId'));
    this.resignationModel.employeeId = sessionStorage.getItem('EmployeeCode') || '';
    this.resignationModel.companyId = this.companyId;
    this.resignationModel.regionId = this.regionId;

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

  // ---------------- DELETE FIXED ----------------
loadForManager() {
  const managerUserId = Number(sessionStorage.getItem('UserId'));
  this.resignationService
    .getResignationsForManager(managerUserId) // ✅ pass companyId, regionId
    .subscribe((res: EmployeeResignation[]) => {
      this.filteredResignations = res;
    });
}
deleteResignation(id: number) {
  if (confirm('Are you sure you want to delete this resignation?')) {
    this.resignationService
      .delete(id, this.companyId, this.regionId, this.roleId) // pass all 4 args
      .subscribe({
        next: () => {
          this.message = 'Resignation deleted successfully!';
          this.loadResignations();
        },
        error: (err) => (this.message = 'Failed to delete resignation: ' + err.message),
      });
  }
}


  resetForm(form: NgForm) {
    form.resetForm();
    this.resignationModel = { resignationType: '' };
    this.isEditMode = false;
    this.dateError = '';
    this.formSubmitted = false;
  }
}

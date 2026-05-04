import { Component } from '@angular/core';
import { AdminService, Company, Region } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

export interface TaskStatus {
  taskStatusId: number;
  taskStatusName: string;
  description?: string;
  companyId: number;
  regionId: number;
  isActive: boolean;
  userId?: number;
}

@Component({
  selector: 'app-task-status',
  standalone: false,
  templateUrl: './task-status.component.html',
  styleUrl: './task-status.component.css'
})
export class TaskStatusComponent {
 taskStatusList: TaskStatus[] = [];
  taskStatus!: TaskStatus;
  allRegions: Region[] = [];
   isEditMode = false;
  searchText = '';
  pageSize = 5;
  currentPage = 1;

  companies: Company[] = [];
  regions: Region[] = [];
   companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};

  userId = Number(sessionStorage.getItem('UserId')) || 0;

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}
   ngOnInit(): void {
    this.taskStatus = this.getEmptyTaskStatus();
    this.loadCompanies();
    this.loadRegions();
    this.loadTaskStatuses();
  }

  getEmptyTaskStatus(): TaskStatus {
    return {
      taskStatusId: 0,
      taskStatusName: '',
      description: '',
      companyId: 0,
      regionId: 0,
      isActive: true,
      userId: this.userId
    };
  }
  loadCompanies() {
    this.adminService.getCompanies(null, this.userId).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        this.companies = data.filter((c: any) => c.isActive);
        this.companyMap = {};
        this.companies.forEach((c: any) => {
          this.companyMap[c.companyId] = c.companyName;
        });
      }
    });
  }

  loadRegions() {
    this.adminService.getRegions(null, this.userId).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        this.allRegions = data.filter((r: any) => r.isActive);
        this.regionMap = {};
        this.allRegions.forEach((r: any) => {
          this.regionMap[r.regionID] = r.regionName;
        });
      }
    });
  }
  loadTaskStatuses() {
    this.spinner.show();
    this.adminService.getTaskStatuses(this.userId).subscribe({
      next: (res: any) => {
        this.taskStatusList = res.data || res;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
      }
    });
  }

  onCompanyChange() {
    this.taskStatus.regionId = 0;
    this.regions = this.allRegions.filter(
      r => r.companyID == this.taskStatus.companyId
    );
  }
 onSubmit() {
    this.taskStatus.userId = this.userId;

    const obs = this.isEditMode
      ? this.adminService.updateTaskStatus(this.taskStatus)
      : this.adminService.createTaskStatus(this.taskStatus);

    obs.subscribe({
      next: (res: any) => {
        if (!res.success) {
          Swal.fire('Warning', 'Record already exists', 'warning');
          return;
        }

        Swal.fire('Success', res.message, 'success');
        this.loadTaskStatuses();
        this.resetForm();
      },
      error: () => {
        Swal.fire('Error', 'Operation failed', 'error');
      }
    });
  }

  editTaskStatus(item: TaskStatus) {
    this.taskStatus = { ...item };
    this.regions = this.allRegions.filter(
      r => r.companyID == item.companyId
    );
    this.isEditMode = true;
  }
 deleteTaskStatus(item: TaskStatus) {
    Swal.fire({
      title: 'Delete this task status?',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteTaskStatus(item.taskStatusId).subscribe(() => {
          this.loadTaskStatuses();
        });
      }
    });
  }

  resetForm() {
    this.taskStatus = this.getEmptyTaskStatus();
    this.regions = [];
    this.isEditMode = false;
  }
filteredTaskStatuses() {
    return this.taskStatusList.filter(x =>
      x.taskStatusName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  get pagedTaskStatuses() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTaskStatuses().slice(start, start + this.pageSize);
  }

}

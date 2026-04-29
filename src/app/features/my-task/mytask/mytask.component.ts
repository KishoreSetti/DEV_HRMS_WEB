import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { TaskService } from '../service/task.service';
import { AdminService } from '../../../admin/servies/admin.service';
import { HelpdeskService } from '../../helpdesk/service/helpdesk.service';

@Component({
  selector: 'app-mytask',
  standalone: false,
  templateUrl: './mytask.component.html',
  styleUrl: './mytask.component.css'
})
export class MytaskComponent {
 userId!: number;
  companyId!: number;
  regionId!: number;

  tasks: any[] = [];
  allTasks: any[] = [];

  priorities: any[] = [];
  taskStatuses: any[] = [];
  projects: any[] = [];

  selectedStatus = '';
  selectedPriority = '';
  fromDate = '';
  toDate = '';
  searchText = '';

  constructor(
    private taskService: TaskService,
    private adminService: AdminService,
    private helpdeskService: HelpdeskService
  ) {}

  ngOnInit() {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    this.loadTasks();
    this.loadDropdowns();
    this.loadProjects();
  }
  loadProjects(){
  this.adminService.getProjectNames(this.companyId, this.regionId)
    .subscribe((res:any)=>{
      this.projects = res.data || res;
    });
}

  loadTasks() {
    this.taskService.getMyTasks(this.userId).subscribe((res:any)=>{
      this.allTasks = res.data || res;
      this.tasks = [...this.allTasks];
    });
  }

  loadDropdowns() {
    this.adminService.getTaskStatusesByCompanyRegion(this.companyId, this.regionId)
      .subscribe((res:any)=> this.taskStatuses = res.data || res);

    this.helpdeskService.getPriorities(this.companyId, this.regionId)
      .subscribe(res => this.priorities = res);
  }

  // ✅ STATUS UPDATE
  updateStatus(task: any) {
  const payload = {
    taskId: task.taskId,
    taskName: task.taskName,
    projectId: task.projectId,
    assignedTo: task.assignedTo,
    priorityId: task.priorityId,
    statusId: task.statusId,
    startDate: task.startDate,
    dueDate: task.dueDate,
    comment: task.comment,
    userId: this.userId,
    companyId: this.companyId,
    regionId: this.regionId
  };

  this.taskService.updateTask(payload).subscribe(() => {
    Swal.fire("Updated", "Status Updated", "success");
  });
}

  // 🔍 FILTER
  applyFilters(){
    this.tasks = this.allTasks.filter(t=>{
      return (!this.selectedStatus || t.statusId == this.selectedStatus)
        && (!this.selectedPriority || t.priorityId == this.selectedPriority);
    });
  }

  // 🔹 HELPERS
  getPriorityName(id:number){
    return this.priorities.find(x=>x.priorityId==id)?.priorityName;
  }

  getProjectName(id:number){
    return this.projects.find(x=>x.projectMasterId==id)?.projectName;
  }

  // ✏️ EDIT POPUP (OPTIONAL)
  openEdit(task:any){
    Swal.fire({
      title: task.taskName,
      html: `
        <b>Project:</b> ${this.getProjectName(task.projectId)} <br>
        <b>Comment:</b> ${task.comment || ''}
      `,
      confirmButtonText: 'Close'
    });
  }
get summaryCards() {
  return [
    {
      label: 'Total Tasks',
      value: this.tasks.length,
      icon: 'fa fa-list-check',
      bg: 'bg-light',
      iconBg: 'bg-primary-subtle text-primary'
    },
    {
      label: 'Pending',
      value: this.getCount('Pending'),
      icon: 'fa fa-clock',
      bg: 'bg-warning-subtle',
      iconBg: 'bg-warning text-white'
    },
    {
      label: 'In Progress',
      value: this.getCount('In Progress'),
      icon: 'fa fa-spinner',
      bg: 'bg-info-subtle',
      iconBg: 'bg-info text-white'
    },
    {
      label: 'Completed',
      value: this.getCount('Completed'),
      icon: 'fa fa-check',
      bg: 'bg-success-subtle',
      iconBg: 'bg-success text-white'
    }
  ];
}
getCount(statusName: string): number {
  return this.tasks.filter(t =>
    this.getStatusName(t.statusId)?.toLowerCase() === statusName.toLowerCase()
  ).length;
}
getStatusName(id: number) {
  const s = this.taskStatuses.find(x => x.taskStatusId == id);
  return s ? s.taskStatusName : '';
}
}

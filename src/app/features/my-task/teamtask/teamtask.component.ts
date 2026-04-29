import { Component } from '@angular/core';
import { AdminService } from '../../../admin/servies/admin.service';
import { HelpdeskService } from '../../helpdesk/service/helpdesk.service';
import { TaskService } from '../service/task.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-teamtask',
  standalone: false,
  templateUrl: './teamtask.component.html',
  styleUrl: './teamtask.component.css'
})
export class TeamtaskComponent {
  allTasks: any[] = [];

selectedEmployee: string = '';
selectedStatus: string = '';
selectedPriority: string = '';
fromDate: string = '';
toDate: string = '';
searchText: string = '';
  showModal = false;
  isEditMode = false;
  editIndex: number | null = null;
  employees: any[] = [];   // dynamic data
  showMentionDropdown = false;
  userId!: number;
  companyId!: number;
  regionId!: number;
  priorities: any[] = [];
  taskStatuses: any[] = [];
  showEmojiPicker = false;
  selectedFiles: File[] = [];
  projects: any[] = [];
  // toggle dropdown
  toggleMention() {
    this.showMentionDropdown = !this.showMentionDropdown;
  }
  toggleEmoji() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }
  // ADD THESE METHODS INSIDE TeamtaskComponent

getTotalTasks(): number {
  return this.tasks.length;
}

getTaskCountByStatus(statusName: string): number {
  return this.tasks.filter(task =>
    this.getStatusName(task.statusId).toLowerCase() === statusName.toLowerCase()
  ).length;
}

getOverdueTasks(): number {
  const today = new Date();

  return this.tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const status = this.getStatusName(task.statusId).toLowerCase();

    return dueDate < today && status !== 'completed';
  }).length;
}

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // ✅ allowed formats
      const allowed = [
        'pdf', 'doc', 'docx',
        'xls', 'xlsx',
        'jpg', 'jpeg', 'png',
        'txt', 'zip'
      ];

      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!allowed.includes(ext)) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid File',
          text: `${file.name} is not supported`
        });

        continue;
      }

      // ✅ size limit (5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'File Too Large',
          text: `${file.name} exceeds 5MB`
        });

        continue;
      }

      // ✅ avoid duplicate
      const exists = this.selectedFiles.some(f => f.name === file.name);
      if (!exists) {
        this.selectedFiles.push(file);
      }
    }

    // reset input
    event.target.value = '';
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }
  addEmoji(event: any) {
    const emoji = event.emoji.native;

    this.newTask.comment =
      (this.newTask.comment || '') + emoji;

    this.showEmojiPicker = false;
  }
  // select employee
  selectMention(emp: any) {
    const mentionText = `@${emp.employeeName} `;

    this.newTask.comment =
      (this.newTask.comment || '') + mentionText;

    this.showMentionDropdown = false;
  }
  constructor(private adminService: AdminService, private helpdeskService: HelpdeskService, private service: AdminService
    , private taskService: TaskService
  ) { }

  ngOnInit() {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
    this.loadEmployees();
    this.loadPriorities();
    this.loadTaskStatuses();
    this.loadProjects();
    this.loadTasks();
  }
  loadProjects(): void {
    this.service.getProjectNames(this.companyId, this.regionId)
      .subscribe(res => {
        if (res.success && res.data) {
          this.projects = res.data;
        }
      });
  }
  loadTaskStatuses() {
    this.adminService
      .getTaskStatusesByCompanyRegion(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.taskStatuses = res.data || res;
        },
        error: (err) => console.error(err)
      });
  }
  loadPriorities() {
    this.helpdeskService
      .getPriorities(this.companyId, this.regionId)
      .subscribe(res => {
        this.priorities = res;
      });
  }

  loadEmployees() {
    this.adminService.getEmployees(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.employees = res;
        },
        error: (err) => console.error(err)
      });
  }
  getStatusName(id: number) {
    const s = this.taskStatuses.find(x => x.taskStatusId == id);
    return s ? s.taskStatusName : '';
  }

  tasks: any[] = [];




  newTask: any = this.getEmptyTask();

  openModal() {
    this.showModal = true;
    this.isEditMode = false;
  }
  getPriorityName(id: number) {
    const p = this.priorities.find(x => x.priorityId == id);
    return p ? p.priorityName : '';
  }

  closeModal() {
    this.showModal = false;
    this.newTask = this.getEmptyTask();
    this.isEditMode = false;
    this.editIndex = null;
  }
  getProjectName(projectId: number) {
    const project = this.projects.find(x => x.projectMasterId == projectId);
    return project ? project.projectName : '';
  }


  saveTask() {

    const formData = new FormData();

    formData.append("TaskName", this.newTask.name);
    formData.append("ProjectId", this.newTask.projectId || '');
    formData.append("AssignedTo", this.newTask.assigned);
    formData.append("PriorityId", this.newTask.priorityId);
    formData.append("StatusId", this.newTask.statusId);
    formData.append("StartDate", this.newTask.startDate || '');
    formData.append("DueDate", this.newTask.dueDate || '');
    formData.append("Comment", this.newTask.comment || '');
    formData.append("UserId", this.userId.toString());
    formData.append("CompanyId", this.companyId.toString());
    formData.append("RegionId", this.regionId.toString());

    this.selectedFiles.forEach(file => {
      formData.append("Files", file);
    });

    if (this.isEditMode) {

      const updateData = {
        taskId: this.newTask.taskId,
        taskName: this.newTask.name,
        projectId: this.newTask.projectId,
        assignedTo: this.newTask.assigned,
        priorityId: this.newTask.priorityId,
        statusId: this.newTask.statusId,
        startDate: this.newTask.startDate,
        dueDate: this.newTask.dueDate,
        comment: this.newTask.comment,
        userId: this.userId,
        companyId: this.companyId,
        regionId: this.regionId
      };

      this.taskService.updateTask(updateData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Task updated successfully.',
            timer: 2000,
            showConfirmButton: false
          });

          this.loadTasks();
          this.closeModal();
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: 'Task update failed.'
          });
        }
      });

    } else {

      this.taskService.createTask(formData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: 'Task created successfully.',
            timer: 2000,
            showConfirmButton: false
          });

          this.loadTasks();
          this.closeModal();
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: 'Task creation failed.'
          });
        }
      });
    }
  }

  loadTasks() {
    this.taskService.getTasks(this.userId).subscribe((res: any) => {
       this.allTasks = res.data || res;   // backup full list
    this.tasks = [...this.allTasks]; 
    });
  }
  applyFilters() {
  this.tasks = this.allTasks.filter(task => {

    // Employee Filter
    const matchEmployee =
      !this.selectedEmployee ||
      task.assignedTo === this.selectedEmployee;

    // Status Filter
    const matchStatus =
      !this.selectedStatus ||
      task.statusId == this.selectedStatus;

    // Priority Filter
    const matchPriority =
      !this.selectedPriority ||
      task.priorityId == this.selectedPriority;

    // Search Filter
    const search = this.searchText.toLowerCase();
    const matchSearch =
      !search ||
      task.taskName?.toLowerCase().includes(search) ||
      task.assignedTo?.toLowerCase().includes(search) ||
      this.getProjectName(task.projectId)?.toLowerCase().includes(search);

    // Date Filter
    let matchDate = true;

    if (this.fromDate) {
      matchDate =
        matchDate &&
        new Date(task.startDate) >= new Date(this.fromDate);
    }

    if (this.toDate) {
      matchDate =
        matchDate &&
        new Date(task.dueDate) <= new Date(this.toDate);
    }

    return (
      matchEmployee &&
      matchStatus &&
      matchPriority &&
      matchSearch &&
      matchDate
    );
  });
}
resetFilters() {
  this.selectedEmployee = '';
  this.selectedStatus = '';
  this.selectedPriority = '';
  this.fromDate = '';
  this.toDate = '';
  this.searchText = '';

  this.tasks = [...this.allTasks];
}


  deleteTask(task: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {

      if (result.isConfirmed) {

        this.taskService.deleteTask(task.taskId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Task deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });

            this.loadTasks();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Failed!',
              text: 'Task deletion failed.'
            });
          }
        });

      }

    });
  }


  editTask(task: any) {
    this.newTask = {
      ...task,
      name: task.taskName,
      assigned: task.assignedTo
    };
    this.isEditMode = true;
    this.showModal = true;
  }

  // deleteTask(index: number) {
  //   if (confirm('Are you sure you want to delete this task?')) {
  //     this.tasks.splice(index, 1);
  //   }
  // }


  getEmptyTask() {
    return {
      name: '',
      projectId: '',
      assigned: '',
      priorityId: '',

      statusId: '',   // ✅ change this
      dueDate: '',
      comment: ''
    };
  }
}

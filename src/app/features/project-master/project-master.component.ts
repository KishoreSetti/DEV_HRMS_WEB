import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../admin/servies/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-project-master',
  standalone: false,
  templateUrl: './project-master.component.html',
  styleUrl: './project-master.component.css'
})
export class ProjectMasterComponent implements OnInit {
  projects: any[] = [];
  companies: any[] = [];
  regions: any[] = [];

  project: any = this.getEmptyProject();

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  pageSize = 5;
  currentPage = 1;

  userId = Number(sessionStorage.getItem("UserId"));

  constructor(private service: AdminService) { }

  ngOnInit(): void {
    this.loadProjects();
    this.loadCompanies();
    this.loadRegions();
  }

  getEmptyProject() {
    return {
      ProjectMasterId: 0,
      projectName: '',
      companyId: null,
      regionId: null,
      isActive: true,
      userId: this.userId = Number(sessionStorage.getItem("UserId"))
    };
  }

  loadProjects() {
  this.service.getProjects(this.userId).subscribe((res: any) => {
    this.projects = res?.map((p: any) => ({
      ProjectMasterId: p.projectMasterId,
      projectName: p.projectName,
      companyId: p.companyId,
      regionId: p.regionId,
      isActive: p.isActive
    })) || [];
  }, () => {
    this.projects = []; 
  });
}

  loadCompanies(): void {
  this.service.getCompanies(null, this.userId).subscribe({
    next: (res: any) => {
       this.companies = res;
    }
      });
    }
  
    loadRegions(): void {
  this.service.getRegions(null, this.userId).subscribe({
    next: (res: any) => {
      this.regions = res;    
    }
  });
}

  onSubmit() {
     this.userId = Number(sessionStorage.getItem("UserId"));

    if (this.isEditMode) {
      this.service.updateProject(this.project)
        .subscribe(() => {
          Swal.fire('Updated!', 'Project updated', 'success');
          this.loadProjects();
          this.resetForm();
        });
    } else {
      this.service.createProject(this.project)
        .subscribe(() => {
          Swal.fire('Created!', 'Project added', 'success');
          this.loadProjects();
          this.resetForm();
        });
    }
  }

  editProject(p: any) {
    this.project = { ...p };
    this.isEditMode = true;
  }

  deleteProject(p: any) {
  Swal.fire({
    title: `Delete "${p.projectName}"?`,
    text: 'This will deactivate the project.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it'
  }).then((result) => {
    if (result.isConfirmed) {
      this.service.deleteProject(p.ProjectMasterId) 
        .subscribe(() => {
          Swal.fire('Deleted!', 'Project deactivated.', 'success');
          this.loadProjects();
        });
    }
  });
}
  resetForm() {
    this.project = this.getEmptyProject();
    this.isEditMode = false;
  }

  onCancel() {
    this.resetForm();
  }

  filteredProjects() {
    return this.projects.filter(p => {
      return (
        p.projectName.toLowerCase().includes(this.searchText.toLowerCase()) &&
        (this.statusFilter === '' || p.isActive === this.statusFilter)
      );
    });
  }

  get pagedProjects() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProjects().slice(start, start + this.pageSize);
  }

  getCompanyName(id: number) {
    return this.companies.find(x => x.companyId === id)?.companyName || '-';
  }

  getRegionName(id: number) {
    return this.regions.find(x => x.regionID === id)?.regionName || '-';
  }

}

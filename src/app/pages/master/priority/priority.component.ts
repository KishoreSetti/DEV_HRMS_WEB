import { Component, OnInit } from '@angular/core';
import { AdminService, Company, Region } from '../../../admin/servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

export interface Priority {
  priorityId: number;
  priorityName: string;
  description?: string;
  companyId: number;
  regionId: number;
  isActive: boolean;
  userId?: number;
}

@Component({
  selector: 'app-priority',
  standalone: false,
  templateUrl: './priority.component.html',
  styleUrl: './priority.component.css'
})
export class PriorityComponent {

  //    priorityList: Priority[] = [];
  //   priority!: Priority;

  //   isEditMode = false;
  //   searchText = '';
  //   pageSize = 5;
  //   currentPage = 1;

  //   companies: Company[] = [];
  //   regions: Region[] = [];

  //   companyMap: Record<number, string> = {};
  //   regionMap: Record<number, string> = {};

  //   companyId: number = 0;
  //   regionId: number = 0;
  //   userId = Number(sessionStorage.getItem('UserId')) || 0;

  //   constructor(private adminService: AdminService, private spinner: NgxSpinnerService) { }

  //   ngOnInit(): void {
  //     this.priority = this.getEmptyPriority();
  //     this.loadCompanies();
  //     this.loadRegions();
  //     this.loadPriorities();
  //   }


  //   getEmptyPriority(): Priority {
  //     return {
  //       priorityId: 0,
  //       priorityName: '',
  //       description: '',
  //       companyId: this.companyId,
  //       regionId: this.regionId,
  //       isActive: true,
  //       userId: this.userId
  //     };
  //   }
  //   loadCompanies() {
  //     this.adminService.getCompanies(null, this.userId).subscribe({
  //       next: (res: any) => {
  //         this.companies = res.data || res;   // ✅ handle both cases
  //         this.companyMap = {};
  //         this.companies.forEach((c: any) => {
  //           this.companyMap[c.companyId] = c.companyName;
  //         });
  //       },
  //       error: () => {
  //         Swal.fire('Error', 'Failed to load companies', 'error');
  //       }
  //     });
  //   }


  //   loadRegions() {
  //     this.adminService.getRegions(null, this.userId).subscribe({
  //       next: (res: any) => {
  //         this.regions = res.data || res;   // ✅ handle both cases
  //         this.regionMap = {};
  //         this.regions.forEach((r: any) => {
  //           this.regionMap[r.regionID] = r.regionName;
  //         });
  //       },
  //       error: () => {
  //         Swal.fire('Error', 'Failed to load regions', 'error');
  //       }
  //     });
  //   }



  //   loadPriorities() {
  //     this.spinner.show();
  //     this.adminService.getPriorities(this.userId).subscribe({
  //       next: (res: any) => {
  //         this.priorityList = res.data || res;   // ✅ FIXED
  //         this.spinner.hide();
  //       },
  //       error: () => {
  //         this.spinner.hide();
  //         Swal.fire('Error', 'Failed to load priorities', 'error');
  //       }
  //     });
  //   }

  //   onCompanyChange() {


  //   }

  //   onRegionChange() {
  //     this.priority.regionId = this.regionId;
  //   }

  //   onSubmit() {

  //     this.priority.userId = this.userId;

  //     const obs = this.isEditMode
  //       ? this.adminService.updatePriority(this.priority)
  //       : this.adminService.createPriority(this.priority);

  //     obs.subscribe(() => {
  //       Swal.fire('Success', 'Priority saved successfully', 'success');
  //       this.loadPriorities();
  //       this.resetForm();
  //     });
  //   }

  //   editPriority(p: Priority) {
  //     this.priority = { ...p };
  //     this.companyId = p.companyId;
  //     this.regionId = p.regionId;

  //     this.isEditMode = true;
  //   }

  //   deletePriority(p: Priority) {
  //     Swal.fire({
  //       title: 'Delete this priority?',
  //       icon: 'warning',
  //       showCancelButton: true
  //     }).then(result => {
  //       if (result.isConfirmed) {
  //         this.adminService.deletePriority(p.priorityId).subscribe(() => {
  //           this.loadPriorities();
  //         });
  //       }
  //     });
  //   }

  //   resetForm() {
  //     this.priority = this.getEmptyPriority();
  //     this.companyId = this.priority.companyId;
  //     this.regionId = this.priority.regionId;
  //     this.isEditMode = false;
  //   }

  //   filteredPriorities() {
  //     return this.priorityList.filter(p =>
  //       p.priorityName.toLowerCase().includes(this.searchText.toLowerCase())
  //     );
  //   }

  //   get pagedPriorities() {
  //     const start = (this.currentPage - 1) * this.pageSize;
  //     return this.filteredPriorities().slice(start, start + this.pageSize);
  //   }

  //   exportAs(type: 'excel' | 'pdf') {
  //     type === 'excel' ? this.exportExcel() : this.exportPDF();
  //   }

  //   exportExcel() { }
  //   exportPDF() { }
  // }
  priorityList: Priority[] = [];
  priority!: Priority;
  allRegions: Region[] = []; // ✅ add this

  isEditMode = false;
  searchText = '';
  pageSize = 5;
  currentPage = 1;

  companies: Company[] = [];
  regions: Region[] = [];

  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};

  companyId: number = 0;
  regionId: number = 0;
  userId = Number(sessionStorage.getItem('UserId')) || 0;

  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.priority = this.getEmptyPriority();
    this.loadCompanies();
    this.loadRegions();

    this.loadPriorities();
  }


  getEmptyPriority(): Priority {
    return {
      priorityId: 0,
      priorityName: '',
      description: '',
      companyId: this.companyId,
      regionId: this.regionId,
      isActive: true,
      userId: this.userId
    };
  }
  loadCompanies() {
    this.adminService.getCompanies(null, this.userId).subscribe({
      next: (res: any) => {
        console.log('All Companies 👉', res);

        const data = res?.data ?? res ?? [];

        // 🔥 Only active companies
        this.companies = data.filter((c: any) => c.isActive === true);

        // ✅ Build map from active data
        this.companyMap = {};
        this.companies.forEach((c: any) => {
          this.companyMap[c.companyId] = c.companyName;
        });

        console.log('Active Companies 👉', this.companies);
        console.log('Company Map 👉', this.companyMap);
      },
      error: () => {
        Swal.fire('Error', 'Failed to load companies', 'error');
      }
    });
  }

  loadRegions() {
    this.adminService.getRegions(null, this.userId).subscribe({
      next: (res: any) => {

        const data = res?.data ?? res ?? [];

        // ✅ store all regions
        this.allRegions = data.filter((r: any) => r.isActive === true);

        // ✅ build map
        this.regionMap = {};
        this.allRegions.forEach((r: any) => {
          this.regionMap[r.regionID] = r.regionName;
        });

        // ❌ don't assign directly to this.regions here
        this.regions = [];
      },
      error: () => {
        Swal.fire('Error', 'Failed to load regions', 'error');
      }
    });
  }



  loadPriorities() {
    this.spinner.show();
    this.adminService.getPriorities(this.userId).subscribe({
      next: (res: any) => {
        this.priorityList = res.data || res;   // ✅ FIXED
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load priorities', 'error');
      }
    });
  }
  onCompanyChange() {

    // reset selected region
    this.priority.regionId = 0;

    // ✅ filter regions based on company
    this.regions = this.allRegions.filter(
      r => r.companyID == this.priority.companyId
    );

  }


  onRegionChange() {
    this.priority.regionId = this.regionId;
  }

  onSubmit() {

    this.priority.userId = this.userId;

    const obs = this.isEditMode
      ? this.adminService.updatePriority(this.priority)
      : this.adminService.createPriority(this.priority);

    obs.subscribe({
      next: (res: any) => {

        // ❌ HANDLE DUPLICATE / FAILURE
        if (!res.success) {
          Swal.fire(
            'Warning',
            'Record is exist with the same name',
            'warning'
          );
          return;
        }

        // ✅ SUCCESS
        Swal.fire(
          'Success',
          res.message || 'Priority saved successfully',
          'success'
        );

        this.loadPriorities();
        this.resetForm();
      },

      error: () => {
        Swal.fire('Error', 'Operation failed', 'error');
      }
    });
  }

  editPriority(p: Priority) {
    this.priority = { ...p };
    this.companyId = p.companyId;
    this.regionId = p.regionId;
    this.regions = this.allRegions.filter(
      r => r.companyID == this.priority.companyId
    );

    this.isEditMode = true;
  }

  deletePriority(p: Priority) {
    Swal.fire({
      title: 'Delete this priority?',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deletePriority(p.priorityId).subscribe(() => {
          this.loadPriorities();
        });
      }
    });
  }

  resetForm() {
    this.priority = this.getEmptyPriority();
    this.companyId = this.priority.companyId;
    this.regionId = this.priority.regionId;
    this.isEditMode = false;
  }

  filteredPriorities() {
    return this.priorityList.filter(p =>
      p.priorityName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  get pagedPriorities() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPriorities().slice(start, start + this.pageSize);
  }

  exportAs(type: 'excel' | 'pdf') {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel() { }
  exportPDF() { }
}

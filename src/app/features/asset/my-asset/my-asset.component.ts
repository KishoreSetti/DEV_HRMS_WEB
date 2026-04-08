import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { AssetDto, AssetService, AssetStatus } from '../asset.service';
import { HelpdeskService } from '../../helpdesk/service/helpdesk.service';
import { AdminService } from '../../../admin/servies/admin.service';
@Component({
  selector: 'app-my-asset',
  standalone: false,
  templateUrl: './my-asset.component.html',
  styleUrl: './my-asset.component.css'
})
export class MyAssetComponent {
   
 assets: AssetDto[] = [];
  filteredAssets: AssetDto[] = [];
  statuses: AssetStatus[] = [];
  userId!: number;
 requests: any[] = [];
 assetTypes: any[] = [];
assetCategories: any[] = [];
priorities: any[] = [];
filteredRequests: any[] = [];

   companyId!: number;
   regionId!: number;
  
   filter = {
  assetType: '',
  assetStatusId: ''
};


  constructor(private assetService: AssetService,private adminService: AdminService,
  private helpdeskService: HelpdeskService) {}

  ngOnInit(): void {
     const userId = sessionStorage.getItem("UserId");

  if (!userId) {
    console.error("UserId not found in session");
    return;
  }
this.companyId = Number(sessionStorage.getItem('CompanyId'));
  this.regionId = Number(sessionStorage.getItem('RegionId'));
  this.userId = Number(userId);
    this.loadRequests();
    this.loadUserFromSession();
    this.loadStatuses();
    this.loadMyAssets();
    this.loadAssetTypes();        // ✅ ADD
  this.loadAssetCategories();   // ✅ ADD
  this.loadPriorities();        // ✅ ADD
  }
  
  loadAssetTypes() {
  this.adminService
    .getAssetTypesByCompanyRegion(this.companyId, this.regionId)
    .subscribe((res: any) => {
      this.assetTypes = res.data || res;
    });
}

loadAssetCategories() {
  this.adminService
    .getAssetCategoriesByCompanyRegion(this.companyId, this.regionId)
    .subscribe((res: any) => {
      this.assetCategories = res.data || res;
    });
}

loadPriorities() {
  this.helpdeskService
    .getPriorities(this.companyId, this.regionId)
    .subscribe(res => {
      this.priorities = res;
    });
}

    loadRequests() {
    this.assetService.getMyRequests(this.userId)
      .subscribe(res => {
        this.requests = res;
         this.filteredRequests = [...res];
      });
  }
  getAssetTypeName(id?: number): string {
  return this.assetTypes.find(x => x.assetTypeId === id)?.assetTypeName ?? '-';
}

getAssetCategoryName(id?: number): string {
  return this.assetCategories.find(x => x.assetCategoryId === id)?.assetCategoryName ?? '-';
}

getPriorityName(id?: number): string {
  return this.priorities.find(x => x.priorityId === id)?.priorityName ?? '-';
}


  /* =======================
     LOAD USER
  ======================= */
  private loadUserFromSession(): void {
    const userJson = sessionStorage.getItem('currentUser');

    if (!userJson) {
      Swal.fire('Error', 'User not logged in', 'error');
      return;
    }

    const user = JSON.parse(userJson);
    this.userId = user.userId;

    if (!this.userId) {
      Swal.fire('Error', 'Invalid user session', 'error');
    }
  }

  /* =======================
     LOAD ASSETS
  ======================= */
 loadMyAssets(): void {

  this.assetService
    .getAssetsByUserId$(this.userId)
    .subscribe({
      next: (data) => {

        this.assets = data;
        this.filteredAssets = [...data];

      },
      error: (err) => {
        console.error("Error loading assets", err);
      }
    });

}

  /* =======================
     LOAD STATUSES
  ======================= */
  loadStatuses(): void {
    this.assetService.getAssetStatuses$(this.companyId, this.regionId).subscribe({
      next: (res) => this.statuses = res,
      error: () =>
        Swal.fire('Error', 'Failed to load statuses', 'error')
    });
  }

  /* =======================
     FILTER LOGIC
  ======================= */
applyFilters(): void {

  this.filteredRequests = this.requests.filter(r =>

    // 🔹 Asset Type
    (!this.filter.assetType ||
      r.assetType == this.filter.assetType) &&

    // 🔹 Status
    (!this.filter.assetStatusId ||
      this.getStatusId(r.status) === Number(this.filter.assetStatusId)) // ✅ FIX

  );

}

getStatusId(status: string): number {
  const found = this.statuses.find(s => s.assetStatusName === status);
  return found ? found.assetStatusId : 0;
}


 clearFilters(): void {
  this.filter = {
    assetType: '',
    assetStatusId: ''
  };

  this.filteredRequests = [...this.requests];
}


  /* =======================
     HELPERS
  ======================= */
  getStatusName(assetStatusID: number): string {
    const status = this.statuses.find(
      s => s.assetStatusId === assetStatusID
    );
    return status ? status.assetStatusName : '';
  }
}

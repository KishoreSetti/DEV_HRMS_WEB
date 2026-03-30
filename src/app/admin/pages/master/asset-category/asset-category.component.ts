import { Component, OnInit } from '@angular/core';
import { AdminService, Company, Region } from '../../../servies/admin.service';
import Swal from 'sweetalert2';
export interface AssetCategory {
  assetCategoryId: number;
  assetCategoryName: string;
  description?: string;
  companyId: number;
  regionId: number;
  isActive: boolean;
  userId?: number;
}

@Component({
  selector: 'app-asset-category',
  standalone: false,
  templateUrl: './asset-category.component.html',
  styleUrl: './asset-category.component.css'
})
export class AssetCategoryComponent implements OnInit {
  list: AssetCategory[] = [];
  model!: AssetCategory;

  companies: Company[] = [];
  regions: Region[] = [];
  allRegions: Region[] = [];

  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};

  isEditMode = false;
  searchText = '';
  userId = Number(sessionStorage.getItem('UserId')) || 0;

  constructor(private service: AdminService) { }

  ngOnInit() {
    this.reset();
    this.loadCompanies();
    this.loadRegions();
    this.load();
  }

  // ✅ RESET
  reset() {
    this.model = {
      assetCategoryId: 0,
      assetCategoryName: '',
      description: '',
      companyId: 0,
      regionId: 0,
      isActive: true,
      userId: this.userId
    };
    this.isEditMode = false;
  }

  // ✅ COMPANY CHANGE
  onCompanyChange() {
    this.model.regionId = 0;
    this.regions = this.allRegions.filter(
      r => r.companyID == this.model.companyId
    );
  }

  // ✅ LOAD LIST
  load() {
    this.service.getAssetCategories(this.userId).subscribe({
      next: (res: any) => {
        this.list = res.data || res;
      },
      error: () => {
        Swal.fire('Error', 'Failed to load asset categories', 'error');
      }
    });
  }

  // ✅ SAVE / UPDATE
  onSubmit() {
    this.model.userId = this.userId;

    const obs = this.isEditMode
      ? this.service.updateAssetCategory(this.model)
      : this.service.createAssetCategory(this.model);

    obs.subscribe({
      next: (res: any) => {

        // ❌ DUPLICATE
        if (!res.success) {
          Swal.fire(
            'Warning',
            'Record already exists with same name',
            'warning'
          );
          return;
        }

        // ✅ SUCCESS
        Swal.fire(
          'Success',
          res.message || 'Saved successfully',
          'success'
        );

        this.load();
        this.reset();
      },
      error: () => {
        Swal.fire('Error', 'Operation failed', 'error');
      }
    });
  }

  // ✅ EDIT
  edit(x: AssetCategory) {
    this.model = { ...x };
    this.isEditMode = true;

    this.regions = this.allRegions.filter(
      r => r.companyID == x.companyId
    );
  }

  // ✅ DELETE
  delete(x: AssetCategory) {
    Swal.fire({
      title: 'Delete this record?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.deleteAssetCategory(x.assetCategoryId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Record deleted successfully', 'success');
            this.load();
          },
          error: () => {
            Swal.fire('Error', 'Delete failed', 'error');
          }
        });
      }
    });
  }

  // ✅ LOAD COMPANIES
  loadCompanies() {
    this.service.getCompanies(null, this.userId).subscribe({
      next: (res: any) => {
        const data = res.data || res;

        this.companies = data.filter((x: any) => x.isActive);

        this.companyMap = {};
        this.companies.forEach((c: any) => {
          this.companyMap[c.companyId] = c.companyName;
        });
      },
      error: () => {
        Swal.fire('Error', 'Failed to load companies', 'error');
      }
    });
  }

  // ✅ LOAD REGIONS
  loadRegions() {
    this.service.getRegions(null, this.userId).subscribe({
      next: (res: any) => {
        const data = res.data || res;

        this.allRegions = data.filter((x: any) => x.isActive);

        this.regionMap = {};
        this.allRegions.forEach((r: any) => {
          this.regionMap[r.regionID] = r.regionName;
        });

        this.regions = [];
      },
      error: () => {
        Swal.fire('Error', 'Failed to load regions', 'error');
      }
    });
  }

  // ✅ SEARCH FILTER
  filtered() {
    return this.list.filter(x =>
      x.assetCategoryName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}

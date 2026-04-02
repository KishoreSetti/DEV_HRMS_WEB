import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AdminService, Company, Region } from '../../../servies/admin.service';

export interface AssetType {
  assetTypeId: number;
  assetTypeName: string;
  description?: string;
  companyId: number;
  regionId: number;
  isActive: boolean;
  userId?: number;
}

@Component({
  selector: 'app-asset-type',
  standalone: false,
  templateUrl: './asset-type.component.html',
  styleUrl: './asset-type.component.css'
})
export class AssetTypeComponent implements OnInit{
 assetTypeList: AssetType[] = [];
  assetType!: AssetType;

  companies: Company[] = [];
  regions: Region[] = [];
  allRegions: Region[] = [];

  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};

  isEditMode = false;
  searchText = '';
  userId = Number(sessionStorage.getItem('UserId')) || 0;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.assetType = this.getEmpty();
    this.loadCompanies();
    this.loadRegions();
    this.loadData();
  }

  getEmpty(): AssetType {
    return {
      assetTypeId: 0,
      assetTypeName: '',
      description: '',
      companyId: 0,
      regionId: 0,
      isActive: true,
      userId: this.userId
    };
  }

  loadCompanies() {
    this.adminService.getCompanies(null, this.userId).subscribe((res: any) => {
      const data = res.data || res;
      this.companies = data.filter((x: any) => x.isActive);

      this.companies.forEach(c => {
        this.companyMap[c.companyId] = c.companyName;
      });
    });
  }

  loadRegions() {
    this.adminService.getRegions(null, this.userId).subscribe((res: any) => {
      const data = res.data || res;

      this.allRegions = data.filter((x: any) => x.isActive);

      this.allRegions.forEach(r => {
        this.regionMap[r.regionID] = r.regionName;
      });

      this.regions = [];
    });
  }

  onCompanyChange() {
    this.assetType.regionId = 0;
    this.regions = this.allRegions.filter(r => r.companyID == this.assetType.companyId);
  }

  loadData() {
    this.adminService.getAssetTypes(this.userId).subscribe((res: any) => {
      this.assetTypeList = res.data || res;
    });
  }

  onSubmit() {
    this.assetType.userId = this.userId;

    const obs = this.isEditMode
      ? this.adminService.updateAssetType(this.assetType)
      : this.adminService.createAssetType(this.assetType);

    obs.subscribe({
      next: (res: any) => {

        if (!res.success) {
          Swal.fire('Warning', 'Duplicate Asset Type exists', 'warning');
          return;
        }

        Swal.fire('Success', res.message, 'success');
        this.loadData();
        this.resetForm();
      }
    });
  }

  edit(x: AssetType) {
    this.assetType = { ...x };
    this.regions = this.allRegions.filter(r => r.companyID == x.companyId);
    this.isEditMode = true;
  }

  delete(x: AssetType) {
    Swal.fire({
      title: 'Delete this record?',
      showCancelButton: true
    }).then(res => {
      if (res.isConfirmed) {
        this.adminService.deleteAssetType(x.assetTypeId).subscribe(() => {
          this.loadData();
        });
      }
    });
  }

  resetForm() {
    this.assetType = this.getEmpty();
    this.isEditMode = false;
  }

  filtered() {
    return this.assetTypeList.filter(x =>
      x.assetTypeName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}

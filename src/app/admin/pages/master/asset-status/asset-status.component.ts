import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService, Company, Region } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AssetStatus } from '../../../servies/admin.service';
@Component({
  selector: 'app-asset-status',
  standalone: false,
  templateUrl: './asset-status.component.html',
  styleUrl: './asset-status.component.css'
})
export class AssetStatusComponent {

 list: AssetStatus[] = [];
  model!: AssetStatus;

  companies: Company[] = [];
  regions: Region[] = [];
  allRegions: Region[] = [];

  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};

  isEditMode = false;
  searchText = '';
  userId = Number(sessionStorage.getItem('UserId')) || 0;

  constructor(private service: AdminService) {}

  ngOnInit() {
    this.reset();
    this.loadCompanies();
    this.loadRegions();
    this.load();
  }

  reset() {
    this.model = {
      assetStatusId: 0,
      assetStatusName: '',
      description: '',
      companyId: 0,
      regionId: 0,
      isActive: true,
      userId: this.userId
    };
    this.isEditMode = false;
  }

  load() {
    this.service.getAssetStatus(this.userId).subscribe((res: any) => {
      this.list = res.data || res;
    });
  }

  onCompanyChange() {
    this.model.regionId = 0;
    this.regions = this.allRegions.filter(r => r.companyID == this.model.companyId);
  }

  onSubmit() {
    this.model.userId = this.userId;

    const obs = this.isEditMode
      ? this.service.updateAssetStatus(this.model)
      : this.service.createAssetStatus(this.model);

    obs.subscribe((res: any) => {

      if (!res.success) {
        Swal.fire('Warning', 'Duplicate Asset Status exists', 'warning');
        return;
      }

      Swal.fire('Success', res.message, 'success');
      this.load();
      this.reset();
    });
  }

  edit(x: AssetStatus) {
    this.model = { ...x };
    this.regions = this.allRegions.filter(r => r.companyID == x.companyId);
    this.isEditMode = true;
  }

  delete(x: AssetStatus) {
    Swal.fire({
      title: 'Delete this record?',
      icon: 'warning',
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        this.service.deleteAssetStatus(x.assetStatusId).subscribe(() => {
          this.load();
        });
      }
    });
  }

  loadCompanies() {
    this.service.getCompanies(null, this.userId).subscribe((res: any) => {
      const data = res.data || res;
      this.companies = data.filter((x: any) => x.isActive);

      this.companyMap = {};
      this.companies.forEach((c: any) => {
        this.companyMap[c.companyId] = c.companyName;
      });
    });
  }

  loadRegions() {
    this.service.getRegions(null, this.userId).subscribe((res: any) => {
      const data = res.data || res;

      this.allRegions = data.filter((x: any) => x.isActive);

      this.regionMap = {};
      this.allRegions.forEach((r: any) => {
        this.regionMap[r.regionID] = r.regionName;
      });

      this.regions = [];
    });
  }

  filtered() {
    return this.list.filter(x =>
      x.assetStatusName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}

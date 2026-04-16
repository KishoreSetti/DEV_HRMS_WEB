import { Component } from '@angular/core';
import { AssetService } from '../asset.service';
import { AdminService } from '../../../admin/servies/admin.service';

@Component({
  selector: 'app-assign-asset-screen',
  standalone: false,
  templateUrl: './assign-asset-screen.component.html',
  styleUrl: './assign-asset-screen.component.css'
})
export class AssignAssetScreenComponent {
  companyId!: number;
  regionId!: number;

  requests: any[] = [];
  assetTypes: any[] = [];

 availableAssets: any[] = [];


  form: any = {
    requestId: '',
    employeeName: '',
    assetType: '',
    assetId: '',
    assetCode: '',
    assignDate: '',
    returnDate: '',
    remarks: ''
  };

  assignedList: any[] = [];

  constructor(
    private assetService: AssetService,
    private adminService: AdminService
  ) {}
userId!: number;
  ngOnInit(): void {
    this.companyId = Number(sessionStorage.getItem('CompanyId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));
    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    this.userId = Number(sessionStorage.getItem('UserId'));

    this.loadApprovedRequests();
    this.loadAssetTypes();
    this.loadAvailableAssets(); // 🔥 ADD THIS
    this.loadAssignments();
this.form.get('assetCategory')?.valueChanges.subscribe(() => {
  this.loadAssetTypes();   // ✅ reuse same method
});

  }
  loadAssignments() {
  this.assetService
    .getAssignments$(this.companyId, this.regionId)
    .subscribe(res => {
      this.assignedList = res;
    });
}

  loadAvailableAssets() {
  this.assetService
    .getAvailableAssets$(this.companyId, this.regionId,this.userId) // ✅ pass userId
    .subscribe(res => {
      this.availableAssets = res;
    });
}


  // ============================================================
  // 🔹 LOAD APPROVED REQUESTS
  // ============================================================
  loadApprovedRequests() {
    this.assetService
      .getApprovedRequests(this.companyId, this.regionId)
      .subscribe(res => {
        this.requests = res;
      });
  }

  // ============================================================
  // 🔹 LOAD ASSET TYPES (FOR NAME)
  // ============================================================
  // loadAssetTypes() {
  //   this.adminService
  //     .getAssetTypesByCompanyRegion(this.companyId, this.regionId )
  //     .subscribe((res: any) => {
  //       this.assetTypes = res.data || res;
  //     });
  // }

//   loadAssetTypes() {

//   const categoryId = this.form.get('assetCategory')?.value;

//   if (!categoryId) {
//     this.assetTypes = [];
//     return;
//   }

//   this.adminService.getAssetTypesByCompanyRegion(
//     this.companyId,
//     this.regionId,
//     categoryId   // ✅ ADD
//   ).subscribe((res: any) => {

//     this.assetTypes = res.data || res;

//   });
// }
loadAssetTypes() {
  this.adminService.getAssetTypesByCompanyRegion(
    this.companyId,
    this.regionId,
    0   // ✅ get all types
  ).subscribe((res: any) => {
    this.assetTypes = res.data || res;
  });
}
getAssetTypeName(id?: number): string {
  if (!id || this.assetTypes.length === 0) return '-'; // ✅ ADD
  return this.assetTypes.find(x => x.assetTypeId === id)?.assetTypeName ?? '-';
}

  // ============================================================
  // 🔹 ON REQUEST CHANGE
  // ============================================================
 onRequestChange() {
  const selected = this.requests.find(
    r => r.requestID == this.form.requestId
  );

  if (selected) {
    this.form.employeeName = selected.employeeName;

    // ✅ Safe mapping
    this.form.assetType = this.getAssetTypeName(selected.assetType);
  }
}

  // ============================================================
  // 🔹 ON ASSET CHANGE
  // ============================================================
 onAssetChange() {
  const selected = this.availableAssets.find(
    a => a.assetID == this.form.assetId
  );

  if (selected) {
    this.form.assetCode = selected.assetCode;
  }
}


  // ============================================================
  // 🔹 ASSIGN
  // ============================================================
assignAsset() {

  if (!this.form.requestId || !this.form.assetId) {
    alert('Fill required fields');
    return;
  }

  const payload = {
    companyId: this.companyId,
    regionId: this.regionId,
    requestId: this.form.requestId,
    assetId: this.form.assetId,
    employeeName: this.form.employeeName,
    assetType: this.form.assetType,
    assetName: this.availableAssets.find(a => a.assetID == this.form.assetId)?.assetName,
    assetCode: this.form.assetCode,
    assignDate: this.form.assignDate,
    returnDate: this.form.returnDate,
    remarks: this.form.remarks
  };

  this.assetService.assignAsset$(payload).subscribe(() => {

    alert('Saved Successfully ✅');

    // 🔥 Refresh everything
    this.loadAssignments();
    this.loadApprovedRequests(); // 🔥 removes used RequestID
    this.loadAvailableAssets();

    this.resetForm();
  });
}


  resetForm() {
    this.form = {};
  }
}

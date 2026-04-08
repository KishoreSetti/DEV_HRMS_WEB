import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { AssetService, AssetStatus } from '../asset.service';
import { AdminService } from '../../../admin/servies/admin.service';
@Component({
  selector: 'app-asset-approval',
  standalone: false,
  templateUrl: './asset-approval.component.html',
  styleUrl: './asset-approval.component.css'
})
export class AssetApprovalComponent {
filtersForm!: FormGroup;
companyId!: number;
  regionId!: number;
  assets: any[] = [];
  statuses: AssetStatus[] = [];
   assetStatuses: AssetStatus[] = [];
  currencies: string[] = [];
  
  managerId!: number;
  assetTypes: any[] = [];
  // UI flags
  noRecordsFound = false;

  // 🔹 Sorting
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // 🔹 Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private service: AdminService
  ) {}

  // ============================================================
  // 🔹 INIT
  // ============================================================
  ngOnInit(): void {

  const currentUser = sessionStorage.getItem('currentUser');

  if (!currentUser) {
    Swal.fire('Error', 'Session expired', 'error');
    return;
  }

  const user = JSON.parse(currentUser);
this.companyId = Number(sessionStorage.getItem('CompanyId'));
  this.regionId = Number(sessionStorage.getItem('RegionId'));
  // 🔹 Correct managerId
  this.managerId = Number(user.userId);
 
  this.buildForm();
  this.loadStatuses();
   this.loadAssetTypes();
  this.loadAssetsForApproval();
}
 loadAssetTypes() {
    this.service.getAssetTypesByCompanyRegion(
      this.companyId,
      this.regionId
    ).subscribe((res: any) => {
      this.assetTypes = res.data || res;
    });
  }
  


  // ============================================================
  // 🔹 BUILD FILTER FORM
  // ============================================================
  buildForm(): void {
    this.filtersForm = this.fb.group({
    assetType: [''],
    assetStatusId: [''],
    employeeName: [''],   // ✅ NEW
    fromDate: [''],       // ✅ NEW
    toDate: ['']          // ✅ NEW
  });
  }

  // ============================================================
  // 🔹 LOAD ASSETS
  // ============================================================
loadAssetsForApproval(): void {

  this.assetService
    .getPendingApprovals$(this.managerId)
    .subscribe(res => {

      this.assets = res.map((r: any) => ({
        ...r,
        checked: false,
        visible: true,

        // ✅ normalize fields for filter
        employeeNameNorm: r.employeeName?.toLowerCase() || '',
        assetTypeNameNorm: r.assetTypeName?.toLowerCase() || '',
        
  assetTypeId: r.assetType,
  requiredDateObj: new Date(r.requiredDate)
      }));

      this.noRecordsFound = false;
      this.currentPage = 1;
    });
}


  // ============================================================
  // 🔹 LOAD STATUSES
  // ============================================================
  loadStatuses(): void {
    this.assetService.getAssetStatuses$(this.companyId, this.regionId).subscribe(res => {
      this.assetStatuses = res;
    });
  }

  // ============================================================
  // 🔹 APPLY FILTERS (AND logic)
  // ============================================================
 applyFilters(): void {
  const f = this.filtersForm.value;

  const empName = f.employeeName?.trim().toLowerCase();
  const assetType = f.assetType ? Number(f.assetType) : null;
  const statusId = f.assetStatusId ? Number(f.assetStatusId) : null;

  const fromDate = f.fromDate ? new Date(f.fromDate) : null;
  const toDate = f.toDate ? new Date(f.toDate) : null;

  let visibleCount = 0;

  this.assets.forEach(a => {

    const matchesEmployee =
      !empName || a.employeeNameNorm.includes(empName);

    const matchesAssetType =
      !assetType || a.assetTypeId === assetType;

    const matchesStatus =
      !statusId || a.assetStatusID === statusId;

    const matchesFromDate =
      !fromDate || a.requiredDateObj >= fromDate;

    const matchesToDate =
      !toDate || a.requiredDateObj <= toDate;

    a.visible =
      matchesEmployee &&
      matchesAssetType &&
      matchesStatus &&
      matchesFromDate &&
      matchesToDate;

    if (a.visible) visibleCount++;
  });

  this.noRecordsFound = visibleCount === 0;
  this.currentPage = 1;
}


  // ============================================================
  // 🔹 SORT
  // ============================================================
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  // ============================================================
  // 🔹 FILTERED + SORTED + PAGINATED DATA
  // ============================================================
  get pagedAssets(): any[] {
    let data = this.assets.filter(a => a.visible);

    if (this.sortColumn) {
      data = data.sort((a, b) => {
        const valA = a[this.sortColumn!];
        const valB = b[this.sortColumn!];

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  }

  // ============================================================
  // 🔹 PAGINATION HELPERS
  // ============================================================
  get totalPages(): number {
    return Math.ceil(
      this.assets.filter(a => a.visible).length / this.pageSize
    );
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  // ============================================================
  // 🔹 SELECT ALL
  // ============================================================
  toggleAll(event: any): void {
    const checked = event.target.checked;
    this.assets.forEach(a => {
      if (a.visible && a.approvalStatus === 'Pending') {
        a.checked = checked;
      }
    });
  }

  // ============================================================
  // 🔹 APPROVE / REJECT (ONE API)
  // ============================================================
approveRejectAssets(action: 'Approved' | 'Rejected'): void {

  const selectedAssets = this.assets
    .filter(a => a.checked && a.approvalStatus === 'Pending')
    .map(a => a.assetID);

  if (!selectedAssets.length) {
    Swal.fire('Warning', 'Select at least one asset', 'warning');
    return;
  }

  const payload = {
    assetIds: selectedAssets,
    managerId: this.managerId,
    action: action
  };

  Swal.fire({
    title: `Confirm ${action}`,
    icon: 'question',
    showCancelButton: true
  }).then(result => {

    if (result.isConfirmed) {

      this.assetService
        .approveRejectAssets(payload)
        .subscribe(() => {

          this.assets.forEach(a => {
            if (selectedAssets.includes(a.assetID)) {
              a.approvalStatus = action;
              a.checked = false;
            }
          });

          Swal.fire(
            'Success',
            `Assets ${action} successfully`,
            'success'
          );

        });

    }

  });
}



  // ============================================================
  // 🔹 TEMPLATE HELPER
  // ============================================================
  get noVisibleAssets(): boolean {
    return this.assets.length > 0 && this.assets.every(a => !a.visible);
  }
}

import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, shareReplay } from 'rxjs';
import { AssetDto, AssetStatus, AssetService, EmployeeDto } from '../asset.service';
import Swal from 'sweetalert2';
import { AdminService } from '../../../admin/servies/admin.service';
@Component({
  selector: 'app-add-assets',
  standalone: false,
  templateUrl: './add-assets.component.html',
  styleUrl: './add-assets.component.css'
})
export class AddAssetsComponent {
  assetForm!: FormGroup;
  assets: AssetDto[] = [];
  employees: EmployeeDto[] = [];
  assetStatuses: AssetStatus[] = [];
  assetTypes: any[] = [];

  currencies: any[] = [];
  assetCategories: any[] = [];
  isEditMode = false;

  companyId!: number;
  regionId!: number;
  private userId!: number;
  loggedInUserName: string = '';
  // ================= SORTING =================
  sortColumn: keyof AssetDto | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // ================= PAGINATION =================
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50, 100];

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private service: AdminService
  ) { }

  ngOnInit(): void {
    this.loadSessionData();
    this.initForm();
    this.loadAssetTypes();
    this.loadCurrency();
    this.loadAssetCategories();
    this.assetForm.patchValue({
      userID: this.userId
    });

    this.loadEmployeesAndStatuses(); // load employees & statuses first
  }
  loadCurrency() {
    this.service.getCurrenciesByCompanyRegion(
      this.companyId,
      this.regionId

    ).subscribe((res: any) => {
      this.currencies = res.data || res;
    });
  }

  loadAssetTypes() {
    this.service.getAssetTypesByCompanyRegion(
      this.companyId,
      this.regionId
    ).subscribe((res: any) => {
      this.assetTypes = res.data || res;
    });
  }
  loadAssetCategories() {
    this.service.getAssetCategoriesByCompanyRegion(
      this.companyId,
      this.regionId
    ).subscribe((res: any) => {
      this.assetCategories = res.data || res;
    });
  }

  // ================= LOAD EMPLOYEES & STATUSES =================
  private loadEmployeesAndStatuses(): void {
    // Load employees
    this.assetService.getAllEmployees$().subscribe(empRes => {
      this.employees = empRes;

      // Load statuses after employees
      this.assetService.getAssetStatuses$(this.companyId, this.regionId).subscribe(statusRes => {
        this.assetStatuses = statusRes;

        // Finally load assets
        this.loadAssets();
      });
    });
  }

  // ================= SESSION =================
  // private loadSessionData(): void {
  //   this.companyId = Number(sessionStorage.getItem('CompanyId'));
  //   this.regionId = Number(sessionStorage.getItem('RegionId'));
  //   const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  //   this.userId = user.userId;
  // }
  private loadSessionData(): void {

    this.companyId = Number(sessionStorage.getItem('CompanyId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));

    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

    this.userId = user.userId;
    this.loggedInUserName = user.fullName;

  }

  // ================= FORM =================
  private initForm(): void {
    this.assetForm = this.fb.group(
      {
        assetID: [null],
        userID: [this.userId],
        employeeName: [this.loggedInUserName],
        assetName: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/^[a-zA-Z0-9\-\/\s]+$/)]],
        assetCode: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9]+$/)]],
        assetType: [null, Validators.required],
        assetCategory: [null],
        assetLocation: ['', [Validators.required, Validators.maxLength(100)]],
        assetCost: [0, [Validators.required, Validators.min(1)]],
        currencyCode: ['INR', Validators.required],
        assetDescription: ['', Validators.maxLength(500)],
        assetModel: ['', Validators.maxLength(100)],
        purchaseOrder: ['', Validators.maxLength(100)],
        warrantyStartDate: [null],
        warrantyEndDate: [null],
        assetReturnDate: [null],
        reportingTo: [null],
        assetStatusID: [null, Validators.required]
      },
      {
        validators: [this.warrantyDateValidator, this.returnDateValidator]
      }
    );
  }

  // ================= CUSTOM VALIDATORS =================
  private warrantyDateValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('warrantyStartDate')?.value;
    const end = group.get('warrantyEndDate')?.value;
    if (start && end && new Date(start) > new Date(end)) return { warrantyDateInvalid: true };
    return null;
  }

  private returnDateValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('warrantyStartDate')?.value;
    const returnDate = group.get('assetReturnDate')?.value;
    if (start && returnDate && new Date(returnDate) < new Date(start)) return { returnDateInvalid: true };
    return null;
  }

  // ================= LOAD ASSETS =================
  // private loadAssets(): void {
  //   this.assetService.getAllAssets$().subscribe(res => {
  //     // Map employee names and asset status names
  //     this.assets = res.map(a => ({
  //       ...a,
  //       employeeName: this.employees.find(e => e.userId === a.userID)?.fullName ?? '',
  //       assetStatusName: this.assetStatuses.find(s => s.assetStatusId === a.assetStatusID)?.assetStatusName ?? ''
  //     }));
  //     this.currentPage = 1;
  //   });
  // }
  private loadAssets(): void {

    const loggedUserId = Number(sessionStorage.getItem('UserId'));

    this.assetService.getAllAssets$().subscribe(res => {

      const userAssets = res.filter(a => a.userID === loggedUserId);

      this.assets = userAssets.map(a => ({
        ...a,
        employeeName: this.employees.find(e => e.userId === a.userID)?.fullName ?? '',
        assetStatusName: this.assetStatuses.find(s => s.assetStatusId === a.assetStatusID)?.assetStatusName ?? ''
      }));

      this.currentPage = 1;

    });

  }

  // ================= GET STATUS NAME (OPTIONAL) =================
  getStatusName(id: number): string {
    return this.assetStatuses.find(s => s.assetStatusId === id)?.assetStatusName ?? '-';
  }

  // ================= SUBMIT =================
  submit(): void {
    if (this.assetForm.invalid) {
      this.assetForm.markAllAsTouched();
      return;
    }

    const v = this.assetForm.value;
    const payload: AssetDto = {
      assetID: this.isEditMode ? v.assetID : undefined,
      companyID: this.companyId,
      regionID: this.regionId,
      userID: this.userId,
      employeeName: this.loggedInUserName,
      assetName: v.assetName,
      assetCode: v.assetCode,
      assetType: v.assetType,          // ✅ ADD THIS
      assetCategory: v.assetCategory,  // ✅ ADD THIS
      assetLocation: v.assetLocation,
      assetCost: v.assetCost,
      currencyCode: v.currencyCode,
      assetDescription: v.assetDescription,
      assetModel: v.assetModel,
      reportingTo: Number(sessionStorage.getItem("reportingManagerId")),
      purchaseOrder: v.purchaseOrder,
      assetStatusID: v.assetStatusID,
      warrantyStartDate: v.warrantyStartDate ? new Date(v.warrantyStartDate).toISOString() : undefined,
      warrantyEndDate: v.warrantyEndDate ? new Date(v.warrantyEndDate).toISOString() : undefined,
      assetReturnDate: v.assetReturnDate ? new Date(v.assetReturnDate).toISOString() : undefined
    };

    if (this.isEditMode) {
      this.assetService.updateAsset$(payload).subscribe(() => {
        Swal.fire('Updated', 'Asset updated successfully', 'success');
        this.afterSave();
      });
    } else {
      this.assetService.createAsset$(payload).subscribe(() => {
        Swal.fire('Created', 'Asset created successfully', 'success');
        this.afterSave();
      });
    }
  }

  private afterSave(): void {
    this.resetForm();
    this.loadAssets();
  }
getAssetTypeName(id?: number): string {
  return this.assetTypes.find(x => x.assetTypeId === id)?.assetTypeName ?? '-';
}

getAssetCategoryName(id?: number): string {
  return this.assetCategories.find(x => x.assetCategoryId === id)?.assetCategoryName ?? '-';
}



  // ================= EDIT / DELETE =================
  edit(asset: AssetDto): void {
    this.isEditMode = true;
    this.assetForm.patchValue({
      ...asset,
      assetType: asset.assetType,          // ✅ ADD
      assetCategory: asset.assetCategory,  // ✅ ADD
      userID: this.employees.find(e => e.fullName === asset.employeeName)?.userId,
      warrantyStartDate: asset.warrantyStartDate?.split('T')[0] ?? null,
      warrantyEndDate: asset.warrantyEndDate?.split('T')[0] ?? null,
      assetReturnDate: asset.assetReturnDate?.split('T')[0] ?? null
    });
  }

  delete(assetId: number): void {
    Swal.fire({
      title: 'Are you sure you want to delete this asset record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then(result => {
      if (result.isConfirmed) {
        this.assetService.deleteAsset$(assetId).subscribe(() => {
          Swal.fire('Deleted', 'Asset deleted successfully', 'success');
          this.loadAssets();
        });
      }
    });
  }

  resetForm(): void {
    this.isEditMode = false;
    this.assetForm.reset({
      assetID: null,
      assetCost: 0,
      currencyCode: 'INR',
      assetStatusID: null
    });
  }

  // ================= TEMPLATE HELPERS =================
  get f() { return this.assetForm.controls; }

  sortBy(column: keyof AssetDto): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortedAssets(): AssetDto[] {
    let data = [...this.assets];
    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        const valA = a[this.sortColumn!] ?? '';
        const valB = b[this.sortColumn!] ?? '';
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }

  filteredAssets(): AssetDto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.getSortedAssets().slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.assets.length / this.pageSize);
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }
}

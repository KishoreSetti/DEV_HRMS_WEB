import { Component, OnInit } from '@angular/core';
import { AdminService, Company, LateLoginPolicy, Region } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-late-login-policy',
  standalone: false,
  templateUrl: './late-login-policy.component.html',
  styleUrl: './late-login-policy.component.css'
})
export class LateLoginPolicyComponent {


  policies: LateLoginPolicy[] = [];
  policy: LateLoginPolicy = this.getEmpty();

  companies: Company[] = [];
  regions: Region[] = [];
  filteredRegions: Region[] = [];

  isEditMode = false;
userId = Number(sessionStorage.getItem('UserId') || 0);

  constructor(
    private service: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadRegions();
    this.loadPolicies();
  }

  // ✅ EMPTY MODEL
  getEmpty(): LateLoginPolicy {
    return {
      policyId: 0,
      companyId: 0,
      regionId: 0,
      userId: this.userId,
      lateLoginCount: 0,
      lopdays: 0,
      loptype: '',
      isActive: true
    };
  }

  // ===============================
  // ✅ LOAD COMPANIES 
  // ===============================
  loadCompanies(): void {
    this.service.getCompanies(null, this.userId).subscribe({
      next: (res: any[]) => {
        this.companies = (res || []).filter(c => c.isActive);
      },
      error: () => Swal.fire('Error', 'Failed to load companies', 'error')
    });
  }
  getCompanyName(companyId: number): string {
  const company = this.companies.find(c => c.companyId == companyId);
  return company ? company.companyName : 'N/A';
}

  // ===============================
  // ✅ LOAD REGIONS
  // ===============================
  loadRegions(): void {
    this.service.getRegions(null, this.userId).subscribe({
      next: (res: any[]) => {
        this.regions = (res || []).filter(r => r.isActive);
      },
      error: () => Swal.fire('Error', 'Failed to load regions', 'error')
    });
  }

  getRegionName(regionId: number): string {
  const region = this.regions.find(r => r.regionID == regionId);
  return region ? region.regionName : 'N/A';
}

  // ===============================
  // ✅ COMPANY CHANGE → FILTER REGION
  // ===============================
  onCompanyChange(): void {

    this.filteredRegions = this.regions.filter(r =>
      Number(r.companyID) === Number(this.policy.companyId)
    );

    this.policy.regionId = 0; // reset region
  }

  // ===============================
  // ✅ LOAD POLICIES
  // ===============================
  loadPolicies(): void {
    this.spinner.show();

    this.service.getLateLoginPolicies(this.userId).subscribe({
      next: (res: any) => {
        console.log('Late Login Policies List', res);
        this.policies = res || [];
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load policies', 'error');
      }
    });
  }

  // ===============================
  // ✅ SAVE / UPDATE
  // ===============================
  onSubmit(): void {

    this.policy.userId = this.userId;

  console.log("Submitting Policy:", this.policy); // 👈 ADD THIS

  if (!this.policy.companyId || !this.policy.regionId) {
    Swal.fire('Validation', 'Company & Region are required', 'warning');
    return;
  }
    this.spinner.show();

    const req = this.isEditMode
      ? this.service.updateLateLoginPolicy(this.policy.policyId, this.policy)
      : this.service.createLateLoginPolicy(this.policy);

    req.subscribe({
      next: () => {
        Swal.fire('Success',
          this.isEditMode ? 'Updated Successfully' : 'Saved Successfully',
          'success'
        );

        this.loadPolicies();
        this.resetForm();
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Operation failed', 'error');
      }
    });
  }

  // ===============================
  // ✅ EDIT (IMPORTANT FIX)
  // ===============================
  edit(p: LateLoginPolicy): void {

    this.policy = {
      ...p,
      companyId: Number(p.companyId),
      regionId: Number(p.regionId)
    };

    this.isEditMode = true;

    // 🔥 preload regions for selected company
    this.filteredRegions = this.regions.filter(r =>
      Number(r.companyID) === Number(this.policy.companyId)
    );
  }

  // ===============================
  // ✅ DELETE
  // ===============================
  delete(p: LateLoginPolicy): void {

    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this policy?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33'
    }).then(res => {

      if (res.isConfirmed) {
        this.spinner.show();

        this.service.deleteLateLoginPolicy(p.policyId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Policy deleted', 'success');
            this.loadPolicies();
            this.spinner.hide();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed', 'error');
          }
        });
      }

    });
  }

  // ===============================
  // ✅ RESET
  // ===============================
  resetForm(): void {
    this.policy = this.getEmpty();
    this.filteredRegions = [];
    this.isEditMode = false;
  }

  onCancel(): void {
    this.resetForm();
  }
}

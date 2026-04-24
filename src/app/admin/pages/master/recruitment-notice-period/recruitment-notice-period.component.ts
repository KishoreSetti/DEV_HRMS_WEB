import { Component } from '@angular/core';
import { AdminService, Company, Region } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

export interface RecruitmentNoticePeriod {
  RecruitmentNoticePeriodID: number;
  CompanyID: number;
  RegionID: number;
  NoticePeriod: string;
  IsActive: boolean;
  UserId?: number;
}

@Component({
  selector: 'app-recruitment-notice-period',
  standalone: false,
  templateUrl: './recruitment-notice-period.component.html',
  styleUrl: './recruitment-notice-period.component.css'
})
export class RecruitmentNoticePeriodComponent {
  searchText = '';
  noticePeriodList: RecruitmentNoticePeriod[] = [];
  noticePeriod!: RecruitmentNoticePeriod;

  companies: Company[] = [];
  regions: Region[] = [];

  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};

  userId!: number;
  companyId!: number;
  regionId!: number;

  isEditMode = false;

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {

    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }

    this.noticePeriod = {
      RecruitmentNoticePeriodID: 0,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      NoticePeriod: '',
      IsActive: true
    };

    this.loadCompanies();
    this.loadNoticePeriods();
  }

  // ================= LOAD DATA =================

  loadNoticePeriods() {

    this.spinner.show();

    this.adminService.getRecruitmentNoticePeriodList(this.userId).subscribe({
      next: (res: any) => {

        const data = res.data || [];

        this.noticePeriodList = data.map((n: any) => ({
          RecruitmentNoticePeriodID: n.recruitmentNoticePeriodID,
          CompanyID: n.companyID,
          RegionID: n.regionID,
          NoticePeriod: n.noticePeriod,
          IsActive: n.isActive
        }));

        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load data', 'error');
      }
    });
  }

  // ================= SUBMIT =================

  onSubmit() {

    this.noticePeriod.CompanyID = this.companyId;
    this.noticePeriod.RegionID = this.regionId;
    this.noticePeriod.UserId = this.userId;

    this.spinner.show();

    const obs = this.isEditMode
      ? this.adminService.updateRecruitmentNoticePeriod(this.noticePeriod)
      : this.adminService.createRecruitmentNoticePeriod(this.noticePeriod);

    obs.subscribe({
      next: (res: any) => {

        this.spinner.hide();

        // ✅ HANDLE DUPLICATE / FAILURE
        if (!res.success) {
          Swal.fire('Warning', 'Record is exist with the same name', 'warning');
          return;
        }

        // ✅ SUCCESS MESSAGE
        Swal.fire(
          this.isEditMode ? 'Updated!' : 'Added!',
          res.message,
          'success'
        );

        this.loadNoticePeriods();
        this.clearForm();
      },

      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Operation failed.', 'error');
      }
    });

  }

  // ================= EDIT =================

  editNoticePeriod(item: RecruitmentNoticePeriod) {

    this.noticePeriod = { ...item };

    this.companyId = item.CompanyID;
    this.regionId = item.RegionID;

    this.loadRegions();

    this.isEditMode = true;
  }

  // ================= DELETE =================

  deleteNoticePeriod(item: RecruitmentNoticePeriod) {

    Swal.fire({
      title: 'Delete this Notice Period?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete'
    }).then(result => {

      if (result.isConfirmed) {

        this.spinner.show();

        this.adminService.deleteRecruitmentNoticePeriod(item.RecruitmentNoticePeriodID)
          .subscribe({
            next: () => {
              this.spinner.hide();
              Swal.fire('Deleted!', 'Notice Period deleted successfully.', 'success');
              this.loadNoticePeriods();
            },
            error: () => {
              this.spinner.hide();
              Swal.fire('Error', 'Delete failed.', 'error');
            }
          });
      }
    });
  }

  // ================= FILTER =================

  filteredNoticePeriods(): RecruitmentNoticePeriod[] {

    const search = this.searchText?.toLowerCase() || '';

    return this.noticePeriodList.filter(n =>
      n.NoticePeriod?.toLowerCase().includes(search)
    );
  }

  // ================= LOAD COMPANIES =================
  loadCompanies(): void {

    this.adminService.getCompanies(null, this.userId).subscribe({
      next: (res: any) => {

        console.log('All Companies 👉', res);

        const data = res?.data ?? res ?? [];

        // 🔥 Only active companies
        this.companies = data.filter((c: any) => c.isActive === true);

        // ✅ Build company map
        this.companyMap = {};
        this.companies.forEach((c: any) => {
          this.companyMap[c.companyId] = c.companyName;
        });

        console.log('Active Companies 👉', this.companies);

        // ✅ Load regions if company already selected
        if (this.companyId) {
          this.loadRegions();
        }
      },
      error: () => Swal.fire('Error', 'Failed to load companies', 'error')
    });
  }

  // ================= LOAD REGIONS =================

  loadRegions(): void {

    this.adminService.getRegions(null, this.userId).subscribe({
      next: (res: any) => {

        console.log('All Regions 👉', res);

        const data = res?.data ?? res ?? [];

        // 🔥 Only active regions
        const activeRegions = data.filter((r: any) => r.isActive === true);

        // ✅ Build full region map (for display)
        this.regionMap = {};
        activeRegions.forEach((r: any) => {
          this.regionMap[r.regionID] = r.regionName;
        });

        // ✅ Filter regions by selected company
        this.regions = activeRegions.filter((r: any) =>
          r.companyID == this.companyId
        );

        console.log('Filtered Regions 👉', this.regions);

        // ✅ Auto-select region
        if (!this.regionId && this.regions.length > 0) {
          this.regionId = this.regions[0].regionID;
        }

        // ✅ Bind to model
        this.noticePeriod.RegionID = this.regionId;
      },
      error: () => Swal.fire('Error', 'Failed to load regions', 'error')
    });
  }

  onCompanyChange(): void {

    sessionStorage.setItem('CompanyId', this.companyId.toString());

    this.noticePeriod.CompanyID = this.companyId;
    this.regionId = 0;
    this.regions = [];

    this.loadRegions();
  }

  onRegionChange(): void {

    sessionStorage.setItem('RegionId', this.regionId.toString());
    this.noticePeriod.RegionID = this.regionId;
  }

  // ================= RESET =================

  clearForm() {

    this.noticePeriod = {
      RecruitmentNoticePeriodID: 0,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      NoticePeriod: '',
      IsActive: true
    };

    this.isEditMode = false;
  }
}

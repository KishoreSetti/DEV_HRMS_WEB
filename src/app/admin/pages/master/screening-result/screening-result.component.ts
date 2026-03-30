import { Component } from '@angular/core';
import { AdminService, Company, Region } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

export interface ScreeningResult {
  ScreeningResultID: number;
  CompanyID: number;
  RegionID: number;
  Weekoff: string;
  IsActive: boolean;
  UserId?: number;
}
@Component({
  selector: 'app-screening-result',
  standalone: false,
  templateUrl: './screening-result.component.html',
  styleUrl: './screening-result.component.css'
})
export class ScreeningResultComponent {
searchText = '';

  screeningList: ScreeningResult[] = [];

  screening!: ScreeningResult;

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

    this.screening = {
      ScreeningResultID: 0,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      Weekoff: '',
      IsActive: true
    };

    this.loadCompanies();

    this.loadScreeningResults();
  }

  loadScreeningResults() {

    this.spinner.show();

    this.adminService.getScreeningResults(this.userId).subscribe({

      next: (res: any) => {

        const data = res.data || [];

        this.screeningList = data.map((x: any) => ({

          ScreeningResultID: x.screeningResultID,

          Weekoff: x.weekoff,

          IsActive: x.isActive,

          CompanyID: x.companyID,

          RegionID: x.regionID

        }));

        this.spinner.hide();
      },

      error: () => {

        this.spinner.hide();

        Swal.fire('Error', 'Failed to load Screening Results', 'error');

      }

    });

  }


  onSubmit() {

    this.screening.CompanyID = this.companyId;

    this.screening.RegionID = this.regionId;

    this.screening.UserId = this.userId;

    this.spinner.show();

    const obs = this.isEditMode
      ? this.adminService.updateScreeningResult(this.screening)
      : this.adminService.createScreeningResult(this.screening);

    obs.subscribe({

      next: () => {

        this.spinner.hide();

        Swal.fire(
          this.isEditMode ? 'Updated!' : 'Added!',
          'Screening Result saved successfully',
          'success'
        );

        this.loadScreeningResults();

        this.clearForm();
      },

      error: () => {

        this.spinner.hide();

        Swal.fire('Error', 'Operation failed', 'error');

      }

    });

  }


  editResult(s: ScreeningResult) {

    this.screening = { ...s };

    this.companyId = s.CompanyID;

    this.regionId = s.RegionID;

    this.loadRegions();

    this.isEditMode = true;

  }


  deleteResult(s: ScreeningResult) {

    Swal.fire({
      title: `Delete "${s.Weekoff}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes delete'
    }).then(result => {

      if (result.isConfirmed) {

        this.spinner.show();

        this.adminService.deleteScreeningResult(s.ScreeningResultID).subscribe({

          next: () => {

            this.spinner.hide();

            Swal.fire('Deleted', 'Record deleted successfully', 'success');

            this.loadScreeningResults();

          },

          error: () => {

            this.spinner.hide();

            Swal.fire('Error', 'Delete failed', 'error');

          }

        });

      }

    });

  }


  filteredResults(): ScreeningResult[] {

    const search = this.searchText?.toLowerCase() || '';

    return this.screeningList.filter(x =>
      x.Weekoff?.toLowerCase().includes(search)
    );

  }


loadCompanies() {

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

      // ✅ Load regions after companies
      this.loadRegions();
    }

  });

}


loadRegions() {

  this.adminService.getRegions(null, this.userId).subscribe({

    next: (res: any) => {

      console.log('All Regions 👉', res);

      const data = res?.data ?? res ?? [];

      // 🔥 Only active regions
      const activeRegions = data.filter((r: any) => r.isActive === true);

      // ✅ Build region map from active data
      this.regionMap = {};
      activeRegions.forEach((r: any) => {
        this.regionMap[r.regionID] = r.regionName;
      });

      // ✅ Filter regions by selected company
      this.regions = activeRegions.filter((r: any) =>
        r.companyID == this.companyId
      );

      console.log('Filtered Regions 👉', this.regions);
    }

  });

}


  onCompanyChange() {

    sessionStorage.setItem('CompanyId', this.companyId.toString());

    this.regionId = 0;

    this.loadRegions();

  }


  onRegionChange() {

    sessionStorage.setItem('RegionId', this.regionId.toString());

  }


  resetForm() {

    Swal.fire({

      title: 'Reset Form?',

      icon: 'question',

      showCancelButton: true,

      confirmButtonText: 'Yes reset'

    }).then(result => {

      if (result.isConfirmed) {

        this.clearForm();

      }

    });

  }


  clearForm() {

    this.screening = {

      ScreeningResultID: 0,

      CompanyID: this.companyId,

      RegionID: this.regionId,

      Weekoff: '',

      IsActive: true

    };

    this.isEditMode = false;

  }
}

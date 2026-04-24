import { Component } from '@angular/core';
import { AdminService, Company, Region } from '../../../admin/servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

export interface Weekoff {
  WeekoffID: number;
  CompanyID: number;
  RegionID: number;
  WeekoffDate: string;
  IsActive: boolean;
  UserId?: number;
}
@Component({
  selector: 'app-week-off',
  standalone: false,
  templateUrl: './week-off.component.html',
  styleUrl: './week-off.component.css'
})
export class WeekOffComponent {
//  searchText = '';
//   weekoffList: Weekoff[] = [];
//   weekoff!: Weekoff;

//   companies: Company[] = [];
//   regions: Region[] = [];

//   companyMap: Record<number, string> = {};
//   regionMap: Record<number, string> = {};

//   userId!: number;
//   companyId!: number;
//   regionId!: number;

//   isEditMode = false;

//   constructor(
//     private adminService: AdminService,
//     private spinner: NgxSpinnerService
//   ) { }

//   ngOnInit(): void {

//     this.userId = Number(sessionStorage.getItem("UserId"));
//     this.companyId = Number(sessionStorage.getItem("CompanyId"));
//     this.regionId = Number(sessionStorage.getItem("RegionId"));

//     if (!this.userId) {
//       console.error("UserId missing in sessionStorage");
//       return;
//     }

//     this.weekoff = {
//       WeekoffID: 0,
//       CompanyID: this.companyId,
//       RegionID: this.regionId,
//       WeekoffDate: '',
//       IsActive: true
//     };

//     this.loadCompanies();
//     this.loadWeekoffs();
//   }
// weekoffDates: { value: string, display: string }[] = [
//     { value: 'Monday', display: 'Monday' },
//     { value: 'Tuesday', display: 'Tuesday' },
//     { value: 'Wednesday', display: 'Wednesday' },
//     { value: 'Thursday', display: 'Thursday' },
//     { value: 'Friday', display: 'Friday' },
//     { value: 'Saturday', display: 'Saturday' },
//     { value: 'Sunday', display: 'Sunday' }
//   ];
//   // ================= LOAD WEEKOFFS =================

//   loadWeekoffs() {
//     this.spinner.show();

//     this.adminService.getWeekoffList(this.userId).subscribe({
//       next: (res: any) => {

//         const data = res.data || [];

//         this.weekoffList = data.map((w: any) => ({
//           WeekoffID: w.weekoffID,
//           CompanyID: w.companyID,
//           RegionID: w.regionID,
//           WeekoffDate: w.weekoffDate,
//           IsActive: w.isActive
//         }));

//         this.spinner.hide();
//       },
//       error: () => {
//         this.spinner.hide();
//         Swal.fire('Error', 'Failed to load weekoffs', 'error');
//       }
//     });
//   }

//   // ================= SUBMIT =================

//   onSubmit() {
//    debugger;
//     this.weekoff.CompanyID = this.companyId;
//     this.weekoff.RegionID = this.regionId;
//     this.weekoff.UserId = this.userId;

//     this.spinner.show();

//     const obs = this.isEditMode
//       ? this.adminService.updateWeekoff(this.weekoff)
//       : this.adminService.createWeekoff(this.weekoff);

//     obs.subscribe({
//       next: () => {
//         this.spinner.hide();

//         Swal.fire(
//           this.isEditMode ? 'Updated!' : 'Added!',
//           `Weekoff ${this.isEditMode ? 'updated' : 'created'} successfully.`,
//           'success'
//         );

//         this.loadWeekoffs();
//         this.clearForm();
//       },
//       error: () => {
//         this.spinner.hide();
//         Swal.fire('Error', 'Operation failed.', 'error');
//       }
//     });
//   }

//   // ================= EDIT =================

//   editWeekoff(w: Weekoff) {

//     this.weekoff = { ...w };

//     this.companyId = w.CompanyID;
//     this.regionId = w.RegionID;

//     this.loadRegions();

//     this.isEditMode = true;
//   }

//   // ================= DELETE =================

//   deleteWeekoff(w: Weekoff) {

//     Swal.fire({
//       title: 'Delete this weekoff?',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, delete'
//     }).then(result => {

//       if (result.isConfirmed) {

//         this.spinner.show();

//         this.adminService.deleteWeekoff(w.WeekoffID).subscribe({
//           next: () => {
//             this.spinner.hide();
//             Swal.fire('Deleted!', 'Weekoff deleted successfully.', 'success');
//             this.loadWeekoffs();
//           },
//           error: () => {
//             this.spinner.hide();
//             Swal.fire('Error', 'Delete failed.', 'error');
//           }
//         });
//       }
//     });
//   }

//   // ================= FILTER =================

//   filteredWeekoffs(): Weekoff[] {

//     const search = this.searchText?.toLowerCase() || '';

//     return this.weekoffList.filter(w =>
//       w.WeekoffDate?.toLowerCase().includes(search)
//     );
//   }

//   // ================= LOAD COMPANIES =================

//   loadCompanies(): void {

//     this.adminService.getCompanies(null, this.userId).subscribe({
//       next: (res: Company[]) => {

//         this.companies = res || [];

//         this.companyMap = {};
//         this.companies.forEach(c =>
//           this.companyMap[c.companyId] = c.companyName
//         );

//         if (this.companyId) {
//           this.loadRegions();
//         }
//       },
//       error: () => Swal.fire('Error', 'Failed to load companies', 'error')
//     });
//   }

//   // ================= LOAD REGIONS =================

//   loadRegions(): void {

//     this.adminService.getRegions(null, this.userId).subscribe({
//       next: (res: Region[]) => {

//         const allRegions = res || [];

//         this.regionMap = {};
//         allRegions.forEach(r =>
//           this.regionMap[r.regionID] = r.regionName
//         );

//         this.regions = allRegions.filter(r =>
//           r.companyID == this.companyId
//         );

//         if (!this.regionId && this.regions.length > 0) {
//           this.regionId = this.regions[0].regionID;
//         }

//         this.weekoff.RegionID = this.regionId;
//       },
//       error: () => Swal.fire('Error', 'Failed to load regions', 'error')
//     });
//   }

//   onCompanyChange(): void {

//     sessionStorage.setItem('CompanyId', this.companyId.toString());

//     this.weekoff.CompanyID = this.companyId;
//     this.regionId = 0;
//     this.regions = [];

//     this.loadRegions();
//   }

//   onRegionChange(): void {

//     sessionStorage.setItem('RegionId', this.regionId.toString());
//     this.weekoff.RegionID = this.regionId;
//   }

//   // ================= RESET =================

//   clearForm() {

//     this.weekoff = {
//       WeekoffID: 0,
//       CompanyID: this.companyId,
//       RegionID: this.regionId,
//       WeekoffDate: '',
//       IsActive: true
//     };

//     this.isEditMode = false;
//   }
 searchText = '';
  weekoffList: Weekoff[] = [];
  weekoff!: Weekoff;

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

    this.weekoff = {
      WeekoffID: 0,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      WeekoffDate: '',
      IsActive: true
    };

    this.loadCompanies();
    this.loadWeekoffs();
  }
weekoffDates: { value: string, display: string }[] = [
    { value: 'Monday', display: 'Monday' },
    { value: 'Tuesday', display: 'Tuesday' },
    { value: 'Wednesday', display: 'Wednesday' },
    { value: 'Thursday', display: 'Thursday' },
    { value: 'Friday', display: 'Friday' },
    { value: 'Saturday', display: 'Saturday' },
    { value: 'Sunday', display: 'Sunday' }
  ];
  // ================= LOAD WEEKOFFS =================

  loadWeekoffs() {
    this.spinner.show();

    this.adminService.getWeekoffList(this.userId).subscribe({
      next: (res: any) => {

        const data = res.data || [];

        this.weekoffList = data.map((w: any) => ({
          WeekoffID: w.weekoffID,
          CompanyID: w.companyID,
          RegionID: w.regionID,
          WeekoffDate: w.weekoffDate,
          IsActive: w.isActive
        }));

        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load weekoffs', 'error');
      }
    });
  }

  // ================= SUBMIT =================

  onSubmit() {
   debugger;
    this.weekoff.CompanyID = this.companyId;
    this.weekoff.RegionID = this.regionId;
    this.weekoff.UserId = this.userId;

    this.spinner.show();

    const obs = this.isEditMode
      ? this.adminService.updateWeekoff(this.weekoff)
      : this.adminService.createWeekoff(this.weekoff);

    obs.subscribe({
     next: (res: any) => {

        this.spinner.hide();

        // 🔴 HANDLE DUPLICATE / FAILURE
        if (!res.success) {
          Swal.fire('Warning', res.message, 'warning');
          return;
        }

        // ✅ SUCCESS
        Swal.fire(
          this.isEditMode ? 'Updated!' : 'Added!',
          res.message,
          'success'
        );

        this.loadWeekoffs();
        this.clearForm();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Operation failed.', 'error');
      }
    });
  }

  // ================= EDIT =================

  editWeekoff(w: Weekoff) {

    this.weekoff = { ...w };

    this.companyId = w.CompanyID;
    this.regionId = w.RegionID;

    this.loadRegions();

    this.isEditMode = true;
  }

  // ================= DELETE =================

  deleteWeekoff(w: Weekoff) {

    Swal.fire({
      title: 'Delete this weekoff?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete'
    }).then(result => {

      if (result.isConfirmed) {

        this.spinner.show();

        this.adminService.deleteWeekoff(w.WeekoffID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted!', 'Weekoff deleted successfully.', 'success');
            this.loadWeekoffs();
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

  filteredWeekoffs(): Weekoff[] {

    const search = this.searchText?.toLowerCase() || '';

    return this.weekoffList.filter(w =>
      w.WeekoffDate?.toLowerCase().includes(search)
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

      // ✅ Build map from active companies
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

      // ✅ Build map from active regions
      this.regionMap = {};
      activeRegions.forEach((r: any) => {
        this.regionMap[r.regionID] = r.regionName;
      });

      // ✅ Filter by selected company
      this.regions = activeRegions.filter((r: any) =>
        r.companyID == this.companyId
      );

      console.log('Filtered Regions 👉', this.regions);

      // ✅ Auto-select region if not selected
      if (!this.regionId && this.regions.length > 0) {
        this.regionId = this.regions[0].regionID;
      }

      // ✅ Bind to model
      this.weekoff.RegionID = this.regionId;
    },
    error: () => Swal.fire('Error', 'Failed to load regions', 'error')
  });
}
  onCompanyChange(): void {

    sessionStorage.setItem('CompanyId', this.companyId.toString());

    this.weekoff.CompanyID = this.companyId;
    this.regionId = 0;
    this.regions = [];

    this.loadRegions();
  }

  onRegionChange(): void {

    sessionStorage.setItem('RegionId', this.regionId.toString());
    this.weekoff.RegionID = this.regionId;
  }

  // ================= RESET =================

  clearForm() {

    this.weekoff = {
      WeekoffID: 0,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      WeekoffDate: '',
      IsActive: true
    };

    this.isEditMode = false;
  }
}

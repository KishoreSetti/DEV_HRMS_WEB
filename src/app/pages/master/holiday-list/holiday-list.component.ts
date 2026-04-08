import { Component } from '@angular/core';
import { AdminService, Company, Region } from '../../../admin/servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

export interface HolidayList {
  HolidayListID: number;
  CompanyID: number;
  RegionID: number;
  HolidayListName: string;
  Date: string;
  IsActive: boolean;
  UserId?: number;
}
@Component({
  selector: 'app-holiday-list',
  standalone: false,
  templateUrl: './holiday-list.component.html',
  styleUrl: './holiday-list.component.css'
})
export class HolidayListComponent {
//    searchText = '';
//   holidayList: HolidayList[] = [];
// holiday!: HolidayList;
// companies: Company[] = [];
// regions: Region[] = [];

// companyMap: Record<number, string> = {};
// regionMap: Record<number, string> = {};
//  userId!: number;
//   companyId!: number;
//   regionId!: number;
//   isEditMode = false;

//   ngOnInit(): void {
  
//   this.userId = Number(sessionStorage.getItem("UserId"));
//   this.companyId = Number(sessionStorage.getItem("CompanyId"));
//   this.regionId = Number(sessionStorage.getItem("RegionId"));

//   if (!this.userId) {
//     console.error("UserId missing in sessionStorage");
//     return;
//   }
//    this.holiday = {
//     HolidayListID: 0,
//     CompanyID: this.companyId,
//     RegionID: this.regionId,
//     HolidayListName: '',
//     Date: '',
//     IsActive: true
//   };
// this.loadCompanies();
//   this.loadHolidays();
// }
//   constructor(private adminService: AdminService, private spinner: NgxSpinnerService) {}

// loadHolidays() {
//   this.spinner.show();

//   this.adminService.getHolidayList(this.userId).subscribe({
//     next: (res: any) => {

//       const data = res.data || [];

//       this.holidayList = data.map((h: any) => ({
//         HolidayListID: h.holidayListID,
//         HolidayListName: h.holidayListName,
//         Date: h.date,
//         IsActive: h.isActive,
//         CompanyID: h.companyID,
//         RegionID: h.regionID
//       }));

//       this.spinner.hide();
//     },
//     error: () => {
//       this.spinner.hide();
//       Swal.fire('Error', 'Failed to load holiday list', 'error');
//     }
//   });
// }

// onSubmit() {

//   this.holiday.CompanyID = this.companyId;
//   this.holiday.RegionID = this.regionId;
//   this.holiday.UserId = this.userId;

//   this.spinner.show();

//   const obs = this.isEditMode
//     ? this.adminService.updateHoliday(this.holiday)
//     : this.adminService.createHoliday(this.holiday);

//   obs.subscribe({
//     next: () => {
//       this.spinner.hide();

//       Swal.fire(
//         this.isEditMode ? 'Updated!' : 'Added!',
//         `Holiday ${this.isEditMode ? 'updated' : 'created'} successfully.`,
//         'success'
//       );

//       this.loadHolidays();
//      this.clearForm();
//     },
//     error: () => {
//       this.spinner.hide();
//       Swal.fire('Error', 'Operation failed. Please try again.', 'error');
//     }
//   });
// }
// resetForm() {

//   Swal.fire({
//     title: 'Reset Form?',
//     text: 'All entered data will be cleared.',
//     icon: 'question',
//     showCancelButton: true,
//     confirmButtonText: 'Yes, reset'
//   }).then(result => {

//     if (result.isConfirmed) {
//       this.clearForm();   // call silent reset
//     }

//   });
// }
// editHoliday(h: HolidayList) {
//   this.holiday = { ...h };
//     // ✅ Bind dropdown values
//   this.companyId = h.CompanyID;
//   this.regionId = h.RegionID;

//   // ✅ Load regions for selected company
//   this.loadRegions();
//   this.isEditMode = true;
// }

// deleteHoliday(h: HolidayList) {

//   Swal.fire({
//     title: `Delete "${h.HolidayListName}"?`,
//     text: 'This action cannot be undone.',
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#d33',
//     cancelButtonColor: '#6c757d',
//     confirmButtonText: 'Yes, delete it'
//   }).then(result => {

//     if (result.isConfirmed) {

//       this.spinner.show();

//       this.adminService.deleteHoliday(h.HolidayListID).subscribe({
//         next: () => {
//           this.spinner.hide();
//           Swal.fire('Deleted!', 'Holiday deleted successfully.', 'success');
//           this.loadHolidays();
//         },
//         error: () => {
//           this.spinner.hide();
//           Swal.fire('Error', 'Delete failed.', 'error');
//         }
//       });

//     }

//   });
// }


// filteredHolidays(): HolidayList[] {
//   const search = this.searchText?.toLowerCase() || '';

//   return this.holidayList.filter(h =>
//     h.HolidayListName?.toLowerCase().includes(search)
//   );
// }
// loadCompanies(): void {
//   this.adminService.getCompanies(null, this.userId).subscribe({
//     next: (res: Company[]) => {
//       this.companies = res || [];

//       this.companyMap = {};
//       this.companies.forEach(c =>
//         this.companyMap[c.companyId] = c.companyName
//       );

//       if (this.companyId) {
//         this.loadRegions();
//       }
//     },
//     error: () => Swal.fire('Error', 'Failed to load companies', 'error')
//   });
// }
// loadRegions(): void {

//   this.adminService.getRegions(null, this.userId).subscribe({
//     next: (res: Region[]) => {

//       const allRegions = res || [];

//       // ✅ Build FULL region map (for table display)
//       this.regionMap = {};
//       allRegions.forEach(r => {
//         this.regionMap[r.regionID] = r.regionName;
//       });

//       // ✅ Filter only selected company regions for dropdown
//       this.regions = allRegions.filter(r =>
//         r.companyID == this.companyId
//       );

//       if (!this.regionId && this.regions.length > 0) {
//         this.regionId = this.regions[0].regionID;
//       }

//       this.holiday.RegionID = this.regionId;
//     },
//     error: () => Swal.fire('Error', 'Failed to load regions', 'error')
//   });
// }
// onCompanyChange(): void {

//   sessionStorage.setItem('CompanyId', this.companyId.toString());

//   this.holiday.CompanyID = this.companyId;
//   this.regionId = 0;
//   this.regions = [];

//   this.loadRegions();
// }
// onRegionChange(): void {

//   sessionStorage.setItem('RegionId', this.regionId.toString());

//   this.holiday.RegionID = this.regionId;
// }
// clearForm() {
//   this.holiday = {
//     HolidayListID: 0,
//     CompanyID: this.companyId,
//     RegionID: this.regionId,
//     HolidayListName: '',
//     Date: '',
//     IsActive: true
//   };

//   this.isEditMode = false;
// }
 searchText = '';
  holidayList: HolidayList[] = [];
  holiday!: HolidayList;
  companies: Company[] = [];
  regions: Region[] = [];

  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};
  userId!: number;
  companyId!: number;
  regionId!: number;
  isEditMode = false;

  ngOnInit(): void {

    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
    this.holiday = {
      HolidayListID: 0,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      HolidayListName: '',
      Date: '',
      IsActive: true
    };
    this.loadCompanies();
    this.loadHolidays();
  }
  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) { }

  loadHolidays() {
    this.spinner.show();

    this.adminService.getHolidayList(this.userId).subscribe({
      next: (res: any) => {

        const data = res.data || [];

        this.holidayList = data.map((h: any) => ({
          HolidayListID: h.holidayListID,
          HolidayListName: h.holidayListName,
          Date: h.date,
          IsActive: h.isActive,
          CompanyID: h.companyID,
          RegionID: h.regionID
        }));

        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load holiday list', 'error');
      }
    });
  }

  onSubmit() {

    this.holiday.CompanyID = this.companyId;
    this.holiday.RegionID = this.regionId;
    this.holiday.UserId = this.userId;

    this.spinner.show();

    const obs = this.isEditMode
      ? this.adminService.updateHoliday(this.holiday)
      : this.adminService.createHoliday(this.holiday);

    obs.subscribe({
  next: (res: any) => {

    this.spinner.hide();   // ✅ keep this

    if (!res.success) {
      Swal.fire('Warning', res.message, 'warning');
      return;
    }

    Swal.fire(
      this.isEditMode ? 'Updated!' : 'Added!',
      res.message,
      'success'
    );

    this.loadHolidays();
    this.clearForm();
  },
  error: (err) => {

    this.spinner.hide();   // ✅ important

    Swal.fire(
      'Error',
      err.error?.message || 'Operation failed',
      'error'
    );
  }
});
  }
  resetForm() {

    Swal.fire({
      title: 'Reset Form?',
      text: 'All entered data will be cleared.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset'
    }).then(result => {

      if (result.isConfirmed) {
        this.clearForm();   // call silent reset
      }

    });
  }
  editHoliday(h: HolidayList) {
    this.holiday = { ...h };
    // ✅ Bind dropdown values
    this.companyId = h.CompanyID;
    this.regionId = h.RegionID;

    // ✅ Load regions for selected company
    this.loadRegions();
    this.isEditMode = true;
  }

  deleteHoliday(h: HolidayList) {

    Swal.fire({
      title: `Delete "${h.HolidayListName}"?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it'
    }).then(result => {

      if (result.isConfirmed) {

        this.spinner.show();

        this.adminService.deleteHoliday(h.HolidayListID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted!', 'Holiday deleted successfully.', 'success');
            this.loadHolidays();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed.', 'error');
          }
        });

      }

    });
  }


  filteredHolidays(): HolidayList[] {
    const search = this.searchText?.toLowerCase() || '';

    return this.holidayList.filter(h =>
      h.HolidayListName?.toLowerCase().includes(search)
    );
  }
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

      // ✅ Load regions if company selected
      if (this.companyId) {
        this.loadRegions();
      }
    },
    error: () => Swal.fire('Error', 'Failed to load companies', 'error')
  });
}
loadRegions(): void {
  this.adminService.getRegions(null, this.userId).subscribe({
    next: (res: any) => {
      console.log('All Regions 👉', res);

      const data = res?.data ?? res ?? [];

      // 🔥 Only active regions
      const activeRegions = data.filter((r: any) => r.isActive === true);

      // ✅ Build FULL map (only active needed for UI anyway)
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

      this.holiday.RegionID = this.regionId;
    },
    error: () => Swal.fire('Error', 'Failed to load regions', 'error')
  });
}
  onCompanyChange(): void {

    sessionStorage.setItem('CompanyId', this.companyId.toString());

    this.holiday.CompanyID = this.companyId;
    this.regionId = 0;
    this.regions = [];

    this.loadRegions();
  }
  onRegionChange(): void {

    sessionStorage.setItem('RegionId', this.regionId.toString());

    this.holiday.RegionID = this.regionId;
  }
  clearForm() {
    this.holiday = {
      HolidayListID: 0,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      HolidayListName: '',
      Date: '',
      IsActive: true
    };

    this.isEditMode = false;
  }
}

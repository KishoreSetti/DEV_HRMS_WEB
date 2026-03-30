import { Component, OnInit, } from '@angular/core';

import { AdminService,Company, Region, User, ShiftMasterDto } from '../../servies/admin.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-shifts',
  standalone: false,
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.css'
})
export class ShiftsComponent {
// shift: ShiftMasterDto = this.getEmptyShift();
//   shifts: ShiftMasterDto[] = [];
//   user: User = this.getEmptyUser();
//   users: User[] = [];
//   companies: Company[] = [];
//   regions: Region[] = [];
//   filteredRegions: Region[] = []; 

//   isEditMode = false;
//   searchText = '';
//   statusFilter: any = '';
//   currentPage = 1;
//   pageSize = 5;
//   userId = sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0;

//   showForm = false; // toggle form visibility

//   constructor(private userService: AdminService) { }

//   ngOnInit(): void {
//      this.loadCompanies();
//     this.loadRegions();
//     this.loadShifts();
//   }
  
//   getEmptyShift(): ShiftMasterDto {
//     return {
//       shiftID: 0,
//       shiftName: '',
//       companyID: 0,
//       regionID: 0,
//       userId: this.userId,
//       isActive: true,
//       shiftStartTime: '', 
//       shiftEndTime: '',
//       companyName:'',
//       regionName:''
//     };
//   }
//   getEmptyUser(): User {
//     return {
//       userId: 0,
//       companyId: 0,
//       regionId: 0,
//       employeeCode: '',
//       fullName: '',
//       email: '',
//       roleId: 0,
//       departmentId: 0,
//       reportingTo: 0,
//       password: '',
//       status: 'Active',
//       userCompanyId: 0,
//     };
//   }
//   onCompanyChange(): void {
//   if (!this.shift.companyID) {
//     this.filteredRegions = [];
//     this.shift.regionID = 0;
//     return;
//   }

//   this.filteredRegions = this.regions.filter(
//     r => Number(r.companyID) === Number(this.shift.companyID)
//   );

//   console.log("Filtered Regions:", this.filteredRegions);

//   this.shift.regionID = 0;
// }

//   loadCompanies(): void {
//     this.userService.getCompanies(null, this.userId).subscribe({
//       next: (res: any) => this.companies = res,
//       error: () => Swal.fire('Error', 'Failed to load companies', 'error')
//     });
//   }

//   loadRegions(): void {
//   this.userService.getRegions(null, this.userId).subscribe({
//     next: (res: any) => {
//       this.regions = res || [];
//     },
//     error: () => this.showError('Failed to load regions')
//   });
// }

//   loadShifts() {
//     if (!this.userId) {
//     Swal.fire('Error', 'User not found', 'error');
//     return;
//   }
//     this.userService.getAllShifts(this.userId).subscribe({
//       next: (res: ShiftMasterDto[]) => this.shifts = res,
//       error: () => Swal.fire('Error', 'Failed to load shifts', 'error')
//     });
//   }

//   // Show/hide form
//   openForm() {
//     this.showForm = true;
//   }

//   // Save Shift (UI only)
//   onSubmit() {
//     if (!this.shift.shiftName || !this.shift.companyID || !this.shift.regionID || !this.shift.shiftStartTime || !this.shift.shiftEndTime) {
//       Swal.fire('Warning', 'Please fill all required fields', 'warning');
//       return;
//     }

//     this.shift.userId = this.userId;

//     if (this.isEditMode) {
//       this.userService.updateShift(this.shift).subscribe({
//         next: (res:any) => {
          
//       this.loadShifts();
//       Swal.fire('Updated', res.message, 'success');
//       this.resetForm();
     
//         },
      
//       });
//     } else {
//       this.userService.addShift(this.shift).subscribe({
//   next: (res:any) => {
//     if (res.success) {
//        this.loadShifts();
//       Swal.fire('Created', res.message, 'success');
//       this.resetForm();
     
//     } else {
//       Swal.fire('Error', res.message, 'error');
//     }
//   },
//   error: (err:any) => {
//     console.error(err);
//     Swal.fire('Error', 'Failed to create shift', 'error');
//   }
// });

//     }
//   }

//   editShift(s: any) {
//     this.shift = { ...s };
//     this.isEditMode = true;
//     this.showForm = true;
//     this.filteredRegions = this.regions.filter(r => r.companyID === Number(this.shift.companyID));
//   }

//   deleteShift(s: ShiftMasterDto) {
//   Swal.fire({
//     title: 'Are you sure?',
//     text: "You won't be able to revert this!",
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonText: 'Yes, delete it!'
//   }).then(result => {
//     if (result.isConfirmed) {
//       this.userService.deleteShift(s.shiftID).subscribe({
//         next: (res: any) => {
//           if (res.success) {
//             Swal.fire('Deleted!', res.message, 'success');
//             this.loadShifts();
//           } else {
//             Swal.fire('Error', res.message, 'error');
//           }
//         },
//         error: (err:any) => {
//           console.error(err);
//           Swal.fire('Error', 'Failed to delete shift', 'error');
//         }
//       });
//     }
//   });
// }


//   resetForm() {
//     this.shift = this.getEmptyShift();
//     this.isEditMode = false;
//     this.showForm = false;
//     this.filteredRegions = [];
//   }
  
//   generateNextEmployeeCode() {
//     console.log('Next employee code generated');
//   }

//   showError(message: string) {
//     alert(message);
//   }

//   get filteredShifts() {
//     return this.shifts.filter(s =>
//       (!this.searchText || s.shiftName.toLowerCase().includes(this.searchText.toLowerCase())) &&
//       (this.statusFilter === '' || s.isActive === this.statusFilter)
//     );
//   }

//   get totalPages() {
//     return Math.ceil(this.filteredShifts.length / this.pageSize);
//   }

//   get pagedShifts() {
//     const start = (this.currentPage - 1) * this.pageSize;
//     return this.filteredShifts.slice(start, start + this.pageSize);
//   }

//   goToPage(page: number) {
//     if (page >= 1 && page <= this.totalPages) this.currentPage = page;
//   }  
shift: ShiftMasterDto = this.getEmptyShift();
  shifts: ShiftMasterDto[] = [];
  user: User = this.getEmptyUser();
  users: User[] = [];
  companies: Company[] = [];
  regions: Region[] = [];
  filteredRegions: Region[] = []; 

  isEditMode = false;
  searchText = '';
  statusFilter: any = '';
  currentPage = 1;
  pageSize = 5;
  userId = sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0;

  showForm = false; // toggle form visibility

  constructor(private userService: AdminService) { }

  ngOnInit(): void {
     this.loadCompanies();
    this.loadRegions();
    this.loadShifts();
  }
  
  getEmptyShift(): ShiftMasterDto {
    return {
      shiftID: 0,
      shiftName: '',
      companyID: 0,
      regionID: 0,
      userId: this.userId,
      isActive: true,
      shiftStartTime: '', 
      shiftEndTime: '',
      companyName:'',
      regionName:''
    };
  }
  getEmptyUser(): User {
    return {
      userId: 0,
      companyId: 0,
      regionId: 0,
      employeeCode: '',
      fullName: '',
      email: '',
      roleId: 0,
      departmentId: 0,
      reportingTo: 0,
      password: '',
      status: 'Active',
      userCompanyId: 0,
    };
  }
  onCompanyChange(): void {
  if (!this.shift.companyID) {
    this.filteredRegions = [];
    this.shift.regionID = 0;
    return;
  }

  this.filteredRegions = this.regions.filter(
    r => Number(r.companyID) === Number(this.shift.companyID)
  );

  console.log("Filtered Regions:", this.filteredRegions);

  this.shift.regionID = 0;
}

loadCompanies(): void {
  this.userService.getCompanies(null, this.userId).subscribe({
    next: (res: any) => {
      console.log('All Companies 👉', res);

      const data = res?.data ?? res ?? [];

      // 🔥 Only active companies
      this.companies = data.filter((c: any) => c.isActive === true);

      console.log('Active Companies 👉', this.companies);
    },
    error: () => Swal.fire('Error', 'Failed to load companies', 'error')
  });
}

loadRegions(): void {
  this.userService.getRegions(null, this.userId).subscribe({
    next: (res: any) => {
      console.log('All Regions 👉', res);

      const data = res?.data ?? res ?? [];

      // 🔥 Only active regions
      this.regions = data.filter((r: any) => r.isActive === true);

      console.log('Active Regions 👉', this.regions);
    },
    error: () => this.showError('Failed to load regions')
  });
}

  loadShifts() {
    if (!this.userId) {
    Swal.fire('Error', 'User not found', 'error');
    return;
  }
    this.userService.getAllShifts(this.userId).subscribe({
      next: (res: ShiftMasterDto[]) => this.shifts = res,
      error: () => Swal.fire('Error', 'Failed to load shifts', 'error')
    });
  }

  // Show/hide form
  openForm() {
    this.showForm = true;
  }

  // Save Shift (UI only)
  onSubmit() {
    if (!this.shift.shiftName || !this.shift.companyID || !this.shift.regionID || !this.shift.shiftStartTime || !this.shift.shiftEndTime) {
      Swal.fire('Warning', 'Please fill all required fields', 'warning');
      return;
    }

    this.shift.userId = this.userId;

    if (this.isEditMode) {
      this.userService.updateShift(this.shift).subscribe({
        next: (res: any) => {

  if (!res.success) {
    Swal.fire('Warning', res.message, 'warning');
    return;
  }

  this.loadShifts();

  Swal.fire('Updated', res.message, 'success');

  this.resetForm();
},
      
      });
    } else {
      this.userService.addShift(this.shift).subscribe({
  next: (res:any) => {
    if (res.success) {
       this.loadShifts();
      Swal.fire('Created', res.message, 'success');
      this.resetForm();
     
    } else {
      Swal.fire('Error', res.message, 'error');
    }
  },
 error: (err: any) => {

  console.error(err);

  // 🔥 SHOW BACKEND MESSAGE
  Swal.fire(
    'Warning',
    err.error?.message || 'Operation failed',
    'warning'
  );
}
});

    }
  }

  editShift(s: any) {
    this.shift = { ...s };
    this.isEditMode = true;
    this.showForm = true;
    this.filteredRegions = this.regions.filter(r => r.companyID === Number(this.shift.companyID));
  }

  deleteShift(s: ShiftMasterDto) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  }).then(result => {
    if (result.isConfirmed) {
      this.userService.deleteShift(s.shiftID).subscribe({
        next: (res: any) => {
          if (res.success) {
            Swal.fire('Deleted!', res.message, 'success');
            this.loadShifts();
          } else {
            Swal.fire('Error', res.message, 'error');
          }
        },
        error: (err:any) => {
          console.error(err);
          Swal.fire('Error', 'Failed to delete shift', 'error');
        }
      });
    }
  });
}


  resetForm() {
    this.shift = this.getEmptyShift();
    this.isEditMode = false;
    this.showForm = false;
    this.filteredRegions = [];
  }
  
  generateNextEmployeeCode() {
    console.log('Next employee code generated');
  }

  showError(message: string) {
    alert(message);
  }

  get filteredShifts() {
    return this.shifts.filter(s =>
      (!this.searchText || s.shiftName.toLowerCase().includes(this.searchText.toLowerCase())) &&
      (this.statusFilter === '' || s.isActive === this.statusFilter)
    );
  }

  get totalPages() {
    return Math.ceil(this.filteredShifts.length / this.pageSize);
  }

  get pagedShifts() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredShifts.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }
}

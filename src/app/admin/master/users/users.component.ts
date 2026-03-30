import { Component } from '@angular/core';
import { AdminService, User, Company, Region, RoleMaster } from '../../servies/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
//    users: User[] = [];
//   companies: Company[] = [];
//   regions: Region[] = [];
//   roles: RoleMaster[] = [];
//   totalCount: number = 0;
//   user: User = this.getEmptyUser();
//   isEditMode = false;
// departments: any[] = [];
// userId: number = sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0;
// companyId: number = sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : 0;
// regionId: number = sessionStorage.getItem('RegionId') ? Number(sessionStorage.getItem('RegionId')) : 0;
// filteredRegions: any[] = [];
// filteredRoles: RoleMaster[] = [];
// filteredDepartments: any[] = [];
//   constructor(private userService: AdminService) {}

//   ngOnInit(): void {
//     this.generateNextEmployeeCode();
//     this.loadUsers();
//     this.loadCompanies();
//     this.loadRegions();
//     this.loadRoles();
//     this.loadDepartments();
//   }
// loadDepartments(): void {
//   debugger;
//   this.userService.getDepartments(this.userId).subscribe({
//     next: (res: any) => {
//       console.log(res);
//       debugger;
//       this.departments = res?.data?.data ?? [];
//       console.log("Departments Loaded:", this.departments);
//     },
//     error: (err) => {
//       console.error(err);
//       this.showError('Failed to load departments.');
//     }
//   });
// }
//   getEmptyUser(): User {
//     return {
//       userId: 0,
//       companyId: 0,
//       regionId: 0,
//       employeeCode: '',
//       fullName: '',
//       email: '',
//       roleId: 0,
//       departmentId:0,
//       reportingTo:0,
//       password: '',
//       status: 'Active',
//       userCompanyId:sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0
//      , loginType: '' 
//     };
//   }
// getreporting(id:any)
// {
// }  
// onStatusChange(event: Event): void {
//     const input = event.target as HTMLInputElement | null;
//     this.user.status = input?.checked ? 'Active' : 'Inactive';
//   }

//   loadUsers(): void {
//    this.userService.getAllUsers().subscribe({
//     next: (res: any) => {
//       this.users = res.map((u:any) => ({
//         ...u,
//         roleId: u.roleId,
//         reportingTo: u.ReportingTo ?? 0  // ✅ map correct API field to frontend field
//       }));

//       this.generateNextEmployeeCode();
//     },
//     error: () => this.showError('Failed to load users.')
//   });
//   }

//   onCompanyChange(companyId: number): void {
//     this.user.regionId = 0;
//     this.user.roleId = 0;
//     this.user.departmentId = 0;
//     this.filteredRegions = companyId
//     ? this.regions.filter(r => Number(r.companyID) === Number(companyId))
//     : [];
//     this.filteredRoles = [];
//     this.filteredDepartments = [];
//   }
//   onRegionChange(regionId: number): void {
//   this.user.roleId = 0;
//   this.user.departmentId = 0;

//   if (!this.user.companyId || !regionId) {
//     this.filteredRoles = [];
//     this.filteredDepartments = [];
//     return;
//   }
//   this.filteredRoles = this.roles.filter(r =>
//     Number(r.companyId) === Number(this.user.companyId) &&
//     Number(r.regionId) === Number(regionId)
//   );
//   this.filterDepartments();
// }
// filterDepartments(): void {
//   if (!this.user.companyId || !this.user.regionId) {
//     this.filteredDepartments = [];
//     return;
//   }

//   this.filteredDepartments = this.departments.filter(d =>
//     Number(d.companyId) === Number(this.user.companyId) &&
//     Number(d.regionId) === Number(this.user.regionId)
//   );

//   console.log("Filtered Departments:", this.filteredDepartments);
// }

//     loadCompanies(): void {
//       this.userService.getCompanies(null,this.userId).subscribe({
//         next: (res:any) => (this.companies = res),
//         error: () => Swal.fire('Error', 'Failed to load companies.', 'error')
//       });
//     }
  
//     loadRegions(): void {
//       this.userService.getRegions(null, this.userId).subscribe({
//       next: (res: any) => {
//         this.regions = res;
//         this.filteredRegions = [];
//       },
//       error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
//     });
//     }

//   loadRoles(): void {
//   if (!this.userId) {
//     Swal.fire('Error', 'Invalid User Id', 'error');
//     return;
//   }

//   this.userService.getroles(this.userId).subscribe({
//     next: (roles: RoleMaster[]) => {
      
//       this.roles = roles;
//       this.totalCount = roles.length;
//     },
//     error: (err) => {
//       console.error(err);
//       Swal.fire('Error', 'Failed to load roles.', 'error');
//     }
//   });
// }

//  // 🔹 Auto-generate Employee Code (Frontend only)
//  generateNextEmployeeCode(): void {
//   // If no users exist yet
//   if (!this.users || this.users.length === 0) {
//     this.user.employeeCode = 'EMP0001';
//     return;
//   }

//   // Get all numeric parts from employee codes
//   const numericCodes = this.users
//     .map(u => {
//       const match = u.employeeCode?.match(/\d+$/);
//       return match ? parseInt(match[0], 10) : 0;
//     })
//     .filter(num => num > 0);

//   // Find max existing number
//   const maxCode = Math.max(...numericCodes);

//   // Increment by 1
//   const nextCode = maxCode + 1;

//   // Format and assign
//   this.user.employeeCode = `EMP${nextCode.toString().padStart(4, '0')}`;
// }

//   onSubmit(): void {
//     if (this.isEditMode) {
//       this.userService.updateUser(this.user).subscribe({
//         next: () => {
//           this.showSuccess('User updated successfully!');
//           this.resetForm();
//           this.loadUsers();
//         },
//         error: () => this.showError('Failed to update user.')
//       });
//     } else {

//       this.userService.createUser(this.user).subscribe({
//         next: () => {
//           this.showSuccess('User created successfully. Welcome email sent!');
//           this.resetForm();
//           this.loadUsers();
//         },
//         error: () => this.showError('Failed to create user.')
//       });
//     }
//   }

//   editUser(u: User): void {
//     this.user = { ...u };
//     this.isEditMode = true;
    
//   this.filteredRegions = this.regions.filter(r =>
//     Number(r.companyID) === Number(this.user.companyId)
//   );
  
//   if (this.user.regionId) {
//     this.onRegionChange(this.user.regionId);
//   } 
//   debugger;
//  this.roles = this.roles.filter(r =>
//    r.roleId === u.roleId
//  );

 

  
//   }

//   deleteUser(u: User): void {
//     Swal.fire({
//       title: 'Are you sure?',
//       text: 'This will permanently delete the user.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, delete it!',
//       cancelButtonText: 'Cancel'
//     }).then(result => {
//       if (result.isConfirmed) {
//         this.userService.deleteUser(u.userId!).subscribe({
//           next: () => {
//             this.showSuccess('User deleted successfully.');
//             this.loadUsers();
//           },
//           error: () => this.showError('Failed to delete user.')
//         });
//       }
//     });
//   }

//   sendPasswordEmail(u: User): void {
//     this.userService.sendWelcomeEmail(u).subscribe({
//       next: () => this.showSuccess('Welcome email sent successfully!'),
//       error: () => this.showError('Failed to send email.')
//     });
//   }

//   generateFormPassword(): void {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#';
//     this.user.password = Array.from({ length: 10 }, () =>
//       chars[Math.floor(Math.random() * chars.length)]
//     ).join('');
//   }

//   resetForm(): void {
//     this.user = this.getEmptyUser();
//     this.isEditMode = false;
//   }

//   getCompanyName(id: number): string {
//     return this.companies.find(c => c.companyId === id)?.companyName || '-';
//   }

//   getRegionName(id: number): string {
//     return this.regions.find(r => r.regionID === id)?.regionName || '-';
//   }

//   getRoleName(id: number): string {
//     return this.roles.find(r => r.roleId === id)?.roleName || '-';
//   }

//   showSuccess(msg: string): void {
//     Swal.fire({
//       icon: 'success',
//       title: 'Success',
//       text: msg,
//       timer: 2000,
//       showConfirmButton: false
//     });
//   }

//   showError(msg: string): void {
//     Swal.fire({
//       icon: 'error',
//       title: 'Error',
//       text: msg,
//       timer: 2500,
//       showConfirmButton: false
//     });
//   }
  users: User[] = [];
  companies: Company[] = [];
  regions: Region[] = [];
  roles: RoleMaster[] = [];
  totalCount: number = 0;
  user: User = this.getEmptyUser();
  isEditMode = false;
departments: any[] = [];
userId: number = sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0;
companyId: number = sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : 0;
regionId: number = sessionStorage.getItem('RegionId') ? Number(sessionStorage.getItem('RegionId')) : 0;
filteredRegions: any[] = [];
filteredRoles: RoleMaster[] = [];
filteredDepartments: any[] = [];
reportingManagers: User[] = [];
  constructor(private userService: AdminService) {}

  ngOnInit(): void {
    this.generateNextEmployeeCode();
    this.loadUsers();
    this.loadCompanies();
    this.loadRegions();
    this.loadRoles();
    this.loadDepartments();
  }

  loadDepartments(): void {
  this.userService.getDepartments(this.userId).subscribe({
    next: (res: any) => {
      this.departments = (res?.data ?? []).filter((d: any) => d.isActive);

      this.filterDepartments(); // 🔥 ADD THIS
    }
  });
}
// loadDepartments(): void {
//   debugger;
//   this.userService.getDepartments(this.userId).subscribe({
//     next: (res: any) => {
//       console.log('departments :', res);

//       const allDepartments = res?.data?.data ?? [];

//       // 🔥 Filter only active records
//     this.departments = (res?.data ?? []).filter((d: any) => d.isActive === true);

//       console.log("Filtered Active Departments:", this.departments);
//     },
//     error: (err) => {
//       console.error(err);
//       this.showError('Failed to load departments.');
//     }
//   });
// }
  getEmptyUser(): User {
    return {
      userId: 0,
      companyId: 0,
      regionId: 0,
      employeeCode: '',
      fullName: '',
      email: '',
      roleId: 0,
      departmentId:0,
      reportingTo:0,
      password: '',
      status: 'Active',
      userCompanyId:sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0
     , loginType: '' 
    };
  }
getreporting(id:any)
{
}  
onStatusChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.user.status = input?.checked ? 'Active' : 'Inactive';
  }

  loadUsers(): void {
   this.userService.getAllUsers().subscribe({
    next: (res: any) => {
      this.users = res.map((u:any) => ({
        ...u,
        password: u.passwordHash || '',
        roleId: u.roleId,
        reportingTo: Number(u.reportingTo) || 0 
      }));
      this.reportingManagers = [...this.users];

      this.generateNextEmployeeCode();
    },
    error: () => this.showError('Failed to load users.')
  });
  }

  onCompanyChange(companyId: number): void {
    this.user.regionId = 0;
    this.user.roleId = 0;
    this.user.departmentId = 0;
    this.filteredRegions = companyId
    ? this.regions.filter(r => Number(r.companyID) === Number(companyId))
    : [];
    this.filteredRoles = [];
    this.filteredDepartments = [];
  }
  onRegionChange(regionId: number): void {
  this.user.roleId = 0;
  this.user.departmentId = 0;

  if (!this.user.companyId || !regionId) {
    this.filteredRoles = [];
    this.filteredDepartments = [];
    return;
  }
  this.filteredRoles = this.roles.filter(r =>
    Number(r.companyId) === Number(this.user.companyId) &&
    Number(r.regionId) === Number(regionId)
  );
  this.filterDepartments();
}
filterDepartments(): void {
  if (!this.user.companyId || !this.user.regionId) {
    this.filteredDepartments = [];
    return;
  }

  this.filteredDepartments = this.departments.filter(d =>
    Number(d.companyId) === Number(this.user.companyId) &&
    Number(d.regionId) === Number(this.user.regionId)
  );

  console.log("Filtered Departments:", this.filteredDepartments);
}

    loadCompanies(): void {
      this.userService.getCompanies(null,this.userId).subscribe({
        next: (res:any) => (this.companies = res),
        error: () => Swal.fire('Error', 'Failed to load companies.', 'error')
      });
    }
  
    loadRegions(): void {
      this.userService.getRegions(null, this.userId).subscribe({
      next: (res: any) => {
        this.regions = res;
        this.filteredRegions = [];
      },
      error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
    });
    }

  loadRoles(): void {
  if (!this.userId) {
    Swal.fire('Error', 'Invalid User Id', 'error');
    return;
  }

  this.userService.getroles(this.userId).subscribe({
    next: (roles: RoleMaster[]) => {
      
      this.roles = roles;
      this.totalCount = roles.length;
    },
    error: (err) => {
      console.error(err);
      Swal.fire('Error', 'Failed to load roles.', 'error');
    }
  });
}

 // 🔹 Auto-generate Employee Code (Frontend only)
 generateNextEmployeeCode(): void {
  // If no users exist yet
  if (!this.users || this.users.length === 0) {
    this.user.employeeCode = 'EMP0001';
    return;
  }

  // Get all numeric parts from employee codes
  const numericCodes = this.users
    .map(u => {
      const match = u.employeeCode?.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter(num => num > 0);

  // Find max existing number
  const maxCode = Math.max(...numericCodes);

  // Increment by 1
  const nextCode = maxCode + 1;

  // Format and assign
  this.user.employeeCode = `EMP${nextCode.toString().padStart(4, '0')}`;
}

  onSubmit(): void {
    if (!this.user.companyId || this.user.companyId === 0) {
    Swal.fire('Validation', 'Please select company', 'warning');
    return;
  }

  if (!this.user.regionId || this.user.regionId === 0) {
    Swal.fire('Validation', 'Please select region', 'warning');
    return;
  }

  if (!this.user.fullName || this.user.fullName.trim() === '') {
    Swal.fire('Validation', 'Please enter full name', 'warning');
    return;
  }

  if (!this.user.email || this.user.email.trim() === '') {
    Swal.fire('Validation', 'Please enter email', 'warning');
    return;
  }

  if (!this.user.roleId || this.user.roleId === 0) {
    Swal.fire('Validation', 'Please select role', 'warning');
    return;
  }

  if (!this.user.departmentId || this.user.departmentId === 0) {
    Swal.fire('Validation', 'Please select department', 'warning');
    return;
  }

  if (!this.user.reportingTo || this.user.reportingTo === 0) {
    Swal.fire('Validation', 'Please select reporting manager', 'warning');
    return;
  }

  if (!this.user.loginType || this.user.loginType.trim() === '') {
    Swal.fire('Validation', 'Please select login type', 'warning');
    return;
  }

  if (!this.user.password || this.user.password.trim() === '') {
    Swal.fire('Validation', 'Please enter password', 'warning');
    return;
  }
    if (this.isEditMode) {
      this.userService.updateUser(this.user).subscribe({
        next: () => {
          this.showSuccess('User updated successfully!');
          this.resetForm();
          this.loadUsers();
        },
        error: () => this.showError('Failed to update user.')
      });
    } else {

      this.userService.createUser(this.user).subscribe({
        next: () => {
          this.showSuccess('User created successfully. Welcome email sent!');
          this.resetForm();
          this.loadUsers();
        },
        error: () => this.showError('Failed to create user.')
      });
    }
  }

  editUser(u: User): void {
   this.user = {
    ...u,
    roleId: Number(u.roleId)   // 🔥 important
  };
    this.isEditMode = true;
    
  this.filteredRegions = this.regions.filter(r =>
    Number(r.companyID) === Number(this.user.companyId)
  );
  
  if (this.user.regionId) {
    this.filteredRoles = this.roles.filter(r =>
      Number(r.companyId) === Number(this.user.companyId) &&
      Number(r.regionId) === Number(this.user.regionId)
    );
  } else {
    this.filteredRoles = [];
  }

  this.filterDepartments();

  this.user.roleId = u.roleId;

  this.user.departmentId = u.departmentId;
  
  // const manager = this.reportingManagers.find(m => m.userId === this.user.reportingTo);
  // this.user.reportingTo = manager?.userId ?? 0;

  this.user.loginType = u.loginType;
}

  deleteUser(u: User): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the user.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.userService.deleteUser(u.userId!).subscribe({
          next: () => {
            this.showSuccess('User deleted successfully.');
            this.loadUsers();
          },
          error: () => this.showError('Failed to delete user.')
        });
      }
    });
  }

  sendPasswordEmail(u: User): void {
    this.userService.sendWelcomeEmail(u).subscribe({
      next: () => this.showSuccess('Welcome email sent successfully!'),
      error: () => this.showError('Failed to send email.')
    });
  }

  generateFormPassword(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#';
    this.user.password = Array.from({ length: 10 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  resetForm(): void {
    this.user = this.getEmptyUser();
    this.isEditMode = false;
  }

  getCompanyName(id: number): string {
    return this.companies.find(c => c.companyId === id)?.companyName || '-';
  }

  getRegionName(id: number): string {
    return this.regions.find(r => r.regionID === id)?.regionName || '-';
  }

  getRoleName(id: number): string {
    return this.roles.find(r => r.roleId === id)?.roleName || '-';
  }

  showSuccess(msg: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: msg,
      timer: 2000,
      showConfirmButton: false
    });
  }

  showError(msg: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: msg,
      timer: 2500,
      showConfirmButton: false
    });
  }
}

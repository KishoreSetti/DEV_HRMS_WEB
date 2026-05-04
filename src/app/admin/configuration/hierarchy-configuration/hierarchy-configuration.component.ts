  import { Component, OnInit } from '@angular/core';
import { AdminService, ManagerDropdown, EmployeeMaster, MyTeamUsers, RoleMaster       } from '../../servies/admin.service';
import Swal from 'sweetalert2';
interface Employee {
  id: number;
  name: string;
  role: string;
  managerId?: number;
  department: string;
}
@Component({
  selector: 'app-hierarchy-configuration',
  standalone: false,
  templateUrl: './hierarchy-configuration.component.html',
  styleUrl: './hierarchy-configuration.component.css'
})
export class HierarchyConfigurationComponent {
   employees: EmployeeMaster[] = [];
  managers: ManagerDropdown[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  paginatedEmployees: EmployeeMaster[] = [];

  newEmployee: EmployeeMaster = { 
    employeeMasterId: 0,
    fullName: '',
    role: '',      
    department: '',
    managerId: undefined,
    createdBy: undefined,
    updatedBy: undefined
  };

  isEditMode = false;
 users: MyTeamUsers[] = [];

  userId: number = Number(sessionStorage.getItem('UserId')) || 0;
  companyId: number = Number(sessionStorage.getItem('CompanyId')) || 0;
  regionId: number = Number(sessionStorage.getItem('RegionId')) || 0;

  constructor(private service: AdminService) {}

  ngOnInit(): void {
 
    this.loadDepartments();
    this.loadRoles();
  this.loadUsers(); 
    this.loadEmployees();
    this.loadManagers();
  }
  departments:any;
// loadDepartments(): void {
//   debugger;
//   this.service.getDepartments(this.userId).subscribe({
//     next: (res: any) => {
//       console.log(res);
//       debugger;
//       this.departments = res?.data?.data ?? [];
//       console.log("Departments Loaded:", this.departments);
//     },
//     error: (err) => {
//       console.error(err);
     
//     }
//   });
// }

loadDepartments(): void {
  this.service.getDepartments(this.userId).subscribe({
    next: (res: any) => {
      console.log('Departments API 👉', res);

      // 🔥 FIX HERE
      this.departments = res?.data ?? [];

      console.log("Departments Loaded 👉", this.departments);
    },
    error: (err) => console.error(err)
  });
}
roles:any;
loadRoles(): void {
  if (!this.userId) {
    Swal.fire('Error', 'Invalid User Id', 'error');
    return;
  }

  this.service.getroles(this.userId).subscribe({
    next: (roles: RoleMaster[]) => {
      
      this.roles = roles;
    
    },
    error: (err) => {
      console.error(err);
      Swal.fire('Error', 'Failed to load roles.', 'error');
    }
  });
}
  loadUsers(): void {
  this.service.getAllUsersForMyTeamConfigurations(this.userId).subscribe({
    next: (data) => {
      this.users = data;
    },
    error: () => {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load users.'
      });
    }
  });
}

onUserSelect(userId: number): void {
  const selectedUser = this.users.find(u => u.userId === userId);

   console.log('Selected User 👉', selectedUser);
  console.log('Departments 👉', this.departments);
  console.log('selectedUser.departmentId 👉', selectedUser?.departmentId);
  // 🔥 FIX: extract departmentName
  const departmentName = this.departments.find(
    (d: any) => Number(d.departmentId) === Number(selectedUser?.departmentId)
  )?.departmentName;

  //const departmentName=this.departments.find((d:any)=>d.departmentId==selectedUser?.departmentId)?.departmentName;
  const roleName=this.roles.find((r:any)=>r.roleId==selectedUser?.roleId)?.roleName;
  if (selectedUser) {

    // Set employee id
    this.newEmployee.employeeMasterId = selectedUser.userId;

    // Auto fill values
    this.newEmployee.fullName = selectedUser.fullName;

    // designation → role
    this.newEmployee.role = roleName ?? '';

    // departmentId → department (convert to string if needed)
    this.newEmployee.department = departmentName   ?? '';

    // reportingTo → managerId
    this.newEmployee.managerId = selectedUser.reportingTo;

  }
}

  // ================= LOAD DATA =================
  loadEmployees(): void {
this.service.getAllEmployees(this.userId).subscribe({
      next: data => {
        this.employees = data;
        this.totalPages = Math.ceil(this.employees.length / this.pageSize);
        this.setPaginatedEmployees();
      },
      error: err => Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load employees.'
      })
    });
  }

  setPaginatedEmployees(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmployees = this.employees.slice(startIndex, endIndex);
  }

  loadManagers(): void {
    this.service.getManagers(this.userId).subscribe({
      next: data => this.managers = data,
      error: err => Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load managers.'
      })
    });
  }

  // ================= CRUD =================
  saveEmployee(): void {
    if (!this.userId || this.userId <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid User',
        text: 'Cannot save employee: invalid logged-in user.'
      });
      return;
    }

    if (this.isEditMode) {
      const payload: EmployeeMaster = {
        ...this.newEmployee,
        createdBy: undefined,
        updatedBy: this.userId
      };

     this.service.updateEmployee(
  this.newEmployee.employeeMasterId,
  this.userId,
  payload
).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Employee updated successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadEmployees();
          this.resetForm();
        },
        error: err => Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to update employee.'
        })
      });

    } else {
      const payload: EmployeeMaster = {
        ...this.newEmployee,
        createdBy: this.userId,
        updatedBy: undefined
      };

      this.service.createEmployee(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Added!',
            text: 'Employee added successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadEmployees();
          this.resetForm();
        },
        error: err => Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to create employee.'
        })
      });
    }
  }

  editEmployee(emp: EmployeeMaster): void {
    this.newEmployee = { ...emp };
    this.isEditMode = true;
  }

  deleteEmployee(emp: EmployeeMaster): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete employee ${emp.fullName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
this.service.deleteEmployee(
  emp.employeeMasterId,
  this.userId
).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Employee deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadEmployees();
          },
          error: err => Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to delete employee.'
          })
        });
      }
    });
  }

  resetForm(): void {
    this.newEmployee = { 
      employeeMasterId: 0,
      fullName: '',
      role: '',
      department: '',
      managerId: undefined,
      createdBy: undefined,
      updatedBy: undefined
    };
    this.isEditMode = false;
  }

getManagerName(managerId?: number | null): string {

  if (!managerId) return '-';

  const manager = this.users.find(u => u.userId === managerId);
  return manager ? manager.fullName : '-';
}

  // ================= PAGINATION =================
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.setPaginatedEmployees();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.setPaginatedEmployees();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.setPaginatedEmployees();
    }
  }
}

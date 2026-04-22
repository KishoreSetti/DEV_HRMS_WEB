import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  showPassword = false;
  users = [
    { role: 'HR', username: 'hr_user', password: 'Hr@123', route: '/dashboard' },
    { role: 'Manager', username: 'manager_user', password: 'Mg@123', route: '/dashboard' },
    { role: 'Admin', username: 'admin_user', password: 'Admin@123', route: '/admin/dashboard' },
     { role: 'SuperAdmin', username: 'superadmin_user', password: 'Superadmin@123', route: '/dashboard' },
    { role: 'Finance', username: 'finance_user', password: 'Fn@123', route: '/dashboard' },
    { role: 'Employee', username: 'emp_user', password: 'emp@123', route: '/dashboard' }
  ];

  constructor(private router: Router,private loginService: AdminService) {}

  // login() {
  //   const user = this.users.find(u => u.username === this.username && u.password === this.password);
  //   if (user) {
  //     sessionStorage.setItem("CompanyId","1"); // Set a default CompanyId
  //     sessionStorage.setItem("regionId","1"); // Set a default regionId
  //     localStorage.setItem('currentUser', JSON.stringify(user)); // store user info
  //     this.router.navigate([user.route]);
  //   } else {
  //     this.errorMessage = 'Invalid username or password';
  //   }
  // }
  login() {
    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.loading = true;

    this.loginService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && response.message) {
          // ✅ Save session or token
          if(response.user.error)          {
            Swal.fire('Login Failed', response.user.error, 'error');
            return;
          }
          
          sessionStorage.setItem('CompanyId', response.user.companyId);
          sessionStorage.setItem('RegionId', response.user.regionId.toString());
          sessionStorage.setItem('roleId', response.user.roleId.toString());
          sessionStorage.setItem('currentUser', JSON.stringify(response.user));
          sessionStorage.setItem('roleName', response.user.roleName);
            sessionStorage.setItem('DepartmentName', response.user.departmentName ?? '');
        sessionStorage.setItem('ReportingManagerName', response.user.reportingManagerName ?? '');
        sessionStorage.setItem('DesignationName', response.user.designationName ?? '');
          sessionStorage.setItem('Name', response.user.fullName);         
          sessionStorage.setItem('EmployeeCode', response.user.employeeCode);
          sessionStorage.setItem('UserId', response.user.userId.toString());
          sessionStorage.setItem('Email', response.user.personalEmail);
          sessionStorage.setItem('RegionName', response.user.regionName);
          sessionStorage.setItem('CompanyName', response.user.companyName);
   sessionStorage.setItem('DepartmentProject', response.user.departmentProject ?? '');
        sessionStorage.setItem('paswordChanged', response.user.paswordChanged ?? '');
           sessionStorage.setItem('UserId', response.user.userId.toString());
          sessionStorage.setItem('repotingTo', response.user.reportingTo);
           sessionStorage.setItem('DepartmentId', response.user.departmentId?.toString() ?? '');
           sessionStorage.setItem('DesignationId', response.user.designationId?.toString() ?? '');
        sessionStorage.setItem('reportingManagerId',response.user.reportingManagerId?.toString() ?? '');
        sessionStorage.setItem('userCompanyId',response.user.userCompanyId?.toString() ?? '');
          Swal.fire('Login Successful', response.message, 'success');
           
          if(response.user.paswordChanged == null){
            Swal.fire('Change Password', 'You must change your password before proceeding.', 'info');
            this.router.navigate(['/change-password'] , { queryParams: { userId: response.user.userId } });
            return;
           }

          // ✅ Navigate by role or response route
            let route = '/dashboard';

            if (response.user.roleId === 0) {
              route = '/superadmin-dashboard';
            }
            else if (response.user.roleName === 'Admin') {
              route = '/admin/dashboard';
            }
            else {
              route = '/dashboard';
            }

          this.router.navigate([route]);
        } else {
          this.errorMessage = 'Invalid username or password';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Login failed:', error);
        this.errorMessage = 'Server error. Please try again.';
      }
    });
  }
  togglePassword() {
  this.showPassword = !this.showPassword;
}
}

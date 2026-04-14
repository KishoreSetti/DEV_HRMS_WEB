import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../servies/admin.service';
import Swal from 'sweetalert2';   // ✅ FIXED

@Component({
  selector: 'app-accounttype',
  standalone: false,
  templateUrl: './accounttype.component.html',
  styleUrls: ['./accounttype.component.css']   // ✅ FIXED
})
export class AccounttypeComponent {

  accountTypes: any[] = [];
  companies: any[] = [];
  regions: any[] = [];

  account: any = this.getEmptyAccount();
  isEditMode = false;

  userId = Number(sessionStorage.getItem("UserId"));

  constructor(private service: AdminService) {}

  ngOnInit(): void {
    this.loadAccountTypes();
    this.loadCompanies();
    this.loadRegions();
  }
   getEmptyAccount() {
    return {
      accountTypeId: 0,
      accountType1: '',
      description: '',
      companyId: null,
      regionId: null,
      isActive: true,
      userId: Number(sessionStorage.getItem("UserId"))
    };
  }

  // 🔹 Load Account Types
  loadAccountTypes() {
    this.service.getAccountTypeList(this.userId).subscribe((res: any) => {
      this.accountTypes = res.data || res; 
    });
  }

  // 🔹 Load Dropdowns
  loadCompanies() {
    this.service.getCompanies(null, this.userId)
      .subscribe(res => this.companies = res);
  }

  loadRegions() {
    this.service.getRegions(null, this.userId)
      .subscribe(res => this.regions = res);
  }
  onSubmit() {
  this.account.userId = this.userId;

  if (
    !this.account.accountType1?.trim() ||
    this.account.companyId === null ||
    this.account.regionId === null
  ) {
    Swal.fire('Error', 'Please fill required fields', 'error');
    return;
  }
  if (this.isEditMode) {
    this.service.updateAccountType(this.account).subscribe(() => {
      Swal.fire('Updated!', 'Account Type updated', 'success');
      this.loadAccountTypes();
      this.resetForm();
    });
  } else {
    this.service.createAccountType(this.account).subscribe(() => {
      Swal.fire('Added!', 'Account Type created', 'success');
      this.loadAccountTypes();
      this.resetForm();
    });
  }
}

  // 🔹 Edit
  editAccount(a: any) {
    this.account = { ...a };
    this.isEditMode = true;
  }

  // 🔹 Delete
  deleteAccount(a: any) {
    Swal.fire({
      title: `Delete "${a.accountType1}"?`,
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteAccountType(a.accountTypeId).subscribe(() => {
          Swal.fire('Deleted!', 'Account Type removed', 'success');
          this.loadAccountTypes();
        });
      }
    });
  }

  // 🔹 Reset
  resetForm() {
    this.account = this.getEmptyAccount();
    this.isEditMode = false;
  }

  getCompanyName(id: number) {
  return this.companies.find(x => x.companyId == id)?.companyName || '-';
}

getRegionName(id: number) {
  return this.regions.find(x => x.regionID == id)?.regionName || '-';
}
}
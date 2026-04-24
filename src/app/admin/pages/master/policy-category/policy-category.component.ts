import { Component, OnInit } from '@angular/core';
import { AdminService,Company,PolicyCategory, Region } from '../../../servies/admin.service'; 
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-policy-category',
  standalone: false,
  templateUrl: './policy-category.component.html',
  styleUrl: './policy-category.component.css'
})
export class PolicyCategoryComponent {
    searchText = '';
  categories: PolicyCategory[] = [];
  category!: PolicyCategory;

  companies: Company[] = [];
  regions: Region[] = [];

  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};

  userId!: number;
  companyId!: number;
  regionId!: number;

  isEditMode = false;

  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    this.category = {
      PolicyCategoryID: 0,
      CompanyId: this.companyId,
      RegionId: this.regionId,
        companyName: "",  // ✅ add
  regionName: '',
      PolicyCategoryName: '',
      Description: '',
      IsActive: true
    };

    this.loadCompanies();
    this.loadCategories();
  }

  loadCategories() {
    this.spinner.show();

    this.adminService.getPolicyCategories(this.userId).subscribe({
      next: (res: any) => {
        const data = res.data || [];
      this.categories = data.map((x: any) => ({
  PolicyCategoryId: x.policyCategoryId,

  // 🔥 FIX HERE (case-sensitive)
  CompanyId: x.companyId ?? x.CompanyId,
  RegionId: x.regionId ?? x.RegionId,

  companyName: x.companyName,
  regionName: x.regionName,
  userId: x.userId,

  PolicyCategoryName: x.policyCategoryName,
  Description: x.description,
  IsActive: x.isActive
}));
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load policy categories', 'error');
      }
    });
  }

  onSubmit() {
    this.category.CompanyId= this.companyId;
    this.category.RegionId = this.regionId;
    this.category.UserId = this.userId;

    this.spinner.show();

    const obs = this.isEditMode
      ? this.adminService.updatePolicyCategory(this.category)
      : this.adminService.createPolicyCategory(this.category);

    obs.subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire(
          this.isEditMode ? 'Updated!' : 'Added!',
          `Policy Category ${this.isEditMode ? 'updated' : 'created'} successfully.`,
          'success'
        );
        this.loadCategories();
        this.clearForm();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Operation failed.', 'error');
      }
    });
  }

  // editCategory(c: PolicyCategory) {
  //   this.category = { ...c };

  //   this.companyId = c.CompanyID;
  //   this.regionId = c.RegionID;
    

  //   this.loadRegions();
  //   this.isEditMode = true;
  // }

//   editCategory(c: PolicyCategory) {
//     debugger;
//   this.category = { ...c };
//   c.companyName,
//   c.regionName,

//   // this.companyId = c.companyName;   // ✅ FIX
//   // this.regionId = c.regionName;     // ✅ FIX

//   this.loadRegions();
//   this.isEditMode = true;
// }

editCategory(c: any) {
  this.category = { ...c };

  // 🔥 MUST match property name
  this.companyId = c.CompanyId;
  this.regionId = c.RegionId;

  this.loadRegions();
  this.isEditMode = true;
}
  // deleteCategory(c: PolicyCategory) {
  //   Swal.fire({
  //     title: `Delete "${c.PolicyCategoryName}"?`,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#d33'
  //   }).then(result => {
  //     if (result.isConfirmed) {
  //       this.spinner.show();
  //       this.adminService.deletePolicyCategory(c.PolicyCategoryID).subscribe({
  //         next: () => {
  //           this.spinner.hide();
  //           Swal.fire('Deleted!', 'Deleted successfully.', 'success');
  //           this.loadCategories();
  //         },
  //         error: () => {
  //           this.spinner.hide();
  //           Swal.fire('Error', 'Delete failed.', 'error');
  //         }
  //       });
  //     }
  //   });
  // }

  deleteCategory(c: any) {
  Swal.fire({
    title: `Delete "${c.PolicyCategoryName}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33'
  }).then(result => {
    if (result.isConfirmed) {
      this.spinner.show();

      // 🔥 FIX HERE
      console.log("Deleting ID:", c.PolicyCategoryId);

      this.adminService.deletePolicyCategory(c.PolicyCategoryId).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Deleted!', 'Deleted successfully.', 'success');
          this.loadCategories();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Delete failed.', 'error');
        }
      });
    }
  });
}

  filteredCategories(): PolicyCategory[] {
    const s = this.searchText.toLowerCase();
    return this.categories.filter(x =>
      x.PolicyCategoryName.toLowerCase().includes(s)
    );
  }

  loadCompanies() {
    this.adminService.getCompanies(null, this.userId).subscribe({
      next: (res: Company[]) => {
        this.companies = res || [];
        this.companyMap = {};
        this.companies.forEach(c => this.companyMap[c.companyId] = c.companyName);
        this.loadRegions();
      }
    });
  }
  loadRegions() {
  this.adminService.getRegions(null, this.userId).subscribe({
    next: (res: Region[]) => {
      const all = res || [];

      this.regions = all.filter(r => r.companyID == this.companyId);

      // ✅ important for edit
      if (this.isEditMode) {
        this.category.RegionId = this.regionId;
      } else if (!this.regionId && this.regions.length > 0) {
        this.regionId = this.regions[0].regionID;
        this.category.RegionId = this.regionId;
      }
    }
  });
}

  // loadRegions() {
  //   this.adminService.getRegions(null, this.userId).subscribe({
  //     next: (res: Region[]) => {
  //       const all = res || [];
  //       this.regionMap = {};
  //       all.forEach(r => this.regionMap[r.regionID] = r.regionName);

  //       this.regions = all.filter(r => r.companyID == this.companyId);

  //       if (!this.regionId && this.regions.length > 0)
  //         this.regionId = this.regions[0].regionID;

  //       this.category.RegionID = this.regionId;
  //     }
  //   });
  // }

clearForm() {

  // ✅ RESET dropdown variables
  this.companyId = null as any;
  this.regionId = null as any;

  this.category = {
    PolicyCategoryID: 0,
    CompanyId: this.companyId,   // ✅ reset
    RegionId: this.regionId,    // ✅ reset
    companyName: '',
    regionName: '',
    PolicyCategoryName: '',
    Description: '',
    IsActive: true,
    UserId: this.userId
  };

  this.regions = []; // ✅ clear dependent dropdown

  this.isEditMode = false;
}
}

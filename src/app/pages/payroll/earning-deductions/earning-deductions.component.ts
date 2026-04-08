import { Component, OnInit } from '@angular/core';
import { EmployeePayRollService,SalaryComponent } from '../../../employee-pay-roll.service';
import Swal from 'sweetalert2';

interface PayrollComponent {
  Name: string;
  Type: 'Earning' | 'Deduction';
  IsActive: boolean;
}
@Component({
  selector: 'app-earning-deductions',
  standalone: false,
  templateUrl: './earning-deductions.component.html',
  styleUrl: './earning-deductions.component.css'
})
export class EarningDeductionsComponent {
userId!: number;
  companyId!: string;
  regionId!: string;

  component!: SalaryComponent;
  components: SalaryComponent[] = [];

  companies: any[] = [];
  regions: any[] = [];

  isEditMode = false;
  searchText = '';
  currentPage = 1;
  pageSize = 5;

  companyMap: { [key: string]: string } = {};
regionMap: { [key: string]: string } = {};

  constructor(private payrollService: EmployeePayRollService) { }

  ngOnInit(): void {

    // ✅ GET FROM SESSION STORAGE
    this.userId = Number(sessionStorage.getItem('userCompanyId'));
    this.companyId = sessionStorage.getItem('CompanyId') || '';
    this.regionId = sessionStorage.getItem('RegionId') || '';

    // ✅ NOW initialize component
    this.component = this.getEmptyComponent();

    this.loadComponents();
    this.loadCompanies();
    this.loadRegions();
  }

  getEmptyComponent(): SalaryComponent {
    return {
      componentName: '',
      type: 'Earning',
      calculationType: 'Fixed',
      percentageOf: '',
      isTaxable: false,
      isActive: true,
      companyId: '',
      regionId: '', 
      userId: this.userId
    };
  }

loadComponents() {
  this.payrollService.getComponents(this.userId)
    .subscribe({
      next: (res:any) => {
        this.components = res || [];
         this.currentPage = 1;
      },
      error: (err:any) => {
        console.error('Load error:', err);
        this.components = [];
      }
    });
}

loadCompanies() {
  this.payrollService.getCompanies(this.userId)
    .subscribe((res:any) => {
      this.companies = res || [];
      this.companyMap = {};
      this.companies.forEach(c => {
        this.companyMap[c.companyId] = c.companyName;
      });
    });
}

loadRegions() {
  this.payrollService.getRegions(this.userId)
    .subscribe((res:any) => {
      this.regions = res || [];
      this.regionMap = {};
      this.regions.forEach(r => {
        this.regionMap[r.regionId] = r.regionName;
      });
    });
}

 onSubmit() {

  this.component.userId = this.userId;
  this.component.companyId = this.component.companyId || this.companyId;
  this.component.regionId = this.component.regionId || this.regionId;

  // ✅ Show Loading
  Swal.fire({
    title: 'Please wait...',
    text: 'Processing your request',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  if (this.isEditMode && this.component.componentId) {

this.component.userId = this.userId;

this.payrollService.updateComponent(this.component).subscribe({
      next: () => {
        Swal.close();
        Swal.fire('Updated!', 'Component updated successfully.', 'success');
        this.loadComponents();
        this.resetForm();
      },
      error: () => {
        Swal.close();
        Swal.fire('Error!', 'Failed to update component.', 'error');
      }
    });

  } else {

    this.payrollService.createComponent(
      this.userId,
      this.component
    ).subscribe({
      next: () => {
        Swal.close();
        Swal.fire('Created!', 'Component created successfully.', 'success');
        this.loadComponents();
        this.resetForm();
      },
      error: () => {
        Swal.close();
        Swal.fire('Error!', 'Failed to create component.', 'error');
      }
    });
  }
}

  editComponent(c: SalaryComponent) {
    this.component = { ...c };
    this.isEditMode = true;
  }

deleteComponent(c: SalaryComponent) {

  if (!c.componentId) return;

  Swal.fire({
    title: 'Are you sure?',
    text: 'You won’t be able to revert this!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {

    if (result.isConfirmed) {

      Swal.fire({
        title: 'Deleting...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.payrollService.deleteComponent(c.componentId!, this.userId)
        .subscribe({
          next: () => {

            Swal.close();

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Component deleted successfully.',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.loadComponents();   // ✅ Reload AFTER popup
            });

          },
          error: (err:any) => {
            Swal.close();
            console.error('Delete error:', err);
            Swal.fire('Error!', 'Failed to delete component.', 'error');
          }
        });
        this.loadComponents();
    }
  });
}

  resetForm() {
    this.component = this.getEmptyComponent();
    this.isEditMode = false;
  }

  filteredComponents() {
    return this.components.filter(c =>
      c.componentName?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

paginatedComponents() {
  const filtered = this.filteredComponents();

  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;

  return filtered.slice(start, end);
}

totalPages() {
  return Math.ceil(this.filteredComponents().length / this.pageSize) || 1;
}

changePage(page: number) {
  if (page >= 1 && page <= this.totalPages()) {
    this.currentPage = page;
  }
}

  pagesArray() {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }
}

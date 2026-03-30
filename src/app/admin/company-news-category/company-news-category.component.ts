import { Component, OnInit } from '@angular/core';
import { AdminService, Company, Region, CompanyNewsCategory } from '../servies/admin.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-company-news-category',
  standalone: false,
  templateUrl: './company-news-category.component.html',
  styleUrl: './company-news-category.component.css'
})
export class CompanyNewsCategoryComponent {
  categories: CompanyNewsCategory[] = [];
  companies: Company[] = [];
  regions: Region[] = [];
  category: CompanyNewsCategory = this.getEmptyCategory();
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  pageSize = 5;
  currentPage = 1;
  UserId: number = sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0;
  Math = Math;
  filteredRegions: Region[] = [];

  constructor(private adminService: AdminService) { }
  ngOnInit(): void {
    this.loadCategories();
    this.loadCompanies();
    this.loadRegions();
  }

  getEmptyCategory(): CompanyNewsCategory {
    return {
      categoryId: 0,
      categoryName: '',
      companyId: 0,
      regionId: 0,
      isActive: true,
      userId: this.UserId
    };
  }

  loadCategories(): void {
    this.adminService.getCompanyNewsCategoryList(this.UserId).subscribe({
      next: (res: any) => {
        debugger;
        this.categories = res;
      },
      error: () => Swal.fire('Error', 'Failed to load categories.', 'error')
    });
  }
  onCompanyChange(): void {
    if (this.category.companyId) {
      this.filteredRegions = this.regions.filter(
        r => r.companyID === this.category.companyId
      );
    } else {
      this.filteredRegions = [];
    }

    this.category.regionId = 0;
  }

  loadCompanies(): void {
    this.adminService.getCompanies(null, this.UserId).subscribe({
      next: (res: any) => {
        console.log('All Companies 👉', res);

        const data = res?.data ?? res ?? [];

        // 🔥 Only active companies
        this.companies = data.filter((c: any) => c.isActive === true);

        console.log('Active Companies 👉', this.companies);
      },
      error: () => Swal.fire('Error', 'Failed to load companies.', 'error')
    });
  }

  loadRegions(): void {
    this.adminService.getRegions(null, this.UserId).subscribe({
      next: (res: any) => {
        console.log('All Regions 👉', res);

        const data = res?.data ?? res ?? [];

        // 🔥 Only active regions
        this.regions = data.filter((r: any) => r.isActive === true);

        console.log('Active Regions 👉', this.regions);
      },
      error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
    });
  }
  onSubmit(): void {
    this.category.categoryName = this.category.categoryName.trim(); // ✅ trim

    this.category.userId = this.UserId;

    const obs = this.isEditMode
      ? this.adminService.updateCompanyNewsCategory(this.category)
      : this.adminService.createCompanyNewsCategory(this.category);

    obs.subscribe({
      next: () => {
        Swal.fire(
          this.isEditMode ? 'Updated!' : 'Added!',
          'Saved successfully',
          'success'
        );
        this.loadCategories();
        this.resetForm();
      },
      error: (err) => {
        if (err.error?.message?.includes('Duplicate')) {
          Swal.fire('Warning', 'Duplicate category already exists', 'warning');
        } else {
          Swal.fire('Error', 'Duplicate category already exists', 'error');
        }
      }
    });
  }

  editCategory(c: CompanyNewsCategory) {
    this.category = { ...c };
    this.isEditMode = true;
    if (this.category.companyId) {
      this.filteredRegions = this.regions.filter(
        r => r.companyID === this.category.companyId
      );
    } else {
      this.filteredRegions = [];
    }
  }

  deleteCategory(c: CompanyNewsCategory) {
    Swal.fire({
      title: `Delete "${c.categoryName}"?`,
      text: 'This will deactivate the category.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        c.isActive = false;
        this.adminService.deleteCompanyNewsCategory(c.categoryId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Category deactivated successfully.', 'success');
            this.loadCategories();
          },
          error: () => Swal.fire('Error', 'Delete failed.', 'error')
        });
      }
    });
  }

  resetForm(): void {
    this.category = this.getEmptyCategory();
    this.isEditMode = false;
  }

  filteredCategories(): CompanyNewsCategory[] {
    const search = this.searchText.toLowerCase();
    return this.categories.filter(c =>
      c.categoryName.toLowerCase().includes(search) &&
      (this.statusFilter === '' || c.isActive === this.statusFilter)
    );
  }

  get pagedCategories(): CompanyNewsCategory[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCategories().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCategories().length / this.pageSize);
  }

  changePageSize(event: any): void {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  getCompanyName(companyId: number): string {
    const c = this.companies.find(x => x.companyId === companyId);
    return c ? c.companyName : '-';
  }

  getRegionName(regionId: number): string {
    const r = this.regions.find(x => x.regionID === regionId);
    return r ? r.regionName : '-';
  }

  exportAs(type: 'excel' | 'pdf') {
    // same export logic as before
  }
}

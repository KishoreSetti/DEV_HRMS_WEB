import { Component } from '@angular/core';
import { Expense, ExpensesService } from '../expenses.service';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-all-expenses',
  standalone: false,
  templateUrl: './all-expenses.component.html',
  styleUrl: './all-expenses.component.css'
})
export class AllExpensesComponent {
filtersForm!: FormGroup;
userId!: number;
  expenses: any[] = [];
  categories: any[] = [];
  countries: string[] = [];
  statuses: string[] = ['Pending', 'Approved', 'Rejected', 'Reimbursed'];
companyId!: number;
regionId!: number;
  // UI
  noRecordsFound = false;

  // Sorting
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  pageSize = 10;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpensesService
  ) {}

  // ============================================================
  // 🔹 INIT
  // ============================================================
  ngOnInit(): void {
      this.userId = sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId'))
      : 0;
      this.companyId = sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : 0;
      this.regionId = sessionStorage.getItem('RegionId') ? Number(sessionStorage.getItem('RegionId')) : 0;
    this.buildForm();
    //this.loadCategories();
    this.loadAllExpenses();
  }

  // ============================================================
  // 🔹 BUILD FILTER FORM
  // ============================================================
  buildForm(): void {
    this.filtersForm = this.fb.group({
      project: [''],
      categoryId: [''],
      country: [''],
      status: ['']
    });
  }

  // ============================================================
  // 🔹 LOAD ALL EXPENSES (ONLY API CHANGE)
  // ============================================================
  loadAllExpenses(): void {
        debugger;

  const companyId = this.companyId;
  const regionId = this.regionId;

    this.expenseService.getAllExpenses(companyId, regionId).subscribe(res => {
          debugger;

      if (res.success) {
        this.expenses = res.data.map((e: any) => ({
          ...e,
          visible: true,
          expenseCategoryId: Number(e.expenseCategoryId),
          projectNorm: e.projectName?.toLowerCase().trim() || '',
          countryNorm: e.country?.toLowerCase().trim() || ''
        }));

        this.countries = [
          ...new Set(this.expenses.map(x => x.countryNorm))
        ];

        this.noRecordsFound = false;
        this.currentPage = 1;
      }
    });
  }

  // ============================================================
  // 🔹 LOAD CATEGORIES
  // ============================================================
  // loadCategories(): void {
  //   this.expenseService.getExpenseCategories().subscribe(res => {
  //     if (res.success) {
  //       this.categories = res.data;
  //     }
  //   });
  // }

  // ============================================================
  // 🔹 APPLY FILTERS (SAME AS APPROVE)
  // ============================================================
  applyFilters(): void {
    const f = this.filtersForm.value;

    const project = f.project?.trim().toLowerCase();
    const categoryId = f.categoryId ? Number(f.categoryId) : null;
    const country = f.country?.toLowerCase();
    const status = f.status;

    let visibleCount = 0;

    this.expenses.forEach(e => {
      e.visible =
        (!project || e.projectNorm.includes(project)) &&
        (!categoryId || e.expenseCategoryId === categoryId) &&
        (!country || e.countryNorm === country) &&
        (!status || e.status === status);

      if (e.visible) visibleCount++;
    });

    this.noRecordsFound = visibleCount === 0;
    this.currentPage = 1;
  }

  // ============================================================
  // 🔹 SORT (SAME AS APPROVE)
  // ============================================================
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  // ============================================================
  // 🔹 FILTERED + SORTED + PAGINATED DATA
  // ============================================================
  get pagedExpenses(): any[] {
    let data = this.expenses.filter(e => e.visible);

    if (this.sortColumn) {
      data = data.sort((a, b) => {
        const valA = a[this.sortColumn!];
        const valB = b[this.sortColumn!];

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  }

  // ============================================================
  // 🔹 PAGINATION HELPERS
  // ============================================================
  get totalPages(): number {
    return Math.ceil(
      this.expenses.filter(e => e.visible).length / this.pageSize
    );
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }
}

import { Component, OnInit } from '@angular/core';
import { Expense, ExpenseApprovalDto, ExpensesService } from '../expenses.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-approve-expenses',
  standalone: false,
  templateUrl: './approve-expenses.component.html',
  styleUrl: './approve-expenses.component.css'
})
export class ApproveExpensesComponent {
filtersForm!: FormGroup;

  expenses: any[] = [];
  categories: any[] = [];
  countries: string[] = [];
  statuses: string[] = ['Pending', 'Approved', 'Rejected'];

  managerId!: number;

  // UI flags
  noRecordsFound = false;

  // 🔹 Sorting
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // 🔹 Pagination
  pageSize = 5;
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
    const storedUserId = sessionStorage.getItem('UserId');
    if (!storedUserId) {
      Swal.fire('Error', 'Session expired', 'error');
      return;
    }

    this.managerId = Number(storedUserId);
    this.buildForm();
    //this.loadCategories();
    this.loadExpensesForApproval();
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
  // 🔹 LOAD EXPENSES
  // ============================================================
  loadExpensesForApproval(): void {
    this.expenseService.getExpensesForApproval(this.managerId).subscribe(res => {
      if (res.success) {
        this.expenses = res.data.map((e: any) => ({
          ...e,
          checked: false,
          visible: true,
          expenseCategoryId: Number(e.expenseCategoryId),
          projectNorm: e.projectName?.toLowerCase().trim() || '',
          countryNorm: e.country?.toLowerCase().trim() || ''
        }));

        this.countries = [...new Set(this.expenses.map(x => x.countryNorm))];

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
  // 🔹 APPLY FILTERS (AND logic)
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
    this.currentPage = 1; // reset page after filter
  }

  // ============================================================
  // 🔹 SORT
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

  // ============================================================
  // 🔹 SELECT ALL CHECKBOX
  // ============================================================
  toggleAll(event: any): void {
    const checked = event.target.checked;
    this.expenses.forEach(e => {
      if (e.visible && e.status === 'Pending') {
        e.checked = checked;
      }
    });
  }

  // ============================================================
  // 🔹 APPROVE / REJECT
  // ============================================================
  approveRejectExpenses(action: 'Approved' | 'Rejected'): void {
    const selected = this.expenses.filter(
      e => e.checked && e.status === 'Pending'
    );

    if (!selected.length) {
      Swal.fire('Warning', 'Select at least one expense', 'warning');
      return;
    }

    Swal.fire({
      title: `Confirm ${action}`,
      icon: 'question',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        const payload: ExpenseApprovalDto = {
          expenseIds: selected.map(x => x.expenseId),
          action,
           managerId: this.managerId
        };

        this.expenseService.approveRejectExpenses(payload).subscribe(res => {
          if (res.success) {
            selected.forEach(e => {
              e.status = action;
              e.checked = false;
            });
            Swal.fire('Success', res.message, 'success');
          }
        });
      }
    });
  }

  // ============================================================
  // 🔹 NO VISIBLE ROWS (template helper)
  // ============================================================
  get noVisibleExpenses(): boolean {
    return this.expenses.length > 0 && this.expenses.every(e => !e.visible);
  }
}

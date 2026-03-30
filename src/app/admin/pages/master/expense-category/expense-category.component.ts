import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService, ExpenseCategory } from '../../../servies/admin.service';
@Component({
  selector: 'app-expense-category',
  standalone: false,
  templateUrl: './expense-category.component.html',
  styleUrl: './expense-category.component.css'
})
export class ExpenseCategoryComponent {
   filteredRegions: any[] = [];
companyId!: number;
  regionId!: number;

  companies: any[] = [];
  regions: any[] = [];
  userId: number = sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId') ) : 0;

  expense: ExpenseCategory = this.getEmptyExpenseCategory();
  expenseList: ExpenseCategory[] = [];
expenseCategoryID:any
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  currentPage = 1;
  pageSize = 5;
  sortColumn = 'expenseCategoryID';
  sortDirection: 'asc' | 'desc' = 'asc';

  showUploadPopup = false;
  constructor(private admin: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
     this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
    this.loadExpenseCategory();
    this.loadCompanies();
    this.loadRegions();
   
  }
onCompanyChange(): void {
  this.regionId = 0;

  if (!this.companyId) {
    this.filteredRegions = [];
    return;
  }

  this.filteredRegions = this.regions.filter(r =>
    Number(r.companyID) === Number(this.companyId)
  );
}
onRegionChange(): void {
  if (this.companyId && this.regionId) {
    this.loadExpenseCategory();
  }
}
   /* ------------------ Expense Category ------------------ */

  getEmptyExpenseCategory(): ExpenseCategory {
    return {
      expenseCategoryID: 0,
      expenseCategoryName: '',
      isActive: true,
      companyId: this.companyId,
      regionId: this.regionId,
      SortOrder: 0,
      Description: '',
      UserId: this.userId
       // ✅ MUST ADD THESE
        ,companyName: '',
        regionName: ''
    };
  }

  loadExpenseCategory(): void {
    this.spinner.show();

    this.admin.getexpensecategoryAll(this.userId).subscribe({
      next: res => {
        this.expenseList = res.data;
        this.spinner.hide();
        console.log(res);
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Expense Category.', 'error');
      }
    });
  }

  onSubmit(): void {
    debugger;
    this.spinner.show();

    this.expense.companyId = this.companyId;
    this.expense.regionId = this.regionId;
    this.expense.UserId = this.userId;

    const request = this.isEditMode
      ? this.admin.updateexpensecategory(this.expense)
      : this.admin.addexpenseCategory(this.expense);

    request.subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire(
          this.isEditMode ? 'Updated' : 'Created',
          `Expense Category ${this.isEditMode ? 'updated' : 'created'} successfully!`,
          'success'
        );
        this.loadExpenseCategory();
        this.resetForm();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Operation failed.', 'error');
      }
    });
  }
  editExpenseCategory(item: ExpenseCategory): void {
  debugger;

  // ✅ set form object
  this.expense = { ...item };

  // ✅ bind dropdown values (IMPORTANT)
  this.companyId = item.companyId;

  // ✅ load regions first
  this.onCompanyChange();

  // ✅ then set region
  this.regionId = item.regionId;

  this.isEditMode = true;

  console.log(item);
}

  // editExpenseCategory(item: ExpenseCategory): void {
  //   debugger;
  // //    // ✅ Bind dropdown values
  // // this.companyId = this.item.companyId;
  // // this.regionId = this.expense.RegionID;

  //   this.expense = { ...item };
  //   this.isEditMode = true;
  //   console.log(item);
  // }

  deleteExpenseCategory(item: ExpenseCategory): void {
  Swal.fire({
    title: `Delete "${item.expenseCategoryName}"?`,
    showCancelButton: true,
    confirmButtonText: 'Delete'
  }).then(result => {
    if (result.isConfirmed) {
      this.spinner.show();

      this.admin.deleteexpenseCategory(item.expenseCategoryID).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Deleted', 'Expense Category deleted successfully.', 'success');
          this.loadExpenseCategory();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Delete failed.', 'error');
        }
      });
    }
  });
}
  resetForm(): void {
    this.expense = this.getEmptyExpenseCategory();
    
  // ✅ reset dropdowns
  this.companyId = 0;
  this.regionId = 0;

  // ✅ clear regions list
  this.filteredRegions = [];
    this.isEditMode = false;
  }

  /* ------------------ Filtering / Paging ------------------ */

  filteredExpenseCategory(): ExpenseCategory[] {
    return this.expenseList.filter(c => {
      const matchSearch = c.expenseCategoryName
        .toLowerCase()
        .includes(this.searchText.toLowerCase());
      const matchStatus =
        this.statusFilter === '' || c.isActive === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  get pagedExpenseCategory(): ExpenseCategory[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredExpenseCategory().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredExpenseCategory().length / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  exportAs(type: 'excel' | 'pdf') {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel() {
    const data = this.expenseList.map(c => ({
      'Category Name': c.expenseCategoryName,
      'Active': c.isActive ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Expense Category');
    XLSX.writeFile(wb, 'ExpenseCategory.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();

    const data = this.expenseList.map(c => [
      c.expenseCategoryName,
      c.isActive ? 'Yes' : 'No'
    ]);

    autoTable(doc, {
      head: [['Category Name', 'Active']],
      body: data
    });

    doc.save('ExpenseCategory.pdf');
  }

  openUploadPopup() {
    this.showUploadPopup = true;
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
  }

  onBulkUploadComplete(data: any): void {
    if (!data || !data.length) {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
      return;
    }

    this.admin.bulkInsertData('ExpenseCategory', data).subscribe({
      next: () => {
        Swal.fire('Success', 'Expense Category uploaded successfully!', 'success');
        this.loadExpenseCategory();
        this.closeUploadPopup();
      },
      error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
    });
  }
sortTable(column: string): void {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
}
  loadCompanies(): void {
      this.admin.getCompanies(null,this.userId).subscribe({
        next: (res:any) => (this.companies = res),
        error: () => Swal.fire('Error', 'Failed to load companies.', 'error')
      });
    }
  
    loadRegions(): void {
      this.admin.getRegions(null,this.userId).subscribe({
        next: (res:any) => (this.regions = res),
        error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
      });
    }
}

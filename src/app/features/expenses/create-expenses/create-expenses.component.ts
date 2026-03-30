import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from '../../../../environments/environment.prod';
import Swal from 'sweetalert2';
import { ExpensesService } from '../expenses.service';

@Component({
  selector: 'app-create-expenses',
  standalone: false,
  templateUrl: './create-expenses.component.html',
  styleUrl: './create-expenses.component.css'
})
export class CreateExpensesComponent {
expenseForm!: FormGroup;

  userId!: number;
  companyId!: number;
  regionId!: number;
  departmentName!: string | null;

  selectedFile: File | null = null;
  categories: any[] = [];
  categoryLimit: any = null;

  myExpenses: any[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  pageSizeOptions = [5, 10, 20];

  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpensesService
  ) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem('UserId'));
    this.companyId = Number(sessionStorage.getItem('CompanyId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));
    this.departmentName = sessionStorage.getItem('DepartmentName');

    this.buildForm();
    this.loadCategories();
    this.loadMyExpenses();
  }

  buildForm(): void {
    this.expenseForm = this.fb.group({
      projectName: [
        '',
        [
          Validators.required,
          Validators.maxLength(150),
          Validators.pattern(/^[a-zA-Z0-9\s\-&/]+$/)
        ]
      ],
      location: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s]+$/)
        ]
      ],
      country: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s]+$/)
        ]
      ],
      expenseCategoryId: ['', Validators.required],
      departmentName: [this.departmentName],
      currencyCode: ['INR', Validators.required],
      amount: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ]
      ],
      expenseDate: ['', [Validators.required, this.noFutureDate]],
      reason: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500)
        ]
      ],
      receipt: ['', Validators.required]
    });
  }
  onCompanyOrRegionChange(): void {
  this.loadCategories();
  this.expenseForm.patchValue({ expenseCategoryId: '' }); 
}

  noFutureDate(control: AbstractControl) {
    if (!control.value) return null;
    const selected = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected > today ? { futureDate: true } : null;
  }

  loadCategories(): void {
  this.expenseService
    .getExpenseCategories(this.companyId, this.regionId)
    .subscribe(res => {
      if (res.success && res.data) {
        this.categories = res.data;
      }
    });
}

//   loadCategories(): void {
//     debugger;
//   this.expenseService.getExpenseCategories().subscribe(res => {
//     if (res.success && res.data) {
//       this.categories = res.data.filter(
//         (cat: any) =>
//           Number(cat.companyId) === this.companyId &&
//           Number(cat.regionId) === this.regionId
//       );
//     }
//   });
// }

  onCategoryChange(event: any): void {
    const categoryId = +event.target.value;
    if (!categoryId) {
      this.categoryLimit = null;
      return;
    }

    this.expenseService
      .getExpenseLimit(this.companyId, this.regionId, this.departmentName, categoryId)
      .subscribe(res => this.categoryLimit = res);
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, JPG, PNG files allowed');
      event.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      event.target.value = '';
      return;
    }

    this.selectedFile = file;
    this.expenseForm.patchValue({ receipt: file });
    this.expenseForm.get('receipt')?.updateValueAndValidity();
  }

  submitExpense(): void {
    // if (this.expenseForm.invalid) {
    //   this.expenseForm.markAllAsTouched();
    //   return;
    // }

    if (
      this.categoryLimit &&
      this.expenseForm.value.amount > this.categoryLimit.perTransactionLimit
    ) {
      alert('Amount exceeds allowed policy limit');
      return;
    }

    const formData = new FormData();
    Object.entries(this.expenseForm.value).forEach(([key, value]: any) => {
      if (value !== null) formData.append(key, value);
    });

    formData.append('UserId', this.userId.toString());
    formData.append('CompanyId', this.companyId.toString());
    formData.append('RegionId', this.regionId.toString());
    if (this.departmentName) {
      formData.append('departmentName', this.departmentName.toString());
    }
    formData.append('Receipt', this.selectedFile!);

    this.expenseService.createExpense(formData).subscribe(res => {
      Swal.fire("Created",res.message,'success');
      this.expenseForm.reset({
        departmentName: this.departmentName,
        currencyCode: 'INR'
      });
      this.selectedFile = null;
      this.loadMyExpenses();
    });
  }

  loadMyExpenses(): void {
    this.expenseService.getExpensesByUser(this.userId).subscribe(res => {
      if (res.success) {
        this.myExpenses = res.data;
        this.currentPage = 1;
        this.calculatePages();
      }
    });
  }

  get pagedExpenses(): any[] {
    let data = [...this.myExpenses];

    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = a[this.sortColumn!];
        const valB = b[this.sortColumn!];
        return this.sortDirection === 'asc'
          ? valA > valB ? 1 : -1
          : valA < valB ? 1 : -1;
      });
    }

    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  calculatePages(): void {
    this.totalPages = Math.ceil(this.myExpenses.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.calculatePages();
  }


viewReceipt(filePath: string | undefined): void {
  if (!filePath) {
    alert('No file path available.');
    return;
  }

  const fullPath = environment.apiUrl + filePath;
  const encodedUrl = encodeURI(fullPath);
  window.open(encodedUrl, '_blank');
}
}

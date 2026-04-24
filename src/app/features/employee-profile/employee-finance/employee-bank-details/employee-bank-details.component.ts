import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankDetails, AdminService } from '../../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-employee-bank-details',
  standalone: false,
  templateUrl: './employee-bank-details.component.html',
  styleUrl: './employee-bank-details.component.css'
})
export class EmployeeBankDetailsComponent {
 bankForm!: FormGroup;
  bankList: BankDetails[] = [];
  userId!: number;
  companyId = Number(sessionStorage.getItem("CompanyId"));
  regionId = Number(sessionStorage.getItem("RegionId"));
  accountTypes: any[] = [];

  employeeId = 123; // Replace with actual employee ID
  isAdmin: boolean = true; // Role-based display

  // ------------------ SORTING ------------------
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // ------------------ PAGINATION ------------------
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  // ------------------ FILTERING ------------------
  searchText: string = '';
  statusFilter: any = ''; // accountTypeId filter

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
    }
    this.initForm();
    this.loadBankDetails();
    this.loadAccountTypes();
  }

  /** Initialize Bank Form */
  initForm() {
    this.bankForm = this.fb.group({
      bankDetailsId: [0],
      employeeId: [this.employeeId],
      companyId: [this.companyId],
      regionId: [this.regionId],
      bankName: ['', [Validators.required, Validators.maxLength(100)]],
      branchName: ['', [Validators.required, Validators.maxLength(100)]],
      accountHolderName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/), Validators.maxLength(100)]],
      accountNumber: ['', [Validators.required, Validators.pattern(/^\d{9,20}$/)]],
      accountTypeId: [null, Validators.required],
      ifsccode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      micrcode: ['', [Validators.pattern(/^\d{0,9}$/)]],
      upiid: ['', [Validators.maxLength(100)]]
    });
  }
loadAccountTypes() {
  this.adminService.getAccountTypes(this.companyId, this.regionId)
    .subscribe({
      next: (res) => {
        console.log("API Response:", res);

        // 🔥 MAP API → UI FORMAT
        this.accountTypes = res.map((x: any) => ({
          id: x.accountTypeId,
          name: x.accountType1
        }));
      },
      error: () => {
        Swal.fire('Error', 'Failed to load account types', 'error');
      }
    });
}
  /** Load Bank Details */
  loadBankDetails() {
    if (!this.userId) {
    console.error("UserId missing");
    return;
  }

  this.adminService.getBankDetails(this.userId).subscribe({
    next: (res) => {
      console.log("My Bank Data:", res);
      this.bankList = res;
    },
    error: () => {
      Swal.fire('Error', 'Failed to load bank details', 'error');
    }
  });

  }

  /** Save / Update Bank Details */
  saveBankDetails() {
    // if (this.bankForm.invalid) {
    //   this.bankForm.markAllAsTouched();
    //   Swal.fire('Invalid', 'Please fill all required fields correctly', 'warning');
    //   return;
    // }

    const payload = {
      ...this.bankForm.value,
      companyId: this.companyId,
      regionId: this.regionId,
      userId: this.userId
    };

    const id = Number(this.bankForm.get("bankDetailsId")?.value);

    if (id > 0) {
      // UPDATE
      this.adminService.updateBankDetail(payload).subscribe({
        next: () => {
          this.loadBankDetails();
          this.resetForm();
          Swal.fire('Updated', 'Bank details updated successfully', 'success');
        },
        error: (err) => Swal.fire('Error', 'Failed to update bank details', 'error')
      });
    } else {
      // CREATE
      this.adminService.createBankDetail(payload).subscribe({
        next: () => {
          this.loadBankDetails();
          this.resetForm();
          Swal.fire('Saved', 'Bank details saved successfully', 'success');
        },
        error: (err) => Swal.fire('Error', 'Failed to save bank details', 'error')
      });
    }
  }

  /** Reset Form */
  resetForm() {
    this.bankForm.reset({
      bankDetailsId: 0,
      employeeId: this.employeeId,
      companyId: this.companyId,
      regionId: this.regionId,
      bankName: '',
      branchName: '',
      accountHolderName: '',
      accountNumber: '',
      accountTypeId: null,
      ifsccode: '',
      micrcode: '',
      upiid: ''
    });
  }

  /** Edit Bank Record */
  editBank(index: number) {
    const bank = this.bankList[index];
    this.bankForm.patchValue(bank);
  }

  /** Delete Bank Record with confirmation */
  deleteBank(index: number) {
    const bank = this.bankList[index];
    Swal.fire({
      title: `Delete ${bank.bankName}?`,
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteBankDetail(bank.bankDetailsId).subscribe({
          next: () => {
            this.loadBankDetails();
            Swal.fire('Deleted!', 'Bank details deleted successfully.', 'success');
          },
          error: (err) => Swal.fire('Error', 'Failed to delete bank details', 'error')
        });
      }
    });
  }

  /** Get Account Type Name */
  getAccountTypeName(id: number | undefined) {
    const type = this.accountTypes.find(t => t.id === id);
    return type ? type.name : '';
  }

  /** Mask Account Number for security */
  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber) return '';
    const len = accountNumber.length;
    if (len <= 4) return accountNumber;
    return 'X'.repeat(len - 4) + accountNumber.slice(len - 4);
  }

  // ------------------ SORTING + FILTERING + PAGINATION ------------------
  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  filteredBanks(): BankDetails[] {
    let data = [...this.bankList];

    // Search filter
    if (this.searchText) {
      const s = this.searchText.toLowerCase();
      data = data.filter(b => 
        (b.bankName?.toLowerCase().includes(s)) ||
        (b.branchName?.toLowerCase().includes(s)) ||
        (b.accountHolderName?.toLowerCase().includes(s))
      );
    }

    // Account Type filter
    if (this.statusFilter) {
      data = data.filter(b => b.accountTypeId == this.statusFilter);
    }

    // Sorting
    if (this.sortColumn) {
      data.sort((a, b) => {
        let valA = a[this.sortColumn as keyof BankDetails];
        let valB = b[this.sortColumn as keyof BankDetails];
        valA = valA ?? '';
        valB = valB ?? '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    this.totalPages = Math.ceil(data.length / this.pageSize);

    // Reset currentPage if it exceeds totalPages after filtering
    if (this.currentPage > this.totalPages) this.currentPage = 1;

    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }
}

import { Component } from '@angular/core';
import { AdminService,EmployeeJobHistoryDto } from '../../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { env } from 'node:process';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-employee-jobhistory',
  standalone: false,
  templateUrl: './employee-jobhistory.component.html',
  styleUrl: './employee-jobhistory.component.css'
})
export class EmployeeJobhistoryComponent {
   canCreate: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
 jobHistoryForm!: FormGroup;
  jobHistoryList: EmployeeJobHistoryDto[] = [];
  selectedFile: File | null = null;
  employeeName:any;
  employeeCode:any;
  userId!: number;
  companyId!: number;
  regionId!: number;

  editMode = false;
  editId: number | null = null;

  // Sorting
  sortColumn: keyof EmployeeJobHistoryDto | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50, 100];

  // Search
  searchText = '';

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
  this.loadPermission();
    this.initializeForm();
    this.loadJobHistory();
    this.employeeName = sessionStorage.getItem("Name");
    this.employeeCode = sessionStorage.getItem("EmployeeCode");
   //  this.jobHistoryForm.get('employer')?.setValue(this.employeeName);
 // this.jobHistoryForm.get('employer')?.disable();
    //this.jobHistoryForm.get('employeeCode')?.setValue(this.employeeCode);
  //this.jobHistoryForm.get('employeeCode')?.disable();
    }

initializeForm() {
  this.jobHistoryForm = this.fb.group({
    employer: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/^[a-zA-Z0-9 &\-.]+$/)]],
    jobTitle: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9 /\-]+$/)]],
    employeeCode: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9\/\-]+$/)]],
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required],
    lastCTC: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    website: ['', [Validators.maxLength(150), Validators.pattern(/https?:\/\/.+/)]],
    reasonForLeaving: ['', [Validators.required, Validators.maxLength(500)]],
    uploadDocument: ['']
  }, { validators: this.dateRangeValidator });

  this.fileError = '';
}

// Custom validator for date range
dateRangeValidator: ValidatorFn = (group: AbstractControl) => {
  const from = group.get('fromDate')?.value;
  const to = group.get('toDate')?.value;
  return from && to && new Date(from) > new Date(to) ? { dateRange: true } : null;
};

// File validation
fileError: string = '';

onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.fileError = 'Only PDF, JPG, PNG files are allowed';
      this.selectedFile = null;
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.fileError = 'File size cannot exceed 5 MB';
      this.selectedFile = null;
      return;
    }
    this.fileError = '';
    this.selectedFile = file;
  }
}


  loadJobHistory() {
    this.adminService.getJobHistoryByEmployeeId(this.userId).subscribe({
      next: (res) => this.jobHistoryList = res,
      error: (err) => console.error(err)
    });
  }



    // -------------------- FORM SUBMISSION --------------------
  onSubmit() {
    // Check form validity
    if (this.jobHistoryForm.invalid) {
      this.jobHistoryForm.markAllAsTouched();
      return;
    }

    // Date validation
    const fromDate = new Date(this.jobHistoryForm.value.fromDate);
    const toDate = new Date(this.jobHistoryForm.value.toDate);
    if (fromDate > toDate) {
      this.jobHistoryForm.setErrors({ dateRange: true });
      return;
    }

    const formValues = this.jobHistoryForm.value;
    formValues.employeeCode = this.employeeCode;
    formValues.employer = this.employeeName;
    const payload: any = {
      Id: this.editId ?? 0,
      Employer: formValues.employer,
      JobTitle: formValues.jobTitle,
      EmployeeCode: formValues.employeeCode,
      FromDate: formValues.fromDate,
      ToDate: formValues.toDate,
      LastCTC: formValues.lastCTC,
      Website: formValues.website,
      ReasonForLeaving: formValues.reasonForLeaving,
      CompanyId: this.companyId,
      RegionId: this.regionId,
      UserId: this.userId
    };
  
    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));

    if (this.selectedFile) formData.append("UploadDocument", this.selectedFile);

    if (this.editMode && this.editId) {
      this.adminService.updateJobHistory(this.editId, payload).subscribe({
        next: () => {
          Swal.fire("Success", "Job History Updated Successfully", "success");
          this.resetForm();
          this.loadJobHistory();
        }
      });
    } else {
      this.adminService.addJobHistory(formData).subscribe({
        next: () => {
          Swal.fire("Success", "Job History Added Successfully", "success");
          this.resetForm();
          this.loadJobHistory();
        }
      });
    }
  }


  edit(item: EmployeeJobHistoryDto) {
    this.editMode = true;
    this.editId = item.id;

    this.jobHistoryForm.patchValue({
      employer: item.employer,
      jobTitle: item.jobTitle,
      employeeCode: item.employeeCode,
      fromDate: item.fromDate,
      toDate: item.toDate,
      lastCTC: item.lastCTC,
      website: item.website,
      reasonForLeaving: item.reasonForLeaving
    });
    this.selectedFile = null;
  }

  delete(id: number) {
     if (!this.canDelete) {
    Swal.fire("You don't have permission to delete this record", "", "warning");
    return;
  }
    Swal.fire({
      title: "Are you sure?",
      text: "You cannot undo this action.",
      icon: "warning",
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteJobHistory(id).subscribe({
          next: () => {
            Swal.fire("Deleted!", "Record deleted successfully", "success");
            this.loadJobHistory();
          }
        });
      }
    });
  }

  resetForm() {
    this.jobHistoryForm.reset();
    this.selectedFile = null;
    this.editMode = false;
    this.editId = null;
  }

  // ====== SORTING ======
  sortBy(column: keyof EmployeeJobHistoryDto) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortedJobHistory(): EmployeeJobHistoryDto[] {
    let data = [...this.jobHistoryList];
    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = a[this.sortColumn!] ?? '';
        const valB = b[this.sortColumn!] ?? '';
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }

  // ====== FILTER + PAGINATION ======
  filteredJobHistory(): EmployeeJobHistoryDto[] {
    const data = this.getSortedJobHistory().filter(item =>
      item.employer?.toLowerCase().includes(this.searchText.toLowerCase())
    );
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(
      this.getSortedJobHistory().filter(item =>
        item.employer?.toLowerCase().includes(this.searchText.toLowerCase())
      ).length / this.pageSize
    );
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  // ====== DOCUMENT VIEW / DOWNLOAD ======
 viewDocument(documentPath: string, download = false) {
  this.adminService.ViewDocument(documentPath, download);
}
    loadPermission() {
  debugger;

  const userId = Number(sessionStorage.getItem("UserId"));

  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const familyMenu = menus.find((m: any) => m.menuName === "Job History");

  const menuId = familyMenu ? familyMenu.menuId : 0;
    if (familyMenu) {
    this.canCreate = familyMenu.canAdd;
     this.canEdit = familyMenu.canEdit;
     this.canDelete = familyMenu.canDelete;
  //   this.canView = familyMenu.canView;
   }

  console.log("UserId:", userId);
  console.log("MenuId:", menuId);

  this.adminService.getPermission(userId, menuId, 'create').subscribe({
    next: (res: boolean) => {
      console.log("Create Permission:", res);
      this.canCreate = res;
    },
    error: (err) => {
      console.error("Permission API error:", err);
      this.canCreate = false;
    }
  });
}
  
}

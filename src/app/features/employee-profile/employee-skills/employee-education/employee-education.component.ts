import { Component,ViewChild,ElementRef } from '@angular/core';
import { AdminService, EmployeeEducationDto } from '../../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
@Component({
  selector: 'app-employee-education',
  standalone: false,
  templateUrl: './employee-education.component.html',
  styleUrl: './employee-education.component.css'
})
export class EmployeeEducationComponent {

   canCreate: boolean = false;
   canEdit: boolean = false;
   canDelete: boolean = false;
  educationForm!: FormGroup;
  educationList: EmployeeEducationDto[] = [];
  selectedFile: File | null = null;
@ViewChild('certificateFileInput')
certificateFileInput!: ElementRef<HTMLInputElement>;
  userId!: number;
  companyId!: number;
  regionId!: number;

  editMode = false;
  editId: number | null = null;

  // Sorting
  sortColumn: keyof EmployeeEducationDto | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // Search
  searchText = '';

  modeOfStudyList: any[] = [];
  fileError = '';

  // show errors after submit
  submitted = false;

  // patterns
  qualificationPattern = /^[A-Za-z0-9 .\-]{1,100}$/;
  specializationPattern = /^[A-Za-z0-9 .,\-()]{1,100}$/;
  institutionPattern = /^[A-Za-z0-9 &\-\.\,()]{1,150}$/;
  resultPattern = /^[A-Za-z0-9 .%+-]{1,20}$/;

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
 this.loadPermission();
    this.initializeForm();
    this.loadEducation();
    this.loadModeOfStudy();
  }

  initializeForm() {
    this.educationForm = this.fb.group({
      qualification: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(this.qualificationPattern)]],
      specialization: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(this.specializationPattern)]],
      institution: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(this.institutionPattern)]],
      board: ['', [Validators.maxLength(100)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      result: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(this.resultPattern)]],
      modeOfStudyId: ['', Validators.required],
      certificateFile: [''] // we'll set required dynamically when needed
    }, { validators: this.dateRangeValidator });
  }

  // helper to access controls in template
  get f() { return this.educationForm.controls; }

  // Custom date validator
  dateRangeValidator: ValidatorFn = (group: AbstractControl) => {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    return start && end && new Date(start) > new Date(end) ? { dateRange: true } : null;
  };

  // File selection handler
  onFileChange(event: any) {
    const file = event.target.files?.[0] ?? null;
    this.selectedFile = null;
    this.fileError = '';
    const fileControl = this.educationForm.get('certificateFile');

    if (!file) {
      // clear file control
      fileControl?.setValue('');
      fileControl?.setErrors(null);
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.fileError = 'Only PDF, JPG, PNG files are allowed';
      this.selectedFile = null;
      fileControl?.setErrors({ invalidType: true });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.fileError = 'File size cannot exceed 5 MB';
      this.selectedFile = null;
      fileControl?.setErrors({ maxSize: true });
      return;
    }

    // valid file
    this.selectedFile = file;
    fileControl?.setValue(file.name);
    fileControl?.setErrors(null);
  }

  loadModeOfStudy() {
  if (!this.companyId || !this.regionId) {
    this.modeOfStudyList = [];
    return;
  }

  this.adminService.getModeOfStudy(this.companyId, this.regionId).subscribe({
    next: res => {
      this.modeOfStudyList = res;
    },
    error: err => {
      console.error(err);
      this.modeOfStudyList = [];
    }
  });
}

  public onFilterChange(): void {
    this.currentPage = 1;
  }

  loadEducation() {
    const userId = Number(sessionStorage.getItem('UserId'));

    if (!userId) {
      console.error("User ID missing.");
      return;
    }

    this.adminService.getEducationByUserId(userId).subscribe({
      next: (res) => {
        this.educationList = res;
      },
      error: (err) => {
        console.error("Error loading education:", err);
      }
    });
  }

  onSubmit() {
    this.submitted = true;

    // dynamic file required: if adding (not editMode) require a file
    const fileControl = this.educationForm.get('certificateFile');
    if (!this.editMode && !this.selectedFile) {
      this.fileError = 'Certificate is required';
      fileControl?.setErrors({ required: true });
    } else {
      // if file exists or in editMode then clear required
      if (fileControl?.hasError('required')) fileControl.setErrors(null);
    }

    if (this.educationForm.invalid) {
      this.educationForm.markAllAsTouched();
      return;
    }

    // additional date check (already handled by validator, but keep)
    const startDate = new Date(this.educationForm.value.startDate);
    const endDate = new Date(this.educationForm.value.endDate);
    if (startDate > endDate) {
      this.educationForm.setErrors({ dateRange: true });
      return;
    }

    const payload: any = {
      EducationId: this.editId ?? 0,
      Qualification: this.educationForm.value.qualification,
      Specialization: this.educationForm.value.specialization,
      Institution: this.educationForm.value.institution,
      Board: this.educationForm.value.board,
      StartDate: this.educationForm.value.startDate,
      EndDate: this.educationForm.value.endDate,
      Result: this.educationForm.value.result,
      ModeOfStudyId: this.educationForm.value.modeOfStudyId,
      CompanyId: this.companyId,
      RegionId: this.regionId,
      UserId: this.userId
    };

    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));
    if (this.selectedFile) formData.append("CertificateFile", this.selectedFile);

    if (this.editMode && this.editId) {
      this.adminService.updateEducation(this.editId, formData).subscribe({
        next: () => {
          this.certificateFileInput.nativeElement.value = '';
          Swal.fire("Success", "Education Updated Successfully", "success");
          this.resetForm();
          this.loadEducation();
        },
        error: err => console.error(err)
      });
    } else {
      this.adminService.addEducation(formData).subscribe({
        next: () => {
           this.certificateFileInput.nativeElement.value = '';
          Swal.fire("Success", "Education Added Successfully", "success");
          this.resetForm();
          this.loadEducation();
        },
        error: err => console.error(err)
      });
    }
  }

  edit(item: EmployeeEducationDto) {
    this.editMode = true;
    this.editId = item.educationId;

    this.educationForm.patchValue({
      qualification: item.qualification,
      specialization: item.specialization,
      institution: item.institution,
      board: item.board,
      startDate: item.startDate,
      endDate: item.endDate,
      result: item.result,
      modeOfStudyId: item.modeOfStudyId,
      certificateFile: item.certificateFilePath ? item.certificateFilePath.split('/').pop() : ''
    });

    this.selectedFile = null;
    this.fileError = '';
    this.submitted = false;
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
        this.adminService.deleteEducation(id).subscribe({
          next: () => {
            Swal.fire("Deleted!", "Record deleted successfully", "success");
            this.loadEducation();
          },
          error: err => console.error(err)
        });
      }
    });
  }

  resetForm() {
    this.educationForm.reset();
    this.selectedFile = null;
    this.editMode = false;
    this.editId = null;
    this.fileError = '';
    this.submitted = false;
  
    
    // clear validators status
    Object.keys(this.educationForm.controls).forEach(k => this.educationForm.get(k)?.setErrors(null));
  }

  viewDocument(path: string,download = false) {
    this.adminService.ViewDocument(path, download);
  }

  // Sorting/Filtering/Pagination stay unchanged...
  filteredEducation(): EmployeeEducationDto[] {
    let filtered = this.educationList;

    if (this.searchText) {
      const text = this.searchText.toLowerCase();
      filtered = filtered.filter(e =>
        e.qualification.toLowerCase().includes(text) ||
        e.specialization.toLowerCase().includes(text) ||
        e.institution.toLowerCase().includes(text)
      );
    }

    if (this.sortColumn) {
      filtered.sort((a, b) => {
        const valA = (a[this.sortColumn!] ?? '').toString().toLowerCase();
        const valB = (b[this.sortColumn!] ?? '').toString().toLowerCase();
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }
  sortBy(column: keyof EmployeeEducationDto) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  get totalPages(): number {
    const filteredLength = this.educationList.filter(e => {
      const text = this.searchText.toLowerCase();
      return !this.searchText || e.qualification.toLowerCase().includes(text) ||
             e.specialization.toLowerCase().includes(text) ||
             e.institution.toLowerCase().includes(text);
    }).length;
    return Math.ceil(filteredLength / this.pageSize);
  }
    loadPermission() {
  debugger;

  const userId = Number(sessionStorage.getItem("UserId"));

  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const familyMenu = menus.find((m: any) => m.menuName === "Education");

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

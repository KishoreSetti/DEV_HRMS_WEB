import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { EmployeeResignationService,ShiftAllocationDto,ShiftMasterDto,UserReadDto } from '../../employee-profile/employee-services/employee-resignation.service';
import { formatDate } from '@angular/common';
import Swal from 'sweetalert2';
import { AdminService } from '../../../admin/servies/admin.service';
@Component({
  selector: 'app-shift-allocation',
  standalone: false,
  templateUrl: './shift-allocation.component.html',
  styleUrl: './shift-allocation.component.css'
})
export class ShiftAllocationComponent {
  userId: number=sessionStorage.getItem("UserId") ? Number(sessionStorage.getItem("UserId")) : 0;
 shiftForm!: FormGroup;
  employees: UserReadDto[] = [];
  shifts: ShiftMasterDto[] = [];
  allocations: ShiftAllocationDto[] = [];

  editMode = false;
  editId: number | null = null;

  todayStr = '';
loading = false;
  
  currentUserId: number = 0;
  currentUserCompanyId: number = 0;
  currentUserRegionId: number = 0;
  startDateValidator(control: AbstractControl): ValidationErrors | null {
    return null;
  }

  // Validator for End Date
  endDateValidator(control: AbstractControl): ValidationErrors | null {
  const startDate = this.shiftForm?.get('startDate')?.value;
  if (!control.value || !startDate) return null;
  const start = new Date(startDate);
  const end = new Date(control.value);
  return end < start ? { endDateInvalid: true } : null;
}

  constructor(private fb: FormBuilder,private adminSvc: AdminService, private svc: EmployeeResignationService) {
    this.todayStr = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');

    this.currentUserId = +(sessionStorage.getItem('UserId') || '0');
    this.currentUserCompanyId = +(sessionStorage.getItem('CompanyId') || '0');
    this.currentUserRegionId = +(sessionStorage.getItem('RegionId') || '0');
  }

  ngOnInit(): void {
    this.currentUserId = Number(sessionStorage.getItem('UserId') || 0);
    this.currentUserCompanyId = Number(sessionStorage.getItem('CompanyId') || 0);
    this.currentUserRegionId = Number(sessionStorage.getItem('RegionId') || 0);
    this.initForm();
    this.shiftForm.get('startDate')?.valueChanges.subscribe(val => {
    const endInput = document.querySelector<HTMLInputElement>('input[formControlName="endDate"]');
    if (endInput) {
      endInput.min = val; // End Date cannot be before Start Date
    }
  });
    this.loadLookups();
    //this.getallShifts();
    this.loadShifts();
    this.loadAllocations();
   
  }

  initForm() {
    this.shiftForm = this.fb.group({
      userId: ['', Validators.required],
      employeeCode: [{ value: '', disabled: true }, Validators.required],
      shiftID: ['', Validators.required],
      startDate: ['', [Validators.required, this.startDateValidator.bind(this)]],
      endDate: ['', [Validators.required, this.endDateValidator.bind(this)]],
      isActive: [true]
    });
  }

  loadLookups() {
    this.adminSvc.GetcmpregAllUsers().subscribe(
      (r:any) => {
        this.employees = r.map((u:any) => ({
          companyID: u.companyId || 0,
          regionID: u.regionId || 0,
          userId:  u.userId || 0,
          employeeCode: u.employeeCode || '',
          fullName: u.fullName || '',
          email: u.email || '',
          status: u.status || '',
          roleName: (u.roleId !== undefined && u.roleId !== null) ? u.roleId.toString() : ''
        }));
      }, 
      (err:any) => {
        console.error('Error loading users:', err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to load employees. Please try again'
        });
      }
    );

    
  }
  loadShifts() {
  const companyId = Number(sessionStorage.getItem('CompanyId') || 0);
  const regionId = Number(sessionStorage.getItem('RegionId') || 0);

  if (!companyId || !regionId) {
    Swal.fire('Error', 'Company or Region not found', 'error');
    return;
  }

  this.adminSvc.getShiftsForDropdown(companyId, regionId).subscribe({
    next: (res:any) => this.shifts = res,
    error: () => Swal.fire('Error', 'Failed to load shifts', 'error')
  });
}
  getallShifts(){
    debugger;
    this.svc.getAllShifts().subscribe(
      (r:any) => this.shifts = r, 
      (err:any) => console.error('Error loading shifts:', err)
    );
    
  }

  loadAllocations() {
    this.loading = true;
    console.log('Loading allocations for userId:', this.currentUserId);
    this.svc.getAllAllocations(this.currentUserId).subscribe(
      (r:any) => {
        console.log('API Response - allocations:', r);
       this.allocations = (r || []).slice().sort((a: any, b: any) => {
  return (b.shiftAllocationId || 0) - (a.shiftAllocationId || 0);
});
        this.loading = false;
        console.log('Loaded allocations:', this.allocations.length, 'records');
      }, 
      (err:any) => {
        console.error('Error loading allocations:', err);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to load shift allocations'
        });
      }
    );
  }

  onEmployeeChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  const userId = Number(select.value);
  if (!userId) {
    this.shiftForm.patchValue({ employeeCode: '' });
    return;
  }

  const user = this.employees.find(e => e.userId === userId);
  if (user) {
    this.shiftForm.patchValue({
      employeeCode: user.employeeCode
    });
  }
}

  validateDatesAndOverlap(dtoCandidate: ShiftAllocationDto): { ok: boolean; message?: string } {
    const start = dtoCandidate.startDate ? new Date(dtoCandidate.startDate) : null;
    const end = dtoCandidate.endDate ? new Date(dtoCandidate.endDate) : null;

    if (!start) return { ok: false, message: 'Start Date is required' };
    if (!end) return { ok: false, message: 'End Date is required' };
    if (end < start) return { ok: false, message: 'End date must be same or after Start date' };

    // Check for overlapping dates for the same user
    const sameUserAllocs = this.allocations.filter(a => 
      a.userID === dtoCandidate.userID && 
      (this.editMode ? a.shiftAllocationId !== this.editId : true)
    );

    for (const a of sameUserAllocs) {
      const aStart = a.startDate ? new Date(a.startDate) : null;
      const aEnd = a.endDate ? new Date(a.endDate) : null;
      
      if (aStart && aEnd && this.datesOverlap(aStart, aEnd, start, end)) {
        return { 
          ok: false, 
          message: `Date range overlaps with existing allocation (${a.shiftName}) from ${this.formatDate(aStart)} to ${this.formatDate(aEnd)}` 
        };
      }
    }
    return { ok: true };
  }

  // Check if two date ranges overlap
  datesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return aStart <= bEnd && bStart <= aEnd;
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onSubmit() {
    debugger;

    if (this.loading) return;

    if (this.shiftForm.invalid) {
      this.shiftForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please fill all required fields'
      });
      return;
    }
    
    const raw = this.shiftForm.getRawValue();
    const selectedUserId = +raw.userId;

    const selectedEmployee = this.employees.find(e => e.userId === selectedUserId);

    if (!selectedEmployee) {
        this.loading = false;
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Selected employee not found'
      });
      return;
    }

    const createdByUserId = this.currentUserId;

    if (!createdByUserId || createdByUserId === 0) {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'User session not found. Please login again.'
      });
      return;
    }

    const dto: ShiftAllocationDto = {
      shiftAllocationId: this.editMode && this.editId ? this.editId : 0,
      userID: selectedUserId,      
      employeeCode: selectedEmployee.employeeCode || '',
      fullName: selectedEmployee.fullName || '',
      companyID: selectedEmployee.companyID || 0,
      regionID: selectedEmployee.regionID || 0,
      shiftID: +raw.shiftID,
      shiftName: this.shifts.find(s => s.shiftID === +raw.shiftID)?.shiftName || '',
      startDate: raw.startDate,
      endDate: raw.endDate || null,
      isActive: raw.isActive,
      createdBy: createdByUserId, 
      createdDate: new Date().toISOString() 
    };

    // Frontend validation to prevent duplicates
    const validation = this.validateDatesAndOverlap(dto);
    if (!validation.ok) {
      this.loading = false;
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate Error',
        text: validation.message
      });
      return;
    }

    if (!this.editMode) {
      this.svc.allocateShift(dto).subscribe({
        next: (response: any) => {
          debugger;
          // Backend returns false if duplicate exists
          if (response === false) {
            this.loading = false;
            Swal.fire({
              icon: 'warning',
              title: 'Duplicate Entry',
              text: 'This shift allocation already exists for the selected employee with the same dates'
            });
            return;
          }
          Swal.fire({
            
            icon: 'success',
            title: 'Success!',
            text: 'Shift assigned successfully',
            timer: 2000,
            showConfirmButton: false
          });
          this.loading = false;
          this.resetForm();
          this.loadAllocations();
        },
        error: (err:any) => {
          console.error('Create Error:', err);
          let msg = 'Failed to create allocation';
          if (typeof err?.error === 'string') {
            msg = err.error;
          } else if (err?.error?.message) {
            msg = err.error.message;
          } else if (err?.error) {
            msg = JSON.stringify(err.error);
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: msg
          });
          this.loading = false;
          this.loadAllocations();
        }
      });
      return;
    }

    if (!this.editId) {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Cannot update: No allocation ID found'
      });
      return;
    }

    this.svc.updateAllocation(dto).subscribe({
      next: () => {
          this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Allocation updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
        this.resetForm();
        this.loadAllocations();
      },
      error: (err:any) => {
        console.error('Update Error:', err);
        this.loading = false;
        if (err.status === 200 || err.status === 204) {
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Allocation updated successfully',
            timer: 2000,
            showConfirmButton: false
          });
          this.resetForm();
          this.loadAllocations();
          return;
        }
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to update allocation'
        });
      }
    });
  }

  onEdit(a: ShiftAllocationDto) {
    this.editMode = true;
    this.editId = a.shiftAllocationId || null;
    const isActive = this.getStatus(a) === 'Active';

    this.shiftForm.patchValue({
      userId: a.userID,
      employeeCode: a.employeeCode,
      shiftID: a.shiftID,
      startDate: a.startDate ? (a.startDate as string).split('T')[0] : '',
      endDate: a.endDate ? (a.endDate as string).split('T')[0] : '',
      isActive: a.isActive
    });
  }
onDelete(id?: number) {
  if (!id || id === 0) return;

  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel!',
  }).then((result) => {
    if (result.isConfirmed) {
      this.svc.deleteAllocation(id).subscribe({
        next: (res:any) => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Shift deleted successfully',
            timer: 1500,
            showConfirmButton: false
          });
          // reload allocations after delete
          this.loadAllocations();
        },
        error: (err:any) => {
          console.error('Delete API error:', err);
          // handle if backend sends 204
          if (err.status === 204 || err.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Shift deleted successfully',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadAllocations();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: 'Delete failed'
            });
          }
        }
      });
    }
  });
}


  resetForm() {
    this.editMode = false;
    this.editId = null;
    this.shiftForm.reset({ isActive: true });
  }

 getStatus(a: ShiftAllocationDto): 'Active' | 'Inactive' {

  if (!a.isActive) return 'Inactive';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = a.startDate ? new Date(a.startDate) : null;
  const end = a.endDate ? new Date(a.endDate) : null;

  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(0, 0, 0, 0);

  return (start && start <= today && (!end || end >= today))
    ? 'Active'
    : 'Inactive';
}
}
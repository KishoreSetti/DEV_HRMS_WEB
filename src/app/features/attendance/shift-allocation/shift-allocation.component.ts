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
  loading = true;
  
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
      endDate: ['', this.endDateValidator.bind(this)],
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

  const companyId = Number(sessionStorage.getItem('CompanyId') || 0);
  const regionId = Number(sessionStorage.getItem('RegionId') || 0);

  if (!companyId || !regionId) {
    this.loading = false;
    Swal.fire('Error', 'Company or Region not found', 'error');
    return;
  }

  this.svc.getAllocationsByCompanyRegion(companyId, regionId).subscribe({
    next: (r: any) => {
      this.allocations = (r || []).slice().sort((a: any, b: any) => {
        const da = a.startDate ? new Date(a.startDate).getTime() : 0;
        const db = b.startDate ? new Date(b.startDate).getTime() : 0;
        return db - da;
      });

      this.loading = false;
      console.log('Loaded allocations:', this.allocations);
    },
    error: (err: any) => {
      console.error('Error loading allocations:', err);
      this.loading = false;

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to load shift allocations'
      });
    }
  });
}
get availableEmployees() {
  return this.employees.filter(emp => {
    return !this.allocations.some(a => 
      a.userID === emp.userId && this.getStatus(a) === 'Active'
    );
  });
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
    const today = new Date(this.todayStr);

    if (!start) return { ok: false, message: 'Start Date is required' };
    if (start < today) return { ok: false, message: 'Start date cannot be earlier than today' };
    if (end && end < start) return { ok: false, message: 'End date must be same or after Start date' };

    const sameUserAllocs = this.allocations.filter(a => 
      a.userID === dtoCandidate.userID && 
      (this.editMode ? a.shiftAllocationId !== this.editId : true)
    );

    for (const a of sameUserAllocs) {
      const aStart = a.startDate ? new Date(a.startDate) : null;
      const aEnd = a.endDate ? new Date(a.endDate) : null;
      const overlaps = this.rangesOverlap(aStart, aEnd, start!, end || null);
      if (overlaps) {
        return { 
          ok: false, 
          message: `Overlaps with existing assignment (${a.shiftName || 'Shift'}) from ${aStart ? formatDate(aStart,'yyyy-MM-dd','en-US') : 'N/A'} to ${aEnd ? formatDate(aEnd,'yyyy-MM-dd','en-US') : 'Ongoing'}` 
        };
      }
    }
    return { ok: true };
  }

  rangesOverlap(aStart: Date | null, aEnd: Date | null, bStart: Date, bEnd: Date | null): boolean {
    const aS = aStart ? aStart.getTime() : Number.MIN_SAFE_INTEGER;
    const aE = aEnd ? aEnd.getTime() : Number.MAX_SAFE_INTEGER;
    const bS = bStart ? bStart.getTime() : Number.MIN_SAFE_INTEGER;
    const bE = bEnd ? bEnd.getTime() : Number.MAX_SAFE_INTEGER;
    return (aS <= bE && bS <= aE);
  }

  onSubmit() {
    debugger;
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
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Selected employee not found'
      });
      return;
    }

    const createdByUserId = this.currentUserId;

    if (!createdByUserId || createdByUserId === 0) {
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

    // const check = this.validateDatesAndOverlap(dto);
    // if (!check.ok) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Overlap Detected',
    //     text: check.message
    //   });
    //   return;
    // }

    if (!this.editMode) {
      this.svc.allocateShift(dto).subscribe({
        next: () => {
          debugger;
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Shift assigned successfully',
            timer: 2000,
            showConfirmButton: false
          });
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
          this.loadAllocations();
        }
      });
      return;
    }

    if (!this.editId) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Cannot update: No allocation ID found'
      });
      return;
    }

    this.svc.updateAllocation(dto).subscribe({
      next: () => {
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
      userId: isActive ? null : a.userID,
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
    const today = new Date(this.todayStr);
    const s = a.startDate ? new Date(a.startDate) : null;
    const e = a.endDate ? new Date(a.endDate) : null;
    return (s && s <= today && (!e || e >= today)) ? 'Active' : 'Inactive';
  }
}

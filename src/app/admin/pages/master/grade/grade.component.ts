import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../servies/admin.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-grade',
  standalone: false,
  templateUrl: './grade.component.html',
  styleUrl: './grade.component.css'
})
export class GradeComponent {
  gradeForm!: FormGroup;
companyMap: { [key: number]: string } = {};
regionMap: { [key: number]: string } = {};
  grades: any[] = [];
  companies: any[] = [];
  regions: any[] = [];

  isEdit = false;
  editId: number = 0;
currentUser: any = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

userId: number = this.currentUser.userId;
companyId: number = this.currentUser.companyId;
companyName: string = this.currentUser.companyName;
regionId: number = this.currentUser.regionId;

  constructor(
    private fb: FormBuilder,
    private service: AdminService
  ) {
    currentUser:JSON.parse(sessionStorage.getItem('currentUser') || '{}');

userId:  this.currentUser.userId;
companyId:  this.currentUser.companyId;
companyName: this.currentUser.companyName;
regionId:  this.currentUser.regionId;

this.service.getGrades(this.companyId)
    .subscribe({
      next: (res: any) => {
        this.grades = res.data || res;
      },
      error: () => {
        Swal.fire('Error', 'Failed to load grades', 'error');
      }
    });  }

loadRegionsByCompany(companyId: number) {
  this.service.getRegions(companyId, this.userId).subscribe({
    next: (res: any[]) => {
      this.regions = res;
    },
    error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
  });
}

ngOnInit(): void {

  this.initForm();
  // Disable initially
  this.gradeForm.get('regionId')?.disable();
  this.gradeForm.get('gradeName')?.disable();
debugger;
  // ✅ SET COMPANY ID (hidden usage)
  this.gradeForm.patchValue({
    companyID: this.companyId
  });

  // ✅ Load regions directly
  if (this.companyId) {
    this.loadRegionsByCompany(this.companyId);
    this.gradeForm.get('regionId')?.enable();
  }

  // 🔥 Region change
  this.gradeForm.get('regionId')?.valueChanges.subscribe(regionId => {

    if (regionId) {
      this.gradeForm.get('gradeName')?.enable();
    } else {
      this.gradeForm.get('gradeName')?.disable();
    }
  });
}
  initForm() {
    this.gradeForm = this.fb.group({
      gradeID: [0],
      gradeName: ['', Validators.required],
      companyID: [this.companyId, Validators.required],
      regionId: ['', Validators.required],
      isActive: [true]
    });
  }
// loadCompanies(): void {
//   this.service.getCompanies(null, this.userId).subscribe({
//     next: (res: any[]) => {

//       console.log('Companies:', res);

//       this.companies = res;

//       // ✅ PATCH AFTER DATA LOAD
//       if (this.companyId) {

//         this.gradeForm.patchValue({
//           companyID: this.companyId
//         });

//         this.gradeForm.get('companyID')?.disable();

//         // Load regions
//         this.loadRegionsByCompany(this.companyId);

//         this.gradeForm.get('regionId')?.enable();
//       }
//     },
//     error: () => Swal.fire('Error', 'Failed to load companies.', 'error')
//   });
// }

loadRegions(): void {
  this.service.getRegions(null,this.userId).subscribe({
    next: (res: any[]) => {
      this.regions = res;
      this.regionMap = {};
      this.regions.forEach((r:any) => {
        this.regionMap[r.regionID] = r.regionName;
      });
    },
    error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
  });
}


loadGrades() {

  const companyId = this.companyId ;
  // const regionId = this.regionId;

  if (!companyId ) return;

  this.service.getGrades(companyId)
    .subscribe({
      next: (res: any) => {
        this.grades = res.data || res;
      },
      error: () => {
        Swal.fire('Error', 'Failed to load grades', 'error');
      }
    });
}

 save() {
  debugger;
  if (this.gradeForm.invalid) {
    this.gradeForm.markAllAsTouched(); // 🔥 show errors
    return;
  }

  const data = {
    ...this.gradeForm.getRawValue(), // 🔥 IMPORTANT for disabled fields
    userId: this.userId
  };

  if (this.isEdit) {
    this.service.updateGrade(data).subscribe(() => {
      Swal.fire('Success', 'Updated Successfully', 'success');
      this.loadGrades();
      this.resetForm();
    });
  } else {
    this.service.createGrade(data).subscribe((res: any) => {
      Swal.fire('Success', res.message, 'success');
      this.loadGrades();
      this.resetForm();
    });
  }
}

  edit(row: any) {
    this.isEdit = true;
    this.editId = row.gradeID;

    this.gradeForm.patchValue({
      gradeID: row.gradeID,
      gradeName: row.gradeName,
      companyID: row.companyID,
      regionId: row.regionId,
      isActive: row.isActive
    });
  }

delete(item: any): void {
  console.log('Deleting Grade ID:', item.gradeID);

  Swal.fire({
    title: `Delete "${item.gradeName}"?`,
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel'
  }).then(result => {

    if (result.isConfirmed) {

      // 🔥 Show spinner (if you are using ngx-spinner)
      // this.spinner.show();

      this.service.deleteGrade(item.gradeID).subscribe({
        next: () => {
          Swal.fire('Deleted', 'Grade deleted successfully', 'success');
          this.loadGrades();

          // this.spinner.hide();
        },
        error: (err) => {
          Swal.fire(
            'Error',
            err?.error ?? 'Grade already deleted or not found',
            'error'
          );

          // this.spinner.hide();
        }
      });

    }

  });
}

resetForm() {
  this.gradeForm.reset({
    gradeID: 0,
    gradeName: '',
    companyID: this.companyId ? Number(this.companyId) : '',
    regionId: '',
    isActive: true
  });

  // Keep company locked
  if (this.companyId) {
    this.gradeForm.get('companyID')?.disable();
    this.loadRegionsByCompany(Number(this.companyId));
    this.gradeForm.get('regionId')?.enable();
  } else {
    this.gradeForm.get('regionId')?.disable();
  }

  this.gradeForm.get('gradeName')?.disable();

  this.isEdit = false;
}
}

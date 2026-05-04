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
  filteredRegions: any[] = [];
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

this.service.getGrades(this.userId)
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
      this.filteredRegions = res;
      this.gradeForm.get('regionId')?.enable();
    },
    error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
  });
}
onCompanyChange(): void {
  const companyId = this.gradeForm.get('companyID')?.value;

  this.gradeForm.get('regionId')?.setValue('');

  this.filteredRegions = companyId
    ? this.regions.filter(r => Number(r.companyID) === Number(companyId))
    : [];
}
ngOnInit(): void {
  this.initForm();
  this.loadCompanies();
  this.loadRegions();
  this.loadGrades();

  // ✅ Disable Region initially
  this.gradeForm.get('regionId')?.disable();

  // ✅ Listen for Company change
  this.gradeForm.get('companyID')?.valueChanges.subscribe(companyId => {

    // reset region
    this.gradeForm.get('regionId')?.setValue('');

    if (companyId) {

      // ✅ Filter regions
      this.filteredRegions = this.regions.filter(r =>
        Number(r.companyID) === Number(companyId)
      );

      // ✅ Enable Region
      this.gradeForm.get('regionId')?.enable();

    } else {

      this.filteredRegions = [];
      this.gradeForm.get('regionId')?.disable();
    }
  });
}
  initForm() {
    this.gradeForm = this.fb.group({
      gradeID: [0],
      gradeName: ['', Validators.required],
      companyID: ['', Validators.required],
      regionId: ['', Validators.required],
      isActive: [true]
    });
  }
  loadCompanies(): void {
    this.service.getCompanies(null, this.userId).subscribe({
      next: (res: any) => {
        console.log('All Companies 👉', res);
  
        const data = res?.data ?? res ?? [];
  
        // 🔥 Only active companies
        this.companies = data.filter((c: any) => c.isActive === true);
  
        console.log('Active Companies 👉', this.companies);
      },
      error: () => Swal.fire('Error', 'Failed to load companies.', 'error')
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
  this.service.getRegions(null, this.userId).subscribe({
    next: (res: any) => {
      this.regions = res?.data ?? res ?? [];
    },
    error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
  });
}
loadGrades() {



  this.service.getGrades(this.userId)
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
  if (this.gradeForm.invalid) {
    this.gradeForm.markAllAsTouched();
    return;
  }

  const data = {
    ...this.gradeForm.getRawValue(),
    userId: this.userId
  };

  if (this.isEdit) {

    this.service.updateGrade(data).subscribe({
      next: (res: any) => {

        if (res?.data?.success) {
          Swal.fire('Success', res.data.message, 'success');
          this.loadGrades();
          this.resetForm();
        } else {
          Swal.fire('Error', res?.data?.message || 'Update failed', 'error');
        }

      },
      error: () => Swal.fire('Error', 'Update failed', 'error')
    });

  } else {

    this.service.createGrade(data).subscribe({
      next: (res: any) => {

        if (res?.data?.success) {
          Swal.fire('Success', res.data.message, 'success');
          this.loadGrades();
          this.resetForm();
        } else {
          Swal.fire('Error', res?.data?.message || 'Create failed', 'error');
        }

      },
      error: () => Swal.fire('Error', 'Create failed', 'error')
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

  Swal.fire({
    title: `Delete "${item.gradeName}"?`,
    icon: 'warning',
    showCancelButton: true
  }).then(result => {

    if (result.isConfirmed) {

      this.service.deleteGrade(item.gradeID).subscribe({
        next: (res: any) => {

          // ✅ DELETE has no success flag
          if (res?.message) {
            Swal.fire('Deleted', res.message, 'success');
            this.loadGrades();
          } else {
            Swal.fire('Error', 'Delete failed', 'error');
          }

        },
        error: () => {
          Swal.fire('Error', 'Delete failed', 'error');
        }
      });

    }

  });
}
resetForm() {
  this.gradeForm.reset({
    gradeID: 0,
    gradeName: '',
    companyID: '',
    regionId: '',
    isActive: true
  });



  this.isEdit = false;
}
}

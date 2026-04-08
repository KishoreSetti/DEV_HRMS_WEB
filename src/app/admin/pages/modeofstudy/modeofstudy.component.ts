import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../servies/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modeofstudy',
  standalone: false,
  templateUrl: './modeofstudy.component.html',
  styleUrl: './modeofstudy.component.css'
})
export class ModeofstudyComponent implements OnInit {
  modes: any[] = [];
  companies: any[] = [];
  regions: any[] = [];

  form: any = this.getEmpty();

  isEditMode = false;

  userId: number = Number(sessionStorage.getItem("UserId"));
constructor(private service: AdminService) { }
ngOnInit(): void {
  this.userId = Number(sessionStorage.getItem("UserId"));
  this.form.userId = this.userId;
    this.loadModes();
    this.loadCompanies();
    this.loadRegions();
  }
  getEmpty() {
    return {
      modeOfStudyId: 0,
      modeName: '',
      companyId: 0,
      regionId: 0,
      isActive: true,
      userId: this.userId
    };
  }
loadModes() {
    this.service.getAllModeOfStudyList(this.userId).subscribe((res: any) => {
      this.modes = res;
    });
  }

  loadCompanies() {
    this.service.getCompanies(null, this.userId).subscribe((res: any) => {
      this.companies = res;
    });
  }

  loadRegions() {
    this.service.getRegions(null, this.userId).subscribe((res: any) => {
      this.regions = res;
    });
  }
  onSubmit() {
    this.form.userId = this.userId;

    if (this.isEditMode) {
      this.service.updateModeOfStudy(this.form).subscribe({
        next: (res: any) => {
          Swal.fire('Updated!', res.message, 'success');
          this.loadModes();
          this.reset();
        },
  error: (err) => {
    Swal.fire('Error', err.error?.message || 'Update failed', 'error');
  }
});
    } else {
      this.service.createModeOfStudy(this.form).subscribe(() => {
        Swal.fire('Saved!', 'Mode created successfully', 'success');
        this.loadModes();
        this.reset();
      });
    }
  }
  edit(m: any) {
    this.form = { ...m };
    this.isEditMode = true;
  }
delete(m: any) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This will delete the record',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it'
  }).then((result) => {
    if (result.isConfirmed) {
      this.service.deleteModeOfStudy(m.modeOfStudyId).subscribe(() => {
        Swal.fire('Deleted!', 'Mode deleted successfully', 'success');
        this.loadModes();
      });
    }
  });
}
  reset() {
    this.form = this.getEmpty();
    this.isEditMode = false;
    this.form.userId = this.userId;
  }

  onCancel() {
    this.reset();
  }
  getCompanyName(id: number) {
    const c = this.companies.find(x => x.companyId == id);
    return c ? c.companyName : '-';
  }

  getRegionName(id: number) {
    const r = this.regions.find(x => x.regionID == id);
    return r ? r.regionName : '-';
  }

}

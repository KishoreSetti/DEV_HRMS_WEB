import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../admin/servies/admin.service';
import { HelpdeskService } from '../../helpdesk/service/helpdesk.service';
import { EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';
import { AssetService } from '../asset.service';
import Swal from 'sweetalert2';

import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-asset-request',
  standalone: false,
  templateUrl: './asset-request.component.html',
  styleUrl: './asset-request.component.css'
})
export class AssetRequestComponent {
  assetRequestForm!: FormGroup;
  requests: any[] = [];


  // ✅ Static Dropdown Data
  assetTypes: any[] = [];


  assetCategories: any[] = [];
  priorities: any[] = [];
  companyId = Number(sessionStorage.getItem('CompanyId')) || 0;
  regionId = Number(sessionStorage.getItem('RegionId')) || 0;
  userId = Number(sessionStorage.getItem('UserId')) || 0;


  constructor(private fb: FormBuilder, private service: AdminService, private helpdeskService: HelpdeskService
    , private profileService: EmployeeResignationService, private assetService: AssetService) { }

  ngOnInit() {
    this.assetRequestForm = this.fb.group({
      employeeName: [''],
      employeeId: [''],
      department: [''],

      assetType: ['', Validators.required],
      assetCategory: [''],
      requiredDate: ['', Validators.required],
      priority: [''],
      reason: ['', Validators.required],
      file: [null]
    });
    this.loadRequests();

    this.loadProfile();
    this.loadAssetTypes();
    this.loadAssetCategories();
    this.loadPriorities();

  }
  viewDocument(filePath: string | undefined): void {

  }

  loadProfile() {
    if (!this.userId) return;

    this.profileService.GetempProfile(this.userId).subscribe({
      next: (res: any) => {
        if (res && res.data) {

          const data = res.data;

          // ✅ Patch values into form
          this.assetRequestForm.patchValue({
            employeeName: data.fullName,
            employeeId: data.employeeCode,
            department: data.rolename   // department = rolename
          });

        }
      },
      error: (err) => {
        console.error('Error loading profile', err);
      }
    });
  }

  loadAssetTypes() {
    this.service.getAssetTypesByCompanyRegion(
      this.companyId,
      this.regionId
    ).subscribe((res: any) => {
      this.assetTypes = res.data || res;
    });
  }
  loadAssetCategories() {
    this.service.getAssetCategoriesByCompanyRegion(
      this.companyId,
      this.regionId
    ).subscribe((res: any) => {
      this.assetCategories = res.data || res;
    });
  }

  loadPriorities() {
    this.helpdeskService
      .getPriorities(this.companyId, this.regionId)
      .subscribe(res => {
        this.priorities = res;
      });
  }

  get f() {
    return this.assetRequestForm.controls;
  }

  submit() {
    if (this.assetRequestForm.invalid) {
      this.assetRequestForm.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields',
      });

      return;
    }

    const v = this.assetRequestForm.value;

    const payload = {
      companyID: this.companyId,
      regionID: this.regionId,
      userID: this.userId,

      employeeName: v.employeeName,
      employeeCode: v.employeeId,
      department: v.department,

      assetType: v.assetType,
      assetCategory: v.assetCategory,

      requiredDate: v.requiredDate,
      priority: v.priority,

      reason: v.reason,

      fileName: v.file?.name || '',
      filePath: '',

      reportingTo: Number(sessionStorage.getItem("reportingManagerId"))
    };

    // ✅ LOADING ALERT
    Swal.fire({
      title: 'Submitting...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.assetService.createAssetRequest(payload).subscribe({
      next: (res: any) => {

        Swal.close();

        // ✅ SUCCESS ALERT
        Swal.fire({
          icon: 'success',
          title: 'Request Submitted ✅',
          html: `
          <b>Request ID:</b> ${res} <br>
          Status: <b>Pending</b>
        `,
          confirmButtonText: 'OK'
        });

        this.loadRequests();
        this.assetRequestForm.reset();
        this.loadProfile();
      },

      error: (err) => {

        Swal.close();

        // ❌ ERROR ALERT
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: err?.error?.message || 'Something went wrong!',
        });
      }
    });
  }

  loadRequests() {
    this.assetService.getMyRequests(this.userId)
      .subscribe(res => {
        this.requests = res;
      });
  }

  cancel() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Form data will be cleared',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      cancelButtonText: 'No'
      
    }).then(result => {
      if (result.isConfirmed) {
        this.assetRequestForm.reset();
        this.loadProfile();
      }
    });
  }



  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.assetRequestForm.patchValue({ file: file });
    }
  }
  getPriorityName(id: number): string {
    return this.priorities.find(x => x.priorityId === id)?.priorityName || '-';
  }
  getAssetTypeName(id?: number): string {
    return this.assetTypes.find(x => x.assetTypeId === id)?.assetTypeName ?? '-';
  }

  getAssetCategoryName(id?: number): string {
    return this.assetCategories.find(x => x.assetCategoryId === id)?.assetCategoryName ?? '-';
  }

}

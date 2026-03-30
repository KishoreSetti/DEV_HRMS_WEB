import { Component } from '@angular/core';
import { PersonalDetails } from '../../../../admin/layout/models/PersonalDetails';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeResignation } from '../../employee-models/EmployeeResignation';
import { EmployeeResignationService } from '../../employee-services/employee-resignation.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AdminService } from '../../../../admin/servies/admin.service';
@Component({
  selector: 'app-employee-personal-details',
  standalone: false,
  templateUrl: './employee-personal-details.component.html',
  styleUrl: './employee-personal-details.component.css'
})
export class EmployeePersonalDetailsComponent {
personalForm!: FormGroup;
  selectedFile: File | null = null;
userId = Number(sessionStorage.getItem('UserId') ?? 0);
 companyId=Number(sessionStorage.getItem("CompanyId"));
  regionId=Number(sessionStorage.getItem("RegionId"));
personalEmail: any=sessionStorage.getItem('Email');
username: any=sessionStorage.getItem('Name');
  existingRecordId: number | null = null; // if set => update mode only
  personals: any[] = [];      // for list
  editId: number | null = null; // store id for update
  bloodGroupList: any[] = [];
maritalStatusList: any[] = [];
   constructor(
    private fb: FormBuilder,
    private service: EmployeeResignationService
    , route: Router, private adminService: AdminService
    
  ) {
    
  }
   ngOnInit(): void {
    this.loadBloodGroups();      // 👈 add this
 this.loadMaritalStatuses();  // 👈 add this
    this.createForm();
    this.loadAll();
    this.loadgender();
     if (this.userId > 0) {
      this.loadByUserId();
    }
     
  }
genderList: any[] = [];
genderMap: { [key: number]: string } = {};

loadgender() {
  this.service.Getempgender(this.userId, this.companyId, this.regionId).subscribe({
    next: (res: any[]) => {

      console.log('All Genders 👉', res);

      // ✅ Filter Active = true
      this.genderList = (res || []).filter((g: any) => g.isActive === true);

      // ✅ Build Map (optional but useful)
      this.genderMap = {};
      this.genderList.forEach((g: any) => {
        this.genderMap[g.genderId] = g.genderName;
      });

      console.log('Active Genders 👉', this.genderList);
      console.log('Gender Map 👉', this.genderMap);
    },
    error: () => console.error('Failed to load genders')
  });
}
   // load existing record (if any) and patch the form
  private loadByUserId() {
    this.service.GetByUserIdempProfile(this.userId).subscribe({
      next: (res: any) => {
        if (res) {
          // backend field name might be personalId or PersonalId — adjust if necessary
          this.existingRecordId = res.id ?? res.id ?? res.personalDetailsId ?? null;
           this.editId=res.id;
          // patch values (only those present in DTO will be patched)
          this.personalForm.patchValue(res);
          // set the personalId control (if exists)
          if (this.existingRecordId) {
            this.personalForm.patchValue({ personalId: this.existingRecordId });
          }
        } else {
          this.existingRecordId = null;
        }
      },
      error: (err) => {
        console.error('Error loading personal details by userId', err);
      }
    });
  }
   createForm() {
    this.personalForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: [''],
      genderId: [''],
      mobileNumber: [''],
      personalEmail: [''],
      permanentAddress: [''],
      presentAddress: [''],
      panNumber: [''],
      aadhaarNumber: [''],
      passportNumber: [''],
      placeOfBirth: [''],
      uan: [''],
      bloodGroup: [''],
      citizenship: [''],
      religion: [''],
      drivingLicence: [''],
      maritalStatusId: [''],
      marriageDate: [''],
      workPhone: [''],
      linkedInProfile: [''],
      previousExperience: [''],
      ProfilePicturePath: [''],
      ProfilePictureName : [''],
      brandGrade: [''],
      esicNumber: [''],
      pfNumber: [''],
      employmentType: [''],
      dateofJoining: [''],
      companyId: sessionStorage.getItem('CompanyId') || 1,
      regionId: sessionStorage.getItem('RegionId') || 1,
      userId: sessionStorage.getItem('UserId') || 1
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // CREATE OR UPDATE
  onSubmit() {
    // if (this.personalForm.invalid) {
    //   Swal.fire("Please fill required fields", '', 'warning');
    //   return;
    // }
    const formData = new FormData();
    Object.keys(this.personalForm.controls).forEach(key => {
      formData.append(key, this.personalForm.get(key)?.value);
    });
    if (this.selectedFile) {
      formData.append("profilePicture", this.selectedFile);
      
    }
 

    if (this.editId == null) {
      // CALL CREATE
      this.service.createempProfile(formData).subscribe(res => {
        Swal.fire("Created successfully!", '', 'success');
        this.loadByUserId();
        this.personalForm.reset();
      });

    } else {
      formData.append("id", this.editId.toString());
       // CALL UPDATE
      this.service.updateempProfile(formData).subscribe(res => {
       Swal.fire("Updated successfully!", '', 'success');
        this.loadByUserId();
        this.editId = null;
        this.personalForm.reset();
      });
    }
  }

  // LOAD ALL RECORDS
  loadAll() {
    this.service.getAllempProfile().subscribe(res => {
      this.personals = res;
    });
  }

  // EDIT
  edit(item: any) {
    this.editId = item.personalId; // your model ID
    this.personalForm.patchValue(item);
  }

  // DELETE
  delete(id: number) {
    if (confirm("Are you sure you want to delete?")) {
      this.service.deleteempProfile(id).subscribe(res => {
       Swal.fire("Deleted successfully!", '', 'success');
        this.loadAll();
      });
    }
  }
bloodGroupMap: { [key: number]: string } = {};

loadBloodGroups() {
  this.adminService
    .GetAlluserIdAsync(Number(sessionStorage.getItem("userCompanyId")))
    .subscribe({
      next: (res: any[]) => {

        console.log('All Blood Groups 👉', res);

        // ✅ Filter Active = true
        this.bloodGroupList = (res || []).filter((b: any) => b.isActive === true);

        // ✅ Build Map
        this.bloodGroupMap = {};
        this.bloodGroupList.forEach((b: any) => {
          this.bloodGroupMap[b.bloodGroupId] = b.bloodGroupName;
        });

        console.log('Active Blood Groups 👉', this.bloodGroupList);
        console.log('Blood Group Map 👉', this.bloodGroupMap);
      },
      error: (err) => {
        console.error(err);
      }
    });
}
loadMaritalStatuses() {
  this.adminService.getMaritalStatusesbycmp(this.companyId,this.regionId).subscribe({
    next: (res: any[]) => {
      this.maritalStatusList = res.filter((m: any) =>
        m.companyId == this.companyId &&
        m.regionId == this.regionId &&
        m.isActive === true
      );
      console.log(res);
    },
    error: (err) => console.error(err)
  });
}
}

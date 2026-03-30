import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeResignationService } from '../../employee-services/employee-resignation.service';
import { EmployeeResignation } from '../../employee-models/EmployeeResignation';
import Swal from 'sweetalert2';
import { AdminService } from '../../../../admin/servies/admin.service';
@Component({
  selector: 'app-employee-family-details',
  standalone: false,
  templateUrl: './employee-family-details.component.html',
  styleUrl: './employee-family-details.component.css'
})
export class EmployeeFamilyDetailsComponent {
familyForm!: FormGroup;
  familyList: any[] = [];
  isEdit = false;
   menus:any[]=[];
  editId: number | null = null;
  userId = Number(sessionStorage.getItem("UserId")); // 🔹 replace with logged-in userId
  companyId=Number(sessionStorage.getItem("CompanyId"));
  regionId=Number(sessionStorage.getItem("RegionId"));
 menuId = Number(sessionStorage.getItem("menuId"));
  //canCreate: boolean = true;
  canCreate: boolean = false;
   canEdit: boolean = false;
  canDelete: boolean = false;
  constructor(
    private fb: FormBuilder,
    private empFamilyService: EmployeeResignationService,   private adminService:AdminService
  ) {}

  ngOnInit(): void {
       this.loadPermission();
    this.familyForm = this.fb.group({
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      dateofbirth: ['', Validators.required],
      gender: ['', Validators.required],
      occupation: [''],
      phone: [''],
      address: [''],
      isDependent: [false, Validators.required],
      companyId:this.companyId,
      regionId:this.regionId,
      userId:this.userId,  
    });
this.loadrelationship();
this.loadgender();
    this.loadFamily();
  }

  loadFamily() {
    this.empFamilyService.Getempfamily(this.userId).subscribe(res => {
      debugger;
      this.familyList = res;
    });
  }

  // submit() {
  //   debugger;
  //   // if (this.familyForm.invalid) return;

  //   const formData = new FormData();
  //   Object.keys(this.familyForm.value).forEach(key => {
  //     formData.append(key, this.familyForm.value[key]);
  //   });
  //   formData.append('userId', this.userId.toString());

  //   if (this.isEdit && this.editId) {
  //     formData.append('familyId', this.editId.toString());
  //     this.empFamilyService.updateempfamily(formData).subscribe(() => {
  //       this.resetForm();
  //       this.loadFamily();
  //        Swal.fire("Updated successfully!", '', 'success');
  //     });
  //   } else {
  //     this.empFamilyService.createempfamily(formData).subscribe(() => {
  //       this.resetForm();
  //       this.loadFamily();
  //         Swal.fire("Created successfully!", '', 'success');
  //     });
  //   }
  // }
   submit() {
  const formData = new FormData();

  Object.keys(this.familyForm.value).forEach(key => {
    formData.append(key, this.familyForm.value[key]);
  });

  formData.append('userId', this.userId.toString());

  if (this.isEdit && this.editId) {

    formData.append('familyId', this.editId.toString());

    this.empFamilyService.updateempfamily(formData).subscribe({
      next: () => {
        this.resetForm();
        this.loadFamily();
        Swal.fire("Updated successfully!", "", "success");
      },
      error: (err) => {
        Swal.fire("Permission Denied", err.error, "error");
      }
    });

  } else {

    this.empFamilyService.createempfamily(formData).subscribe({
      next: () => {
        this.resetForm();
        this.loadFamily();
        Swal.fire("Created successfully!", "", "success");
      },
      error: (err) => {
        Swal.fire("Permission Denied", err.error, "error");
      }
    });

  }
}

  edit(row: any) {
    this.isEdit = true;
    this.editId = row.familyId;
    this.familyForm.patchValue(row);
  }

  delete(id: number) {
    if (!this.canDelete) {
    Swal.fire("You don't have permission to delete this record", "", "warning");
    return;
  }
    if (confirm('Are you sure?')) {
      this.empFamilyService.deleteempfamily(id).subscribe(() => {
        this.loadFamily();
          Swal.fire("Deleted successfully!", '', 'success');
      });
    }
  }

  resetForm() {
    this.familyForm.reset();
    this.isEdit = false;
    this.editId = null;
  }
  relationList: any[] = [];

loadrelationship() {

  this.empFamilyService
    .GetAllRelationShip(this.userId, this.companyId, this.regionId)
    .subscribe({
      next: (res: any[]) => {

        console.log('All Relationships 👉', res);

        // ✅ Apply same filter logic
        this.relationList = (res || []).filter((r: any) =>
          r.companyId == this.companyId &&
          r.regionId == this.regionId &&
          r.isActive === true
        );

        console.log('Filtered Relationships 👉', this.relationList);
      },
      error: (err) => console.error(err)
    });
}
genderList: any[] = [];

loadgender() {

  this.empFamilyService
    .Getempgender(this.userId, this.companyId, this.regionId)
    .subscribe({
      next: (res: any[]) => {

        console.log('All Genders 👉', res);

        // ✅ Apply filter (same as marital status)
        this.genderList = (res || []).filter((g: any) =>
          g.companyId == this.companyId &&
          g.regionId == this.regionId &&
          g.isActive === true
        );

        console.log('Filtered Genders 👉', this.genderList);
      },
      error: (err) => console.error(err)
    });
}
loadPermission() {
  debugger;

  const userId = Number(sessionStorage.getItem("UserId"));

  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const familyMenu = menus.find((m: any) => m.menuName === "Family Details");

  const menuId = familyMenu ? familyMenu.menuId : 0;
    if (familyMenu) {
    this.canCreate = familyMenu.canAdd;
  //   this.canEdit = familyMenu.canEdit;
  //   this.canDelete = familyMenu.canDelete;
  //   this.canView = familyMenu.canView;
   this.canEdit = familyMenu.canEdit;
     this.canDelete = familyMenu.canDelete;
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

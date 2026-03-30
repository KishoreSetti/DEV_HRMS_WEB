import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeResignationService,Reference } from '../employee-services/employee-resignation.service';
import Swal from 'sweetalert2';
import { AdminService } from '../../../admin/servies/admin.service';
@Component({
  selector: 'app-employee-references',
  standalone: false,
  templateUrl: './employee-references.component.html',
  styleUrl: './employee-references.component.css'
})
export class EmployeeReferencesComponent {
 referenceForm!: FormGroup;
  referenceList: Reference[] = [];
  isEdit = false;
  editId!: number;
canCreate: boolean = false;
canEdit: boolean = false;
 canDelete: boolean = false;
  constructor(
    private fb: FormBuilder,
    private referenceService: EmployeeResignationService,private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getReferences();
  }

  initForm() {
    this.referenceForm = this.fb.group({
      name: ['', Validators.required],
      title: ['', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', Validators.required],
      userId: [Number(sessionStorage.getItem('UserId'))],
      companyId: [Number(sessionStorage.getItem('CompanyId'))],
      regionId: [Number(sessionStorage.getItem('RegionId'))],
    });
  }

  // ➕ Add / ✏️ Update
  onSubmit() {
    //if (this.referenceForm.invalid) return;

    const payload: Reference = {
      ...this.referenceForm.value,
      userId: Number(sessionStorage.getItem('UserId')),
      companyId: Number(sessionStorage.getItem('CompanyId')),
      regionId: Number(sessionStorage.getItem('RegionId')),
      referenceId: this.isEdit ? this.editId : 0
    };

    if (this.isEdit) {
      this.referenceService.updateReference(payload)
        .subscribe(() => {
          this.resetForm();
          this.getReferences();
          Swal.fire('Updated!', 'Reference has been updated.', 'success');
        });
    } else {
      this.referenceService.addReference(payload)
        .subscribe(() => {
          this.resetForm();
          this.getReferences();
          Swal.fire('Added!', 'Reference has been added.', 'success');
        });
    }
  }

  // 📄 Get All
  getReferences() {
    this.referenceService.getReferences()
      .subscribe(res => {
        this.referenceList = res;
      });
  }

  // ✏️ Edit
  editReference(ref: Reference) {
    this.isEdit = true;
    this.editId = ref.referenceId!;

    this.referenceForm.patchValue({
      name: ref.name,
      title: ref.title,
      companyName: ref.companyName,
      email: ref.email,
      mobileNumber: ref.mobileNumber
    });
  }

  // 🗑️ Delete
  deleteReference(id: number) {
     if (!this.canDelete) {
    Swal.fire("You don't have permission to delete this reference", "", "warning");
    return;
  }
    if (confirm('Are you sure you want to delete this reference?')) {
      this.referenceService.deleteReference(id)
        .subscribe(() => {
          this.getReferences();
          Swal.fire('Deleted!', 'Reference has been deleted.', 'success');
        });
    }
  }

  resetForm() {
    this.referenceForm.reset();
    this.isEdit = false;
  }
    loadPermission() {
  debugger;

  const userId = Number(sessionStorage.getItem("UserId"));

  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

 const familyMenu = menus.find((m: any) => m.menuName === "References");

  const menuId = familyMenu ? familyMenu.menuId : 0;
    if (familyMenu) {
    this.canCreate = familyMenu.canAdd;
     this.canEdit = familyMenu.canEdit;
     this.canDelete = familyMenu.canDelete;
  //   this.canEdit = familyMenu.canEdit;
  //   this.canDelete = familyMenu.canDelete;
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

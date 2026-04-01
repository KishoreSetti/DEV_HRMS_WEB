import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeResignationService } from '../employee-services/employee-resignation.service';
import Swal from 'sweetalert2';
import { AdminService } from '../../../admin/servies/admin.service';
@Component({
  selector: 'app-employee-emergency-contact',
  standalone: false,
  templateUrl: './employee-emergency-contact.component.html',
  styleUrl: './employee-emergency-contact.component.css'
})
export class EmployeeEmergencyContactComponent {
   emergencyForm!: FormGroup;
  emergencyList: any[] = [];
  relationList: any[] = [];
//canCreate: boolean = false;
  isEdit = false;
  editId!: number;

  userId = Number(sessionStorage.getItem('UserId'));
  companyId =Number(sessionStorage.getItem('CompanyId'));
  regionId =Number(sessionStorage.getItem('RegionId'));

  constructor(
    private fb: FormBuilder,
    private empFamilyService: EmployeeResignationService,private adminService: AdminService
  ) {}

  ngOnInit(): void {
      this.loadPermission();   // ✅ ADD THIS

    this.initForm();
    this.loadrelationship();
    this.getEmergencyContacts();
  }

  initForm() {
    this.emergencyForm = this.fb.group({
      emergencyContactId: [0],
      contactName: ['', Validators.required],
      relationshipId: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      alternatePhone: [''],
      email: [''],
      address: [''],
      userId: [this.userId],
      companyId: [this.companyId],
      regionId: [this.regionId],
    });
  }
relationshipMap: { [key: number]: string } = {};

loadrelationship() {

  this.empFamilyService
    .GetAllRelationShip(this.userId, this.companyId, this.regionId)
    .subscribe({
      next: (res: any[]) => {

        console.log('All Relationships 👉', res);

        // ✅ Filter Active + Company + Region
        this.relationList = (res || []).filter((r: any) =>
          r.companyId == this.companyId &&
          r.regionId == this.regionId &&
          r.isActive === true
        );

        // ✅ Build Map
        this.relationshipMap = {};
        this.relationList.forEach((r: any) => {
          this.relationshipMap[r.relationshipId] = r.relationshipName;
        });

        console.log('Filtered Relationships 👉', this.relationList);
        console.log('Relationship Map 👉', this.relationshipMap);
      },
      error: (err) => console.error(err)
    });
}

 getEmergencyContacts() {
  this.empFamilyService.getEmergencyContactsByUserId(this.userId)
    .subscribe((res: any[]) => {
debugger;
      this.emergencyList = res.map(contact => ({
        ...contact,
        relationshipName: this.relationList.find(
          r => r.id === contact.relationshipId
        )?.relationshipName || 'N/A'
      }));

    });
}

  // ➕ Add / ✏️ Update
  onSubmit() {
    //if (this.emergencyForm.invalid) return;

    const payload = this.emergencyForm.value;

    if (this.isEdit) {
      this.empFamilyService.updateEmergencyContact(payload).subscribe({
  next: () => {
    this.resetForm();
    this.getEmergencyContacts();
    Swal.fire("Updated successfully!", '', 'success');
  },
  error: (err) => {
    Swal.fire("Permission Denied", err.error, "error");
  }
});
    } else {
      this.empFamilyService.addEmergencyContact(payload).subscribe({
  next: () => {
    this.resetForm();
    this.getEmergencyContacts();
    Swal.fire("Created successfully!", '', 'success');
  },
  error: (err) => {
    Swal.fire("Permission Denied", err.error, "error");
  }
});
    }
  }

  // ✏️ Edit
  edit(item: any) {
    this.isEdit = true;
    this.editId = item.emergencyContactId;

    this.emergencyForm.patchValue(item);
  }

  // 🗑️ Delete
  delete(id: number) {

  if (!this.canDelete) {
    Swal.fire("You don't have permission to delete", "", "warning");
    return;
  }

  if (confirm('Are you sure you want to delete this contact?')) {
    this.empFamilyService.deleteEmergencyContact(id).subscribe({
      next: () => {
        this.getEmergencyContacts();
        Swal.fire("Deleted successfully!", '', 'success');
      },
      error: (err) => {
        Swal.fire("Permission Denied", err.error, "error");
      }
    });
  }
}

  resetForm() {
    this.emergencyForm.reset();
    this.emergencyForm.patchValue({ userId: this.userId });
    this.isEdit = false;
  }
canCreate: boolean = true;
canEdit: boolean = false;
canDelete: boolean = false;

loadPermission() {
  if (!this.canCreate) {
  this.emergencyForm.disable();
}
  const userId = Number(sessionStorage.getItem("UserId"));
  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  // ✅ FIXED MENU NAME
  const emergencyMenu = menus.find(
    (m: any) => m.menuName === "Emergency Contact"
  );

  const menuId = emergencyMenu ? emergencyMenu.menuId : 0;

  if (emergencyMenu) {
    this.canCreate = emergencyMenu.canAdd;
    this.canEdit = emergencyMenu.canEdit;
    this.canDelete = emergencyMenu.canDelete;
  }

  this.adminService.getPermission(userId, menuId, 'create').subscribe({
    next: (res: boolean) => {
      this.canCreate = res;
    },
    error: () => {
      this.canCreate = false;
    }
  });
}

}

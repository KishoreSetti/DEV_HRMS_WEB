import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MissedPunchService } from './service/missed-punch.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-missed-punch-request',
  standalone: false,
  templateUrl: './missed-punch-request.component.html',
  styleUrl: './missed-punch-request.component.css'
})
export class MissedPunchRequestComponent {
missedPunchForm!: FormGroup;
  isEditMode = false;
  editId: number | null = null;

  myRequests: any[] = [];
  approvalRequests: any[] = [];
pendingRequests: any[] = [];
approvedRequests: any[] = [];
rejectedRequests: any[] = [];
  companyId =Number(sessionStorage.getItem('CompanyId')) || 1;   // get from login/session
  regionId =Number(sessionStorage.getItem('RegionId')) || 1;    // get from login/session
  userId =Number(sessionStorage.getItem('UserId')) || 1;    // logged-in user
  managerId =Number(sessionStorage.getItem("UserId")) || 0; // logged-in manager
selectedTab: string = '';
  constructor(
    private fb: FormBuilder,
    private missedPunchService: MissedPunchService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadMyRequests();
    this.loadApprovalRequests();
    this.loadPermissions();
  }

  /* ================= FORM ================= */

  initializeForm() {
    this.missedPunchForm = this.fb.group({
      missedDate: [null, Validators.required],
      missedType: [null, Validators.required],
       correctClockIn: [{ value: null, disabled: true }],
    correctClockOut: [{ value: null, disabled: true }],
      reason: [null, Validators.required],
      hrEmail: [null] 
    });
    this.handleMissedTypeChanges();
  }
handleMissedTypeChanges() {
  this.missedPunchForm.get('missedType')?.valueChanges.subscribe(value => {
    const clockIn = this.missedPunchForm.get('correctClockIn');
    const clockOut = this.missedPunchForm.get('correctClockOut');

    // Reset first
    clockIn?.disable();
    clockOut?.disable();

    if (value === 'Missed Clock In') {
      clockIn?.enable();      // Disable Clock In
      clockIn?.setValue(null);
    }

    if (value === 'Missed Clock Out') {
      clockOut?.enable();     // Disable Clock Out
      clockOut?.setValue(null);
    }

    if (value === 'Both In & Out') {
      clockIn?.enable();
      clockOut?.enable();
    }
  });
}
  // submitMissedPunch() {
  //  // if (this.missedPunchForm.invalid) return;
  //   const payload = {
  //     ...this.missedPunchForm.value,
  //     companyId: this.companyId,
  //     regionId: this.regionId,
  //     userId: this.userId,employeeId: this.userId,
  //     reportingTo: Number(sessionStorage.getItem('reportingManagerId'))
  //   };

  //   if (this.isEditMode && this.editId) {
  //     this.missedPunchService
  //       .updateMissedPunch( payload)
  //       .subscribe(() => {
  //         this.resetForm();
  //         this.loadMyRequests();
  //       });
  //   } else {
  //     this.missedPunchService
  //       .createMissedPunchRequest(payload)
  //       .subscribe(() => {
  //         this.resetForm();
  //         this.loadMyRequests();
  //       });
  //   }
  // }
  submitMissedPunch() {
  const payload = {
    ...this.missedPunchForm.value,
    companyId: this.companyId,
    regionId: this.regionId,
    userId: this.userId,
    employeeId: this.userId,
    reportingTo: Number(sessionStorage.getItem('reportingManagerId'))
  };

  if (this.isEditMode && this.editId) {
    this.missedPunchService.updateMissedPunch(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Missed punch request updated successfully',
          timer: 2000,
          showConfirmButton: false
        });

        this.resetForm();
        this.loadMyRequests();
      },
      error: () => {
        Swal.fire('Error', 'Failed to update request', 'error');
      }
    });
  } else {
    this.missedPunchService.createMissedPunchRequest(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Submitted!',
          text: 'Missed punch request submitted successfully',
          timer: 2000,
          showConfirmButton: false
        });

        this.resetForm();
        this.loadMyRequests();
      },
      error: () => {
        Swal.fire('Error', 'Failed to submit request', 'error');
      }
    });
  }
}

  editMissedPunch(item: any) {
    this.isEditMode = true;
    this.editId = item.missedPunchRequestID;

    this.missedPunchForm.patchValue({
      missedDate: item.missedDate,
      missedType: item.missedType,
      correctClockIn: item.correctClockIn,
      correctClockOut: item.correctClockOut,
      reason: item.reason
    });
  }

  resetForm() {
    this.missedPunchForm.reset();
    this.isEditMode = false;
    this.editId = null;
  }

  /* ================= LOAD DATA ================= */

loadMyRequests() {
  this.missedPunchService
    .getMissedPunchRequest(this.companyId, this.regionId, this.userId) // ✅ PASS USERID
    .subscribe(res => this.myRequests = res);
}

loadApprovalRequests() {
  this.missedPunchService
    .getApprovalMissedPunchRequest(this.companyId, this.regionId, this.managerId)
    .subscribe(res => {

      this.pendingRequests = res.filter((x: any) => x.status === 'Pending');
      this.approvedRequests = res.filter((x: any) => x.status === 'Approved');
      this.rejectedRequests = res.filter((x: any) => x.status === 'Rejected');

      // add UI properties only for pending
      this.pendingRequests = this.pendingRequests.map(x => ({
        ...x,
        selected: false,
        managerRemarks: x.managerRemarks || ''
      }));
    });
}

  /* ================= APPROVAL ACTIONS ================= */

  // approve(item: any) {

  //   const payload = {
  //     missedPunchRequestIds: [item.missedPunchRequestId],
  //     status: 'Approved',
  //     managerRemarks: item.managerRemarks,
  //     managerId: this.managerId,
  //     companyId: this.companyId,
  //     regionId: this.regionId, 
  //      hrEmail: item.hrEmail
  //   };


  //   this.missedPunchService.bulkApproveRejectPunch(payload)
  //     .subscribe(() => this.loadApprovalRequests());
  // }

  approve(item: any) {

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to approve this request?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Approve'
  }).then((result) => {
    if (result.isConfirmed) {

      const payload = {
        missedPunchRequestIds: [item.missedPunchRequestId],
        status: 'Approved',
        managerRemarks: item.managerRemarks,
        managerId: this.managerId,
        companyId: this.companyId,
        regionId: this.regionId,
        hrEmail: item.hrEmail
      };

      this.missedPunchService.bulkApproveRejectPunch(payload)
        .subscribe(() => {

          Swal.fire({
            icon: 'success',
            title: 'Approved!',
            text: 'Request approved successfully',
            timer: 2000,
            showConfirmButton: false
          });

          this.loadApprovalRequests();
        });
    }
  });
}

  // reject(item: any) {
  //   const payload = {
  //     missedPunchRequestIds: [item.missedPunchRequestId],
  //     status: 'Rejected',
  //     managerRemarks: item.managerRemarks,
     
  //        managerId: this.managerId,
  //     companyId: this.companyId,
  //     regionId: this.regionId,
  //     hrEmail: item.hrEmail 
  //   };

  //   this.missedPunchService.bulkApproveRejectPunch(payload)
  //     .subscribe(() => this.loadApprovalRequests());
  // }

  reject(item: any) {

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to reject this request?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Reject'
  }).then((result) => {
    if (result.isConfirmed) {

      const payload = {
        missedPunchRequestIds: [item.missedPunchRequestId],
        status: 'Rejected',
        managerRemarks: item.managerRemarks,
        managerId: this.managerId,
        companyId: this.companyId,
        regionId: this.regionId,
        hrEmail: item.hrEmail
      };

      this.missedPunchService.bulkApproveRejectPunch(payload)
        .subscribe(() => {

          Swal.fire({
            icon: 'success',
            title: 'Rejected!',
            text: 'Request rejected successfully',
            timer: 2000,
            showConfirmButton: false
          });

          this.loadApprovalRequests();
        });
    }
  });
}

  /* ================= BULK APPROVE / REJECT ================= */

  // bulkApproveReject(status: 'Approved' | 'Rejected') {

  //   const selectedItems = this.approvalRequests
  //     .filter(x => x.selected)
  //     .map(x => ({
  //       missedPunchRequestIds: x.missedPunchRequestId,
  //       status: status,
  //       managerRemarks: x.managerRemarks,
  //         managerId: this.managerId,
  //     companyId: this.companyId,
  //     regionId: this.regionId,
  //     hrEmail: x.hrEmail 
  //     }));

  //   if (selectedItems.length === 0) return;

  //   this.missedPunchService
  //     .bulkApproveRejectPunch(selectedItems)
  //     .subscribe(() => this.loadApprovalRequests());
  // }
  bulkApproveReject(status: 'Approved' | 'Rejected') {

  const selectedIds = this.approvalRequests
    .filter(x => x.selected)
    .map(x => x.missedPunchRequestId);

  if (selectedIds.length === 0) {
    Swal.fire('Warning', 'Please select at least one record', 'warning');
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to ${status.toLowerCase()} selected requests?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Yes, ${status}`
  }).then((result) => {
    if (result.isConfirmed) {

      const payload = {
        missedPunchRequestIds: selectedIds,
        status: status,
        managerRemarks: '',
        managerId: this.managerId,
        companyId: this.companyId,
        regionId: this.regionId
      };

      this.missedPunchService.bulkApproveRejectPunch(payload)
        .subscribe(() => {

          Swal.fire({
            icon: 'success',
            title: `${status}!`,
            text: `Selected requests ${status.toLowerCase()} successfully`,
            timer: 2000,
            showConfirmButton: false
          });

          this.loadApprovalRequests();
        });
    }
  });
}

  /* ================= SELECT ALL ================= */

  selectAll(event: any) {
    const checked = event.target.checked;
    this.approvalRequests.forEach(x => x.selected = checked);
  }

  canViewPersonal = false;
  canViewManager = false;
  loadPermissions() {
    const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

    const personal = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === "my request"
    );

    const managerapproval = menus.find((m: any) =>
      m.menuName?.trim().toLowerCase() === "manager approval"
    );


    this.canViewPersonal = personal?.canView ?? false;
    this.canViewManager = managerapproval?.canView ?? false;


    if (this.canViewPersonal) this.selectedTab = 'tab1';
    else if (this.canViewManager) this.selectedTab = 'tab2';

    console.log("Menus:", menus);
    console.log("Manager Approval:", managerapproval);

    menus.forEach((m: any) => {
      console.log("Menu Name:", m.menuName);
    });

  }
  
}

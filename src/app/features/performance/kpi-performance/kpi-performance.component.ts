import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-kpi-performance',
  standalone: false,
  templateUrl: './kpi-performance.component.html',
  styleUrl: './kpi-performance.component.css'
})
export class KpiPerformanceComponent {
 reviewForm!: FormGroup;
  managerReviews: any[] = [];

  userId!: number;
  roleId!: number;
  reportingManagerId!: number;
  departmentId!: number;
  designation!: any;
  roleName!: string;
  canViewEmployeeSubmission = false;
  canViewManagerReviewApproval = false;
  selectedTab: string = '';

  constructor(
    private fb: FormBuilder,
    private service: AdminService
  ) { }

  // =========================
  // ✅ ngOnInit FIX
  // =========================
  ngOnInit(): void {
  this.LoadTabPermissions();
    // 🔥 ALWAYS read sessionStorage here (NOT outside)
    this.userId = Number(sessionStorage.getItem('UserId') || 0);
    this.roleId = Number(sessionStorage.getItem('roleId') || 0);
    this.reportingManagerId = Number(sessionStorage.getItem('reportingManagerId') || 0);
    const departmentName = sessionStorage.getItem('DepartmentName') || '';
    this.designation = sessionStorage.getItem('Designation') || '';
    this.roleName = sessionStorage.getItem('roleName') || '';


    this.departmentId = 0; // no longer needed if using name
    // this.designation = designation;



    this.initializeForm();
    this.patchUserValues();
    this.loadManagerReviews();
  }
  LoadTabPermissions() {
    const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const employeesubmission = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "employee submission"
  );

  const managerreview = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "manager review & approval"
  );

 

 

  this.canViewEmployeeSubmission = employeesubmission?.canView ?? false;
  this.canViewManagerReviewApproval = managerreview?.canView ?? false;

  if (this.canViewEmployeeSubmission) this.selectedTab = 'tab1';
  else if (this.canViewManagerReviewApproval) this.selectedTab = 'tab2';
  
  }

  // =========================
  // ✅ Initialize Form FIX
  // =========================
  initializeForm() {

    const currentYear = new Date().getFullYear(); // ✅ Auto 2026

    this.reviewForm = this.fb.group({
      id: [0],
      userId: [this.userId],
      roleId: [this.roleId],

      employeeName: [''],
      employeeCode: [''],
      designation: [''],
      department: [''],
      reportingManagerId: [this.reportingManagerId],
      departmentProject: [''],

      performanceCycle: ['Quarterly'], // ✅ default value
      applicableStartDate: [''],
      applicableEndDate: [''],
      appraisalYear: [currentYear.toString()],  // ✅ Auto current year
      selfReviewSummary: [''],
      reportingManagerName: '',
 hrEmail: [''],
      kpis: this.fb.array([])
    });

    this.addKpi();
  }

  // =========================
  // ✅ Patch Values FIX
  // =========================
  patchUserValues() {

    this.reviewForm.patchValue({
      employeeName: sessionStorage.getItem('Name') || '',
      employeeCode: sessionStorage.getItem('EmployeeCode') || '',
      departmentProject: sessionStorage.getItem('DepartmentProject') || '',

      department: sessionStorage.getItem('DepartmentName') || '',
      designation: sessionStorage.getItem('DesignationName') || '',
      reportingManagerName: sessionStorage.getItem('ReportingManagerName') || '',
    });

    console.log("Patched Form:", this.reviewForm.value);
  }



  // =========================
  get kpis(): FormArray {
    return this.reviewForm.get('kpis') as FormArray;
  }

  addKpi() {
    this.kpis.push(
      this.fb.group({
        kpiName: [''],
        weightage: [''],
        target: [''],
        achieved: [''],
        selfRating: [''],
        remarks: ['']
      })
    );
  }

  removeKpi(index: number) {
    this.kpis.removeAt(index);
  }


  submit() {

    console.log(this.reviewForm.value);

    this.service.submit(this.reviewForm.value)
      .subscribe({
        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Submitted Successfully',
            text: 'Your KPI has been submitted.',
            confirmButtonColor: '#28a745'
          });

          // ✅ RESET FORM
          this.reviewForm.reset();

          // ✅ Reinitialize form with default values
          this.initializeForm();
          this.patchUserValues();

        },
        error: (err:any) => {
          Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: 'Something went wrong!'
          });
        }
      });
  }

  saveDraft() {

    this.service.saveDraft(this.reviewForm.value)
      .subscribe(() => {

        Swal.fire({
          icon: 'success',
          title: 'Draft Saved Successfully',
          confirmButtonColor: '#ffc107'
        });

      });
  }



  loadManagerReviews() {

    const loggedInUserId = Number(sessionStorage.getItem('UserId') || 0);

    if (!loggedInUserId) {
      console.log("No logged in user");
      this.managerReviews = [];
      return;
    }

    console.log("Logged In UserId:", loggedInUserId);

    this.service.getManagerReviews(loggedInUserId)
      .subscribe((res: any) => {
        console.log("API Response:", res);
        this.managerReviews = res?.data || [];
      });
  }

  approve(id: number) {

    Swal.fire({
      title: 'Approve Review',
      input: 'textarea',
      inputLabel: 'Enter approval remarks',
      inputPlaceholder: 'Type your remarks here...',
      inputAttributes: {
        'aria-label': 'Enter your remarks'
      },
      showCancelButton: true,
      confirmButtonText: 'Approve',
      confirmButtonColor: '#28a745',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Remarks are required!';
        }
        return null;
      }
    }).then((result) => {

      if (result.isConfirmed) {

        const managerId = Number(sessionStorage.getItem('UserId'));

        this.service.approve(id, managerId, result.value)
          .subscribe(() => {

            Swal.fire({
              icon: 'success',
              title: 'Approved!',
              text: 'Review has been approved successfully.',
              timer: 2000,
              showConfirmButton: false
            });

            this.loadManagerReviews();
          });

      }

    });
  }

  reject(id: number) {

    Swal.fire({
      title: 'Reject Review',
      input: 'textarea',
      inputLabel: 'Enter rejection reason',
      inputPlaceholder: 'Type reason here...',
      inputAttributes: {
        'aria-label': 'Enter rejection reason'
      },
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#dc3545',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Rejection reason is required!';
        }
        return null;
      }
    }).then((result) => {

      if (result.isConfirmed) {

        const managerId = Number(sessionStorage.getItem('UserId'));

        this.service.reject(id, managerId, result.value)
          .subscribe(() => {

            Swal.fire({
              icon: 'success',
              title: 'Rejected!',
              text: 'Review has been rejected successfully.',
              timer: 2000,
              showConfirmButton: false
            });

            this.loadManagerReviews();
          });

      }

    });
  }
  requestReview(id: number) {

  this.service.request(id)
    .subscribe(() => {

      Swal.fire({
        icon: 'success',
        title: 'Requested Successfully',
        timer: 1500,
        showConfirmButton: false
      });

      this.loadManagerReviews();
    });
}
bulkApprove() {

  const selected = this.managerReviews
    .filter(x => x.isSelected);

  if (selected.length === 0) {
    Swal.fire('Please select at least one record');
    return;
  }

  Swal.fire({
    title: 'Approve Selected?',
    input: 'textarea',
    inputLabel: 'Enter approval remarks',
    showCancelButton: true
  }).then(result => {

    if (result.isConfirmed) {

      const managerId = Number(sessionStorage.getItem('UserId'));

      selected.forEach(review => {
        this.service.approve(review.id, managerId, result.value)
          .subscribe();
      });

      Swal.fire('Approved Successfully');
      this.loadManagerReviews();
    }

  });
}
bulkReject() {

  const selected = this.managerReviews
    .filter(x => x.isSelected);

  if (selected.length === 0) {
    Swal.fire('Please select at least one record');
    return;
  }

  Swal.fire({
    title: 'Reject Selected?',
    input: 'textarea',
    inputLabel: 'Enter rejection reason',
    inputPlaceholder: 'Type rejection reason here...',
    showCancelButton: true,
    confirmButtonText: 'Reject',
    confirmButtonColor: '#dc3545',
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value) {
        return 'Rejection reason is required!';
      }
      return null;
    }
  }).then(result => {

    if (result.isConfirmed) {

      const managerId = Number(sessionStorage.getItem('UserId'));

      selected.forEach(review => {
        this.service.reject(review.id, managerId, result.value)
          .subscribe();
      });

      Swal.fire({
        icon: 'success',
        title: 'Rejected Successfully',
        timer: 1500,
        showConfirmButton: false
      });

      this.loadManagerReviews();
    }

  });
}
}

import { Component } from '@angular/core';
import { AdminService, Department } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';


interface Policy {
  Title: string;
  Category: string;
  EffectiveDate: Date;
  Description?: string;
  FileName?: string;
  FileUrl?: string;
}
@Component({
  selector: 'app-company-policies',
  standalone: false,
  templateUrl: './company-policies.component.html',
  styleUrl: './company-policies.component.css'
})
export class CompanyPoliciesComponent {
 companies: any[] = []
  regions: any[] = []
  departments: Department[] = []

  policies: any[] = []

  userId!: number
  companyId!: number
  regionId!: number
  filteredRegions: any[] = []; 

  isEditMode = false

  policy: any = this.resetPolicy()

  categories: string[] = [
    "HR Policy",
    "Leave Policy",
    "Attendance Policy",
    "IT Security Policy",
    "Work From Home Policy",
    "Travel Policy"
  ]

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {

    this.userId = Number(sessionStorage.getItem("UserId"))
    this.companyId = Number(sessionStorage.getItem("CompanyId"))
    this.regionId = Number(sessionStorage.getItem("RegionId"))

    this.loadCompanies()
    this.loadRegions()
    this.loadDepartments()
    this.getPolicies()

  }

  resetPolicy() {

  return {

    PolicyId: 0,
    CompanyId: this.companyId || null,
    RegionId: this.regionId || null,
    DepartmentId: null,

    Title: '',
    Category: '',
    EffectiveDate: new Date().toISOString().split('T')[0],
    Description: '',

    Attachment: null

  }

}

  loadCompanies() {

    this.adminService.getCompanies(null, this.userId)
      .subscribe(res => {
        this.companies = res
      })

  }

  loadRegions() {
  this.adminService.getRegions(null, this.userId)
    .subscribe(res => {
      this.regions = res;
    });
}
onCompanyChange() {
  this.policy.RegionId = null;

  this.filteredRegions = this.policy.CompanyId
    ? this.regions.filter(r => Number(r.companyID) === Number(this.policy.CompanyId))
    : [];
}

  loadDepartments() {

    this.adminService.getDepartments(this.userId)
      .subscribe((res: any) => {
        debugger;
        this.departments = res.data.data.filter((x: any) => x.isActive)
      })

  }

  getDepartmentName(id: number) {

    const d = this.departments.find(x => x.departmentId == id)

    return d ? d.departmentName : '-'

  }

  getPolicies() {

    this.spinner.show()

    this.adminService.getAllPolicies(this.userId)
      .subscribe(res => {

this.policies = res.map((x: any) => ({

  PolicyId: x.policyId,
  CompanyId: x.companyId,
  RegionId: x.regionId,
  DepartmentId: x.departmentId,

  Title: x.policyTitle,
  Category: x.category,

  EffectiveDate: x.effectiveDate,

  Description: x.policyDescription

}))

        this.spinner.hide()

      })

  }

  onFileSelected(e: any) {

    const file = e.target.files[0]

    if (file) {

      this.policy.Attachment = file

    }

  }

onSubmit() {

  const payload = {

    policyId: this.policy.PolicyId,
    userId: this.userId,

    companyId: this.policy.CompanyId
      ? Number(this.policy.CompanyId)
      : null,

    regionId: this.policy.RegionId
      ? Number(this.policy.RegionId)
      : null,

    departmentId: this.policy.DepartmentId
      ? Number(this.policy.DepartmentId)
      : null,

    policyTitle: this.policy.Title,
    policyDescription: this.policy.Description,

    category: this.policy.Category,

    effectiveDate: this.policy.EffectiveDate,
    expiryDate: null,

    postedDate: new Date().toISOString().split('T')[0],

    isActive: true,

    createdBy: this.userId,
    updatedBy: this.isEditMode ? this.userId : null

  }

  const request = this.isEditMode
    ? this.adminService.updatePolicy(this.policy.PolicyId, payload)
    : this.adminService.savePolicy(payload)

  request.subscribe(() => {

    Swal.fire("Success", "Policy Saved", "success")

    this.resetForm()

    this.getPolicies()

  })

}

  editPolicy(p: any) {

    this.isEditMode = true

    this.policy = { ...p }

    this.policy.EffectiveDate = new Date(p.EffectiveDate)
      .toISOString()
      .split('T')[0]
      this.filteredRegions = this.regions.filter(r =>
    Number(r.companyID) === Number(this.policy.CompanyId)
  );

  }

  deletePolicy(p: any) {

    Swal.fire({

      title: 'Delete?',
      text: 'Confirm delete policy',
      icon: 'warning',
      showCancelButton: true

    }).then(r => {

      if (r.isConfirmed) {

        this.adminService.deletePolicy(p.PolicyId, this.userId)
          .subscribe(() => {

            Swal.fire("Deleted", "Policy removed", "success")

            this.getPolicies()

          })

      }

    })

  }

  resetForm() {

    this.policy = this.resetPolicy()

    this.isEditMode = false

  }
}

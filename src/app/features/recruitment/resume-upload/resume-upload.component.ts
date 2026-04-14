import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { RecruitmentService } from '../service/recruitment.service';
import { EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';

interface ReferenceUser {
  userId: number;
  fullName: string;
}
@Component({
  selector: 'app-resume-upload',
  standalone: false,
  templateUrl: './resume-upload.component.html',
  styleUrl: './resume-upload.component.css'
})
export class ResumeUploadComponent {
  today: string = '';
  sequenceCounter = 1;
  isParsing = false;

  tabs = ['Resume Upload', 'Screening', 'Interview', 'Appointment', 'Offer', 'Onboarding'];
  years: number[] = [];
  experienceList: any[] = [];
  qualificationList: any[] = [];
  candidates: any[] = [];
  selectedCandidate: any = null;
  // -------- Sorting --------
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // -------- Pagination --------
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];


  references: any[] = [];
maritalStatuses: any[] = [];


  designations: any[] = [];
  departments: any[] = [];
  gender = ['Female', 'Male', 'Other'];
  candidate: any = {
    appliedDate: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    dob: '',
    currentSalary: '',
    expectedSalary: '',
    reference: '',
    maritalStatus: '',
    department: '',
    designation: '',
    skills: '',
    noticePeriod: '',
    anyOffers: '',
    location: '',
    reason: '',
    designationId: '',

  };
  resumeFile: File | null = null;
  genders: any[] = [];
  expForm = {
    from: '',
    to: '',
    designation: '',
    organization: ''
  };
  eduForm = {
    from: '',
    to: '',
    qualification: '',
    board: ''
  };
  noticePeriods: any[] = [];
  userId!: number;
  companyId!: number;
  regionId!: number;
  isEditMode: boolean = false;
  editingCandidateId: number | null = null;
  editingExpIndex: number | null = null;
  editingEduIndex: number | null = null;
  existingResumeName: string | null = null;
  expToYears: number[] = [];
  eduToYears: number[] = [];

  constructor(private recruitmentService: RecruitmentService, private empResignationService: EmployeeResignationService) { }

  generateYears() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 40; // last 40 years

    for (let y = currentYear; y >= startYear; y--) {
      this.years.push(y);
    }
  }
 loadMaritalStatuses() {
  this.recruitmentService
    .getMaritalStatuses(this.companyId, this.regionId)
    .subscribe({
      next: (res: any) => {
        this.maritalStatuses = res;
      },
      error: () => {
        console.error('Failed to load marital statuses');
      }
    });
}



  ngOnInit(): void {
    this.generateYears();
    const d = new Date();
    this.today = d.toISOString().split('T')[0];
    this.candidate.appliedDate = this.today;

    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
    this.loadCandidates();
    this.loadReferenceUsers();
    this.loadGenders();
    this.loadNoticePeriods();
    this.loadDesignations();
   this.loadMaritalStatuses();


  }
  loadDesignations() {
    this.recruitmentService
      .getDesignations(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.designations = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load designations', 'error');
        }
      });
  }
  loadNoticePeriods() {
    this.recruitmentService
      .getNoticePeriods(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.noticePeriods = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load notice periods', 'error');
        }
      });
  }
  allowNumbersOnly(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }
  onDesignationChange() {
    const selected = this.designations.find(
      d => d.designationId == this.candidate.designationId
    );

    if (selected) {
      this.candidate.department = selected.departmentName || 'Not Assigned';
      this.candidate.designation = selected.designationName; // VERY IMPORTANT
    } else {
      this.candidate.department = '';
      this.candidate.designation = '';
    }
  }
  loadGenders() {
    this.empResignationService
      .Getempgender(this.userId, this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.genders = res;   // store API response
        },
        error: () => {
          Swal.fire('Error', 'Failed to load gender list', 'error');
        }
      });
  }
  capitalizeFirst(event: any, field: 'firstName' | 'lastName') {
    const value = event.target.value.replace(/[^a-zA-Z]/g, '');
    this.candidate[field] =
      value.charAt(0).toUpperCase() + value.slice(1);
  }
  loadReferenceUsers() {
    this.recruitmentService
      .getReferenceUsers(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.references = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load reference users', 'error');
        }
      });
  }
  onExpFromChange() {
    const fromYear = +this.expForm.from;

    if (!fromYear) {
      this.expToYears = [];
      this.expForm.to = '';
      return;
    }

    this.expToYears = this.years.filter(y => y >= fromYear);

    // reset To if invalid
    if (this.expForm.to && +this.expForm.to < fromYear) {
      this.expForm.to = '';
    }
  }
  onEduFromChange() {
    const fromYear = +this.eduForm.from;

    if (!fromYear) {
      this.eduToYears = [];
      this.eduForm.to = '';
      return;
    }

    this.eduToYears = this.years.filter(y => y >= fromYear);

    if (this.eduForm.to && +this.eduForm.to < fromYear) {
      this.eduForm.to = '';
    }
  }

  loadCandidates() {
    this.recruitmentService.getCandidates(this.userId, this.companyId, this.regionId).subscribe({
      next: (res: any) => {
        this.candidates = res
          .map((c: any) => ({
            candidateId: c.candidateId,
            seqNo: c.seqNo,
            candidateName: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
            email: c.email,
            technology: c.designation,
            mobile: c.mobile,
            appliedDate: c.appliedDate,
            fileName: c.fileName,
            stageName: c.stageName,
            progressPercent: c.progress
          }))
          // 🔥 newest first
          .sort(
            (a: any, b: any) =>
              new Date(b.appliedDate).getTime() -
              new Date(a.appliedDate).getTime()
          );
      },
      error: () => Swal.fire('Error', 'Failed to load candidates', 'error')
    });
  }



  addExperience() {
    if (new Date(this.expForm.to) < new Date(this.expForm.from)) {
      Swal.fire('Invalid', '"To Date" must be after "From Date"', 'error');
      return;
    }

    if (!this.expForm.from || !this.expForm.to ||
      !this.expForm.designation || !this.expForm.organization) {
      Swal.fire('Required', 'Fill all experience fields', 'warning');
      return;
    }

    if (this.editingExpIndex !== null) {
      // ✅ UPDATE ONLY
      this.experienceList[this.editingExpIndex] = { ...this.expForm };
      this.editingExpIndex = null;
    } else {
      // ✅ ADD ONLY ONCE
      this.experienceList.push({ ...this.expForm });
    }

    // ✅ reset form
    this.expForm = {
      from: '',
      to: '',
      designation: '',
      organization: ''
    };
  }




  saveCandidate() {

    if (!this.candidate.firstName || !this.candidate.email) {
      Swal.fire('Required', 'Candidate Name & Email are mandatory', 'warning');
      return;
    }

    const formData = new FormData();


    // 🔹 CandidateId (ONLY for edit)
    if (this.isEditMode && this.editingCandidateId) {
      formData.append('CandidateId', this.editingCandidateId.toString());
    }

    // 🔹 Resume (optional in edit)
    if (this.resumeFile) {
      formData.append('ResumeFile', this.resumeFile);
    }
    if (!this.isEditMode) {
      formData.append('SeqNo', `SEQ_${Date.now()}`);
    }
    if (!this.isEditMode) {
      formData.append('StageId', '1');
    }

    // 🔹 Context
    formData.append('UserId', this.userId.toString());
    formData.append('CompanyId', this.companyId.toString());
    formData.append('RegionId', this.regionId.toString());

    // 🔹 Candidate fields
    formData.append('AppliedDate', this.candidate.appliedDate);
    formData.append('FirstName', this.candidate.firstName);
    formData.append('LastName', this.candidate.lastName);
    formData.append('Email', this.candidate.email);
    formData.append('Mobile', this.candidate.mobile);
    formData.append('Gender', this.candidate.gender);
    formData.append('DateOfBirth', this.candidate.dob);
    formData.append('MaritalStatus', this.candidate.maritalStatus);
    formData.append('CurrentSalary', this.candidate.currentSalary);
    formData.append('ExpectedSalary', this.candidate.expectedSalary);
    formData.append('ReferenceSource', this.candidate.reference);
    formData.append('Department', this.candidate.department);
    formData.append('Designation', this.candidate.designation);
    formData.append('Skills', this.candidate.skills);
    formData.append('NoticePeriod', this.candidate.noticePeriod);
    formData.append('AnyOffers', this.candidate.anyOffers);
    formData.append('Location', this.candidate.location);
    formData.append('Reason', this.candidate.reason);
    formData.append('StageId', '1');
    formData.append('SeqNo', `SEQ_${Date.now()}`);

    // 🔹 Experience JSON
    formData.append(
      'ExperiencesJson',
      JSON.stringify(this.experienceList.map(e => ({
        FromDate: e.from,
        ToDate: e.to,
        Designation: e.designation,
        Organization: e.organization
      })))
    );

    // 🔹 Qualification JSON
    formData.append(
      'QualificationsJson',
      JSON.stringify(this.qualificationList.map(q => ({
        FromYear: +q.from,
        ToYear: +q.to,
        Qualification: q.qualification,
        BoardUniversity: q.board
      })))
    );

    // 🔹 CALL API
    const apiCall = this.isEditMode
      ? this.recruitmentService.updateCandidate(formData)
      : this.recruitmentService.saveCandidate(formData);

    apiCall.subscribe({
      next: () => {
        Swal.fire(
          'Success',
          this.isEditMode ? 'Candidate updated successfully' : 'Candidate saved successfully',
          'success'
        );
        this.resetForm();
        this.isEditMode = false;
        this.editingCandidateId = null;
        this.resumeFile = null;
        this.existingResumeName = null;
        this.loadCandidates();
      },
      error: () => Swal.fire('Error', 'Operation failed', 'error')
    });
  }

  editExperience(exp: any, index: number) {
    this.expForm = { ...exp };
    this.editingExpIndex = index;
  }
  editQualification(q: any, index: number) {
    this.eduForm = { ...q };
    this.editingEduIndex = index;
  }
  editCandidate(c: any) {
    this.isEditMode = true;
    this.editingCandidateId = c.candidateId;
    this.selectedCandidate = c;

    this.recruitmentService.getCandidateById(c.candidateId).subscribe((res: any) => {
      this.existingResumeName = res.fileName;

      this.candidate = {
        appliedDate: res.appliedDate?.split('T')[0],
        firstName: res.firstName,
        lastName: res.lastName,
        email: res.email,
        mobile: res.mobile,
        gender: res.gender,
        dob: res.dateOfBirth?.split('T')[0],
        maritalStatus: res.maritalStatus,
        currentSalary: res.currentSalary,
        expectedSalary: res.expectedSalary,
        reference: res.referenceSource,
        department: res.department,
        designation: res.designation,
        designationId: this.designations.find(
          d => d.designationName === res.designation
        )?.designationId || '',
        skills: res.skills,
        noticePeriod: res.noticePeriod,
        anyOffers: res.anyOffers,
        location: res.location,
        reason: res.reason
      };

      // Experience
      this.experienceList = res.experiences.map((e: any) => ({
        from: e.fromDate ? e.fromDate.split('T')[0] : '',
        to: e.toDate ? e.toDate.split('T')[0] : '',
        designation: e.designation,
        organization: e.organization
      }));

      // Qualification
      this.qualificationList = res.qualifications.map((q: any) => ({
        from: q.fromYear,
        to: q.toYear,
        qualification: q.qualification,
        board: q.boardUniversity
      }));

    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadCandidateDetails(candidateId: number) {
    this.recruitmentService.getCandidateById(candidateId).subscribe((res: any) => {
      this.experienceList = res.experiences.map((e: any) => ({
        from: e.fromYear,
        to: e.toYear,
        designation: e.designation,
        organization: e.organization
      }));

      this.qualificationList = res.qualifications.map((q: any) => ({
        from: q.fromYear,
        to: q.toYear,
        qualification: q.qualification,
        board: q.boardUniversity
      }));
    });
  }


  resetForm() {
    this.candidate = {
      appliedDate: '',
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      gender: '',
      dob: '',
      currentSalary: '',
      expectedSalary: '',
      reference: '',
      maritalStatus: '',
      department: '',
      designation: '',
      skills: '',
      noticePeriod: '',
      anyOffers: '',
      location: '',
      reason: ''
    };

    this.experienceList = [];
    this.qualificationList = [];
  }
  onReset() {
    this.resetForm();

    this.isEditMode = false;
    this.editingCandidateId = null;
    this.selectedCandidate = null;

    this.resumeFile = null;
    this.existingResumeName = null;

    this.expForm = {
      from: '',
      to: '',
      designation: '',
      organization: ''
    };

    this.eduForm = {
      from: '',
      to: '',
      qualification: '',
      board: ''
    };

    this.editingExpIndex = null;
    this.editingEduIndex = null;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  addQualification() {
    if (+this.eduForm.to < +this.eduForm.from) {
      Swal.fire('Invalid', '"To" year must be >= "From"', 'error');
      return;
    }

    if (!this.eduForm.from || !this.eduForm.to ||
      !this.eduForm.qualification || !this.eduForm.board) {
      Swal.fire('Required', 'Fill all qualification fields', 'warning');
      return;
    }

    if (this.editingEduIndex !== null) {
      // ✅ UPDATE ONLY
      this.qualificationList[this.editingEduIndex] = { ...this.eduForm };
      this.editingEduIndex = null;
    } else {
      // ✅ ADD ONLY ONCE
      this.qualificationList.push({ ...this.eduForm });
    }

    // ✅ reset form
    this.eduForm = {
      from: '',
      to: '',
      qualification: '',
      board: ''
    };
  }


  onResumeFiles(event: any) {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0] as File;
    this.resumeFile = file;

    this.isParsing = true;

  const fd = new FormData();
  fd.append('ResumeFile', file, file.name);
  fd.append('UserId', this.userId.toString());
  fd.append('CompanyId', this.companyId.toString());
  fd.append('RegionId', this.regionId.toString());
    this.recruitmentService.parseResume(fd).subscribe({
      next: (res: any) => {
        this.isParsing = false;

        // ✅ Auto-fill fields safely
        this.candidate.firstName = res.firstName || this.candidate.firstName;
        this.candidate.lastName = res.lastName || this.candidate.lastName;
        this.candidate.email = res.email || this.candidate.email;
        this.candidate.mobile = res.mobile || this.candidate.mobile;
        this.candidate.skills = res.skills || this.candidate.skills;
        this.candidate.location = res.location || this.candidate.location;
        this.candidate.designation = res.designation || this.candidate.designation;
        this.eduForm.qualification = res.qualification || this.eduForm.qualification;
        this.candidate.dob = res.dateOfBirth || this.candidate.dob;


        if (res.experiences?.length) {
          this.experienceList = res.experiences.map((e: any) => ({
            from: e.fromYear,
            to: e.toYear,
            designation: e.designation,
            organization: e.organization
          }));
        }

        if (res.qualifications?.length) {
          this.qualificationList = res.qualifications.map((q: any) => ({
            from: q.fromYear,
            to: q.toYear,
            qualification: q.qualification,
            board: q.boardUniversity
          }));
        }


        if (!res.qualifications?.length && res.qualification) {
          this.qualificationList = [{
            from: '',
            to: '',
            qualification: res.qualification,
            board: ''
          }];
        }

        Swal.fire('Success', 'Resume parsed and fields auto-filled', 'success');
      },
      error: () => {
        this.isParsing = false;
        Swal.fire('Error', 'Unable to parse resume', 'error');
      }
    });
  }




  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortedCandidates(): any[] {
    let data = [...this.candidates];

    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = a[this.sortColumn!] ?? '';
        const valB = b[this.sortColumn!] ?? '';

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }
  pagedCandidates(): any[] {
    const sorted = this.getSortedCandidates();
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.candidates.length / this.pageSize);
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  viewDocument(fileName: string | undefined): void {
    if (!fileName) return;

    this.recruitmentService.downloadResume(fileName).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        Swal.fire('Error', 'Unable to download file', 'error');
      }
    });
  }

  calculateProgress(c: any) {
    return c.progressPercent ?? 0;
  }

  getProgressColor(c: any) {
    const pct = c.progressPercent;
    if (pct >= 80) return 'bg-success';
    if (pct >= 40) return 'bg-warning';
    return 'bg-danger';
  }
  advanceStage(c: any) {

    Swal.fire({
      title: 'Move to Screening?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then(result => {

      if (result.isConfirmed) {
        this.recruitmentService.moveStage(c.candidateId, 2).subscribe({
          next: () => {
            c.stageName = 'Screening';
            c.progressPercent = 30;
            Swal.fire('Updated', 'Moved to Screening', 'success');
          },
          error: () => Swal.fire('Error', 'Stage update failed', 'error')
        });
      }
    });
  }
  removeCandidate(c: any) {

    Swal.fire({
      title: 'Delete candidate?',
      text: 'This will permanently remove the candidate',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete'
    }).then(result => {

      if (result.isConfirmed) {
        this.recruitmentService
          .deleteCandidate(c.candidateId)
          .subscribe({
            next: () => {
              Swal.fire('Deleted', 'Candidate removed successfully', 'success');
              this.loadCandidates();
            },
            error: () => Swal.fire('Error', 'Delete failed', 'error')
          });
      }

    });
  }



  viewCandidates() {
    return this.candidates || [];
  }
}

import { Component, OnInit } from '@angular/core';
import { RecruitmentService } from '../service/recruitment.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-screening',
  standalone: false,
  templateUrl: './screening.component.html',
  styleUrl: './screening.component.css'
})
export class ScreeningComponent {
  tabs = ['Resume Upload', 'Screening', 'Interview', 'Appointment', 'Offer', 'Onboarding'];
  totalStages = this.tabs.length;
  screeningSelectedCandidates: any[] = [];
  filterStage: any = '';
  globalFilter = '';
   designations: any[] = [];
  candidates: any[] = [];
  screeningRecruiters: string[] = [];

  screeningResult = 'Pass';
  screeningRemarks = '';
  
  candidate: any = {
    appliedDate: '',

    department: '',
    designation: '',

  };
   references: any[] = [];
  recruiters: any[] = [];
  screeningRecruiterId: number | null = null;
  userId!: number;
  companyId!: number;
  regionId!: number;
  screeningCandidates: any[] = [];   // Top table
  screeningRecords: any[] = [];      // Bottom table
  isEditMode = false;
  editingRecord: any = null;
  // -------------------- SORTING --------------------
  topSortColumn: string | null = null;
  topSortDirection: 'asc' | 'desc' = 'asc';

  bottomSortColumn: string | null = null;
  bottomSortDirection: 'asc' | 'desc' = 'asc';

  // -------------------- PAGINATION --------------------
  pageSizeOptions = [5, 10, 20, 50];

  // Top table
  topPageSize = 5;
  topCurrentPage = 1;

  // Bottom table
  bottomPageSize = 5;
  bottomCurrentPage = 1;

  constructor(private recruitmentService: RecruitmentService) { }
  ngOnInit(): void {

    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
 
    this.loadScreeningRecords();
 this.loadDesignations();
 this.loadReferenceUsers();
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
  loadScreeningRecords() {
    this.recruitmentService
      .getScreeningRecords(this.userId, this.companyId, this.regionId)
      .subscribe({
        next: (res:any) => {
          this.screeningRecords = res.map((x: any) => ({
            candidateId: x.candidateId,
            seqNo: x.seqNo,
            name: x.candidateName,
            mobile: x.mobile ?? '',
            expectedCtc: x.expectedSalary ?? '',
            screening: [{
              recruiter: x.recruiterName,
              status: x.screeningStatus,
              remarks: x.remarks,
              date: x.screeningDate
            }],
            stage: x.stageId
          }));
        },
        error: () => {
          Swal.fire('Error', 'Failed to load screening records', 'error');
        }
      });
  }

  showResume() {
    if (!this.candidate.department || !this.candidate.designation) {
      Swal.fire('Warning', 'Select Department & Designation', 'warning');
      return;
    }

    this.recruitmentService
      .getScreeningCandidatesTopTable(
      
        this.userId
      )
      .subscribe({
        next: (res:any) => {
          this.screeningCandidates = res.map((x: any) => ({
            candidateId: x.candidateId,   // 🔥 REQUIRED
            seqNo: x.seqNo,
            name: x.name,
            mobile: x.mobile,
            expectedCtc: x.expected,
            stage: 2,
            screening: []
          }));

        },
        error: () => {
          Swal.fire('Error', 'Failed to load resumes', 'error');
        }
      });
  }

  

  toggleCandidate(candidate: any, event: any) {
    if (event.target.checked) {
      this.screeningSelectedCandidates.push(candidate);
    } else {
      this.screeningSelectedCandidates =
        this.screeningSelectedCandidates.filter(c => c !== candidate);
    }
  }

  isSelected(candidate: any): boolean {
    return this.screeningSelectedCandidates.includes(candidate);
  }



 applyScreening(result: string) {

  if (!this.screeningSelectedCandidates.length) {
    Swal.fire('Warning', 'Select at least one candidate', 'warning');
    return;
  }

  if (!this.screeningRecruiterId) {
    Swal.fire('Warning', 'Select Recruiter', 'warning');
    return;
  }

  for (const c of this.screeningSelectedCandidates) {

    const payload = {
      regionId: this.regionId,
      companyId: this.companyId,
      userId: this.userId,
      candidateId: c.candidateId,
      recruiterId: Number(this.screeningRecruiterId),
      screeningStatus: result,
      remarks: this.screeningRemarks
    };

    this.recruitmentService.saveCandidateScreening(payload).subscribe({
      next: () => {

        let stage = 2;

       if (result === 'Selected') stage = 3;
if (result === 'Rejected') stage = 12;
if (result === 'Hold') stage = 2;

        this.screeningRecords.unshift({
          ...c,
          screening: [{
            recruiter: this.getRecruiterName(this.screeningRecruiterId),
            status: result,
            remarks: this.screeningRemarks,
            date: this.todayTime()
          }],
          stage: stage
        });

      },
      error: () => {
        Swal.fire('Error', 'Failed to save screening', 'error');
      }
    });
  }

  let msg = '';
if (result === 'Selected') msg = 'Candidate Selected for Interview';
if (result === 'Hold') msg = 'Candidate Put On Hold';
if (result === 'Rejected') msg = 'Candidate Rejected';

  Swal.fire('Success', msg, 'success');

  this.screeningSelectedCandidates = [];
  this.screeningCandidates = [];
  this.screeningRemarks = '';
}
  canEdit(c: any): boolean {
    const last = c.screening?.[c.screening.length - 1];
    return last && (last.status === 'Hold' || last.status === 'Reject');
  }

  editScreening(record: any) {
    const last = record.screening[record.screening.length - 1];

    this.isEditMode = true;
    this.editingRecord = record;

    this.screeningRecruiterId = this.recruiters.find(r => r.fullName === last.recruiter)?.userId || null;
    this.screeningResult = last.status;
    this.screeningRemarks = last.remarks;
    const topCandidate = {
      candidateId: record.candidateId,
      seqNo: record.seqNo,
      name: record.name,
      mobile: record.mobile ?? '',
      expectedCtc: record.expectedCtc ?? '',
      stage: record.stage,
      screening: record.screening
    };

    this.screeningCandidates = [topCandidate];
    this.screeningSelectedCandidates = [topCandidate];


    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateScreening() {
    if (!this.editingRecord) return;

    if (!this.screeningRecruiterId) {
      Swal.fire('Warning', 'Select Recruiter', 'warning');
      return;
    }

    const payload = {
      regionId: this.regionId,
      companyId: this.companyId,
      userId: this.userId,
      candidateId: this.editingRecord.candidateId,
      recruiterId: Number(this.screeningRecruiterId),
      screeningStatus: this.screeningResult,
      remarks: this.screeningRemarks
    };

    this.recruitmentService.updateCandidateScreening(payload).subscribe({
      next: () => {
        // ✅ Update UI instantly
        const last = this.editingRecord.screening[this.editingRecord.screening.length - 1];
        last.status = this.screeningResult;
        last.remarks = this.screeningRemarks;
        last.recruiter = this.getRecruiterName(this.screeningRecruiterId);
        last.date = this.todayTime();

        Swal.fire('Success', 'Screening updated successfully', 'success');
        this.resetForm();
      },
      error: () => {
        Swal.fire('Error', 'Failed to update screening', 'error');
      }
    });
  }
  resetForm() {
    this.isEditMode = false;
    this.editingRecord = null;
    this.screeningRecruiterId = null;
    this.screeningResult = 'Pass';
    this.screeningRemarks = '';
  }

  getRecruiterName(id: number | null) {
    if (id === null) return '';
    return this.recruiters.find(r => r.userID === id)?.fullName || '';
  }
  onRecruiterChange(e: any) {
    console.log('Recruiter Selected =>', this.screeningRecruiterId, typeof this.screeningRecruiterId);
  }

  calculateProgress(c: any) {
    const pct = Math.round(((c.stage - 1) / (this.totalStages - 1)) * 100);
    return pct;
  }



  getProgressColor(c: any) {
    const pct = this.calculateProgress(c);
    if (pct >= 80) return 'green';
    if (pct >= 40) return 'yellow';
    return 'red';
  }

  todayTime() {
    const d = new Date();
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }
  viewCandidates() {
    return this.screeningRecords;
  }
  resetScreeningFilters() {
    this.candidate.department = '';
    this.candidate.designation = '';
    this.screeningCandidates = [];
    this.screeningSelectedCandidates = [];
    this.topCurrentPage = 1;

    Swal.fire('Reset', 'Filters cleared', 'info');
  }

  // -------------------- SORTING (TOP TABLE) --------------------

  sortTop(column: string) {
    if (this.topSortColumn === column) {
      this.topSortDirection = this.topSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.topSortColumn = column;
      this.topSortDirection = 'asc';
    }
    this.topCurrentPage = 1;
  }

  getSortedTopCandidates(): any[] {
    let data = [...this.screeningCandidates];

    if (this.topSortColumn) {
      data.sort((a, b) => {
        const valA = a[this.topSortColumn!] ?? '';
        const valB = b[this.topSortColumn!] ?? '';
        if (valA < valB) return this.topSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.topSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }

  pagedTopCandidates(): any[] {
    const sorted = this.getSortedTopCandidates();
    const start = (this.topCurrentPage - 1) * this.topPageSize;
    return sorted.slice(start, start + this.topPageSize);
  }

  get topTotalPages(): number {
    return Math.ceil(this.screeningCandidates.length / this.topPageSize) || 1;
  }

  changeTopPage(page: number) {
    if (page >= 1 && page <= this.topTotalPages) {
      this.topCurrentPage = page;
    }
  }

  changeTopPageSize(size: number) {
    this.topPageSize = size;
    this.topCurrentPage = 1;
  }

  // -------------------- SORTING (BOTTOM TABLE) --------------------

  sortBottom(column: string) {
    if (this.bottomSortColumn === column) {
      this.bottomSortDirection = this.bottomSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.bottomSortColumn = column;
      this.bottomSortDirection = 'asc';
    }
    this.bottomCurrentPage = 1;
  }

  getSortedBottomRecords(): any[] {
    const data = [...this.screeningRecords];
    const column = this.bottomSortColumn;

    if (!column) return data;

    data.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (column === 'result') {
        valA = a.screening?.[a.screening.length - 1]?.status ?? '';
        valB = b.screening?.[b.screening.length - 1]?.status ?? '';
      }
      else if (column === 'date') {
        valA = a.screening?.[a.screening.length - 1]?.date ?? '';
        valB = b.screening?.[b.screening.length - 1]?.date ?? '';
      }
      else {
        valA = (a as any)[column] ?? '';
        valB = (b as any)[column] ?? '';
      }

      if (valA < valB) return this.bottomSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.bottomSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }

  pagedBottomRecords(): any[] {
    const sorted = this.getSortedBottomRecords();
    const start = (this.bottomCurrentPage - 1) * this.bottomPageSize;
    return sorted.slice(start, start + this.bottomPageSize);
  }

  get bottomTotalPages(): number {
    return Math.ceil(this.screeningRecords.length / this.bottomPageSize) || 1;
  }

  changeBottomPage(page: number) {
    if (page >= 1 && page <= this.bottomTotalPages) {
      this.bottomCurrentPage = page;
    }
  }

  changeBottomPageSize(size: number) {
    this.bottomPageSize = size;
    this.bottomCurrentPage = 1;
  }
  isFormValid(): boolean {
    return (
      this.screeningSelectedCandidates.length > 0 &&
      !!this.screeningRecruiterId &&
      !!this.screeningResult &&
      !!this.screeningRemarks?.trim()
    );
  }

  resetScreeningForm() {
    this.screeningRecruiterId = null;
    this.screeningResult = 'Pass';
    this.screeningRemarks = '';
    this.screeningSelectedCandidates = [];
    this.isEditMode = false;
    this.editingRecord = null;
  }
}

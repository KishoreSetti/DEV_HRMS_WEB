import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { RecruitmentService } from '../service/recruitment.service';
@Component({
  selector: 'app-interview',
  standalone: false,
  templateUrl: './interview.component.html',
  styleUrl: './interview.component.css'
})
export class InterviewComponent {
 userId!: number;
  companyId!: number;
  regionId!: number;
  screeningCandidates: any[] = [];   // Top table
  interviewRecords: any[] = [];
  screeningSelectedCandidates: any[] = [];
  interviewer: any[] = [];
  candidates: any[] = [];

  tabs = ['Resume Upload', 'Screening', 'Interview', 'Appointment', 'Offer', 'Onboarding'];
  totalStages = this.tabs.length;
  globalFilter = '';

  filterStage: any = '';
  isEditMode = false;
  editingCandidateId: number | null = null;

  designations: any[] = [];
  departments: any[] = [];
  interviewForm: any = { level: 1, interviewer: '', dt: '', location: '', cabin: '', result: 'Pending', feedback: '' };
  levels: any[] = [];

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
  ngOnInit() {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
    // ✅ ONE STATIC CANDIDATE RECORD

    this.loadInterviewUsers();
    this.loadInterviewRecords();
    this.loadDesignations();
    this.loadInterviewLevels();
  }
  loadInterviewLevels() {
    this.recruitmentService
      .getInterviewLevels(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.levels = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load interview levels', 'error');
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
  loadInterviewUsers() {
    this.recruitmentService
      .getReferenceUsers(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.interviewer = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load reference users', 'error');
        }
      });
  }
  onDesignationChange() {
    const selected = this.designations.find(
      d => d.designationId == this.interviewForm.designationId
    );

    if (selected) {
      this.interviewForm.department = selected.departmentName || 'Not Assigned';
      this.interviewForm.designation = selected.designationName; // VERY IMPORTANT
    } else {
      this.interviewForm.department = '';
      this.interviewForm.designation = '';
    }
  }

  updateInterview() {

    console.log("Update button clicked");
    console.log("InterviewId:", this.interviewForm.interviewId);

    if (this.interviewForm.interviewId == null) {
      Swal.fire('Error', 'InterviewId missing', 'error');
      return;
    }

    const interviewerObj = this.interviewer.find(
      x => x.userId == this.interviewForm.interviewerId
    );

    const payload = {
      interviewId: this.interviewForm.interviewId,
      regionId: this.regionId,
      companyId: this.companyId,
      userId: this.userId,
      candidateId: this.editingCandidateId,
      levelNo: this.interviewForm.level,
      interviewerId: this.interviewForm.interviewerId,
      interviewerName: interviewerObj?.fullName,
      interviewDate: this.interviewForm.dt,
      location: this.interviewForm.location,
      meetingLink: this.interviewForm.meetingLink,
      description: this.interviewForm.feedback,
      result: this.interviewForm.result
    };

    console.log("Update Payload:", payload);

    this.recruitmentService.updateCandidateInterview(payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Interview updated', 'success');
        this.loadInterviewRecords();
        this.resetInterviewForm();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to update interview', 'error');
      }
    });
  }

  scheduleInterview() {
    if (this.isEditMode) {
      this.updateInterview();
      return;
    }

    if (this.screeningSelectedCandidates.length === 0) {
      Swal.fire('Warning', 'Select candidate', 'warning');
      return;
    }
    if (!this.interviewForm.level) {
      Swal.fire('Warning', 'Select Level', 'warning');
      return;
    }
    if (!this.interviewForm.interviewerId) {
      Swal.fire('Warning', 'Select Interviewer', 'warning');
      return;
    }
    if (!this.interviewForm.dt) {
      Swal.fire('Warning', 'Select Date & Time', 'warning');
      return;
    }

    const selectedCandidate = this.screeningSelectedCandidates[0];
    const selectedInterviewer = this.interviewer
      .find(x => x.userId == this.interviewForm.interviewerId);

    const payload = {
      regionId: this.regionId,
      companyId: this.companyId,
      userId: this.userId,
      candidateId: selectedCandidate.candidateId,
      levelNo: this.interviewForm.level,
      interviewerId: this.interviewForm.interviewerId,
      interviewerName: selectedInterviewer?.fullName,
      interviewDate: this.interviewForm.dt,
      location: this.interviewForm.location,
      meetingLink: this.interviewForm.meetingLink,
      description: this.interviewForm.feedback,
      result: 'Pending',
      hrEmail: this.interviewForm.hrEmail   // ✅ ADD THIS
    };

    this.recruitmentService.saveCandidateInterview(payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Interview scheduled successfully', 'success');

        // 🔄 Refresh bottom table
        this.loadInterviewRecords();

        // 🔄 Clear form
        this.resetForm();

        // 🔄 Remove candidate from top list (optional UX)
        this.screeningCandidates =
          this.screeningCandidates.filter(c => c !== selectedCandidate);
        this.screeningSelectedCandidates = [];
      },
      error: () => {
        Swal.fire('Error', 'Failed to schedule interview', 'error');
      }
    });
  }
  loadInterviewRecords() {
    this.recruitmentService
      .getInterviewRecords(this.userId, this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.interviewRecords = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load interview records', 'error');
        }
      });
  }
  resetForm() {
    this.interviewForm.level = '';
    this.interviewForm.interviewerId = '';
    this.interviewForm.dt = '';
    this.interviewForm.location = '';
    this.interviewForm.meetingLink = '';
    this.interviewForm.feedback = '';
    this.interviewForm.result = 'Pending';
  }
  isSelected(candidate: any): boolean {
    return this.screeningSelectedCandidates.includes(candidate);
  }
  toggleCandidate(candidate: any, event: any) {
    if (event.target.checked) {
      this.screeningSelectedCandidates.push(candidate);
    } else {
      this.screeningSelectedCandidates =
        this.screeningSelectedCandidates.filter(c => c !== candidate);
    }
  }
  editInterview(row: any) {
    console.log("Edit row:", row);
    this.isEditMode = true;
    this.editingCandidateId = row.candidateId;
    this.interviewForm.interviewId = row.interviewId;
    this.interviewForm.interviewId = row.interviewId;
    this.interviewForm.level = row.levelNo;
    this.interviewForm.interviewerId = row.interviewerId;
    this.interviewForm.dt = this.toDateTimeLocal(row.interviewDate);
    this.interviewForm.location = row.location;
    this.interviewForm.meetingLink = row.meetingLink;
    this.interviewForm.feedback = row.description;
    this.interviewForm.result = row.result;

    this.interviewForm.department = row.department;
    this.interviewForm.designation = row.designation;

    const topCandidate = {
      candidateId: row.candidateId,
      seqNo: row.seqNo,
      name: row.candidateName,
      mobile: row.mobile,
      expectedCtc: row.expectedSalary
    };

    this.screeningCandidates = [topCandidate];
    this.screeningSelectedCandidates = [topCandidate];
  }

  toDateTimeLocal(date: string) {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  showResume() {
    if (!this.interviewForm.department || !this.interviewForm.designation) {
      Swal.fire('Warning', 'Select Department & Designation', 'warning');
      return;
    }

    this.recruitmentService
      .getScreeningCandidatesTopTableInterview(
        // this.companyId,
        // this.regionId,
        // this.interviewForm.department,
        // this.interviewForm.designation
        this.userId
      )
      .subscribe({
        next: (res: any) => {
          this.screeningCandidates = res.map((x: any) => ({
            candidateId: x.candidateId,   // 🔥 REQUIRED
            seqNo: x.seqNo,
            name: x.name,
            mobile: x.mobile,
            expectedCtc: x.expected,
            stage: 3,
            screening: []
          }));

        },
        error: () => {
          Swal.fire('Error', 'Failed to load Candidate', 'error');
        }
      });
  }

  calculateProgress(c: any) {
    if (!c || !c.stageId) return 0;

    // stages: Resume(1), Screening(2), Interview(3), Appointment(4), Offer(5), Onboarding(6)
    return Math.round(((c.stageId - 1) / (this.totalStages - 1)) * 100);
  }

  getProgressColor(c: any) {
    const pct = this.calculateProgress(c);
    if (pct >= 80) return 'bg-success';
    if (pct >= 40) return 'bg-warning';
    return 'bg-danger';
  }

  todayTime() {
    const d = new Date();
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }
  viewCandidates() {
    let result = [...this.candidates];
    if (this.globalFilter) {
      const f = this.globalFilter.toLowerCase();
      result = result.filter(c =>
        (c.name || '').toLowerCase().includes(f) ||
        (c.technology || '').toLowerCase().includes(f) ||
        (c.email || '').toLowerCase().includes(f)
      );
    }
    if (this.filterStage) {
      result = result.filter(c => c.stage === Number(this.filterStage));
    }
    return result;
  }
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

  // ================= SORTING (BOTTOM TABLE) =================

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
    const data = [...this.interviewRecords];
    const column = this.bottomSortColumn;

    if (!column) return data;

    data.sort((a, b) => {
      const valA = (a as any)[column] ?? '';
      const valB = (b as any)[column] ?? '';
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
    return Math.ceil(this.interviewRecords.length / this.bottomPageSize) || 1;
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
  resetInterviewFilters() {
    this.interviewForm.department = '';
    this.interviewForm.designation = '';
    this.screeningCandidates = [];
    this.screeningSelectedCandidates = [];
    this.topCurrentPage = 1;
  }

  resetInterviewForm() {
    this.isEditMode = false;
    this.editingCandidateId = null;
    this.resetForm(); // reuse your existing method
  }
}

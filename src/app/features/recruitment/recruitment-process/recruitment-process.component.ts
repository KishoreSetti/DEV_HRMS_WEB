import { Component } from '@angular/core';

@Component({
  selector: 'app-recruitment-process',
  standalone: false,
  templateUrl: './recruitment-process.component.html',
  styleUrl: './recruitment-process.component.css'
})
export class RecruitmentProcessComponent {
tabs = ['Resume Upload', 'Screening', 'Interview','Appointment','Offer', 'Onboarding'];
  totalStages = this.tabs.length;
  activeTab:Number = 1;

  // filters
  globalFilter = '';
  filterStage: any = '';

  // dummy recruiters list
  recruiters = ['Asha (RECR-01)', 'Rohit (RECR-02)', 'Priya (RECR-03)', 'Sahil (RECR-04)'];

  // candidate working data & form models
  candidates: any[] = [];
  candidateForm: any = { name: '', email: '', mobile: '', technology: '', experience: 0, currentCTC: '', appliedDate: '', resumeFiles: [] };

  screeningSelectedCandidates: any[] = [];
  screeningRecruiters: string[] = [];
  screeningResult = 'Pass';
  screeningRemarks = '';

  interviewForm: any = { candidate: null, level: 1, interviewer: '', dt: '', location: '', cabin: '', result: 'Pending', feedback: '' };

  offerForm: any = { candidate: null, role: '', ctc: '', doj: '', status: 'Offered', hrName: '', file: null };

  onboardForm: any = { candidate: null, joiningDate: '', docsCollected: false, bgCheck: 'Pending', laptop: false, buddy: '' };

  selectedCandidate: any = null;

  ngOnInit(): void {
    this.loadDummyData();
  }

  setActiveTab(tab: number) {
    this.activeTab = tab;
  }

  /** ---------- Resume / Candidate functions ---------- */
  onResumeFiles(evt: any) {
    const files = evt.target.files;
    this.candidateForm.resumeFiles = [];
    for (let i = 0; i < files.length; i++) {
      this.candidateForm.resumeFiles.push(files[i].name);
    }
  }

  addCandidate() {
    const id = Math.floor(Math.random() * 1000000);
    const newC = {
      id,
      name: this.candidateForm.name || `Candidate-${id}`,
      email: this.candidateForm.email || '',
      mobile: this.candidateForm.mobile || '',
      technology: this.candidateForm.technology || '',
      experience: this.candidateForm.experience || 0,
      currentCTC: this.candidateForm.currentCTC || '',
      resume: this.candidateForm.resumeFiles?.slice() || [],
      appliedDate: this.candidateForm.appliedDate || this.today(),
      stage: 1, // start at Resume Upload
      screening: [],   // array of {recruiter, status, remarks, date}
      interviews: [],  // array of {level, interviewer, dt, location, cabin, result, feedback}
      offer: {},       // offer details
      onboarding: {}   // onboarding details
    };
    this.candidates.unshift(newC);
    // reset form
    this.candidateForm = { name: '', email: '', mobile: '', technology: '', experience: 0, currentCTC: '', appliedDate: '', resumeFiles: [] };
    this.selectedCandidate = newC;
  }

  removeCandidate(c: any) {
    this.candidates = this.candidates.filter(x => x.id !== c.id);
    if (this.selectedCandidate?.id === c.id) this.selectedCandidate = null;
  }

  selectCandidate(c: any) {
    this.selectedCandidate = c;
  }

  /** ---------- Filtering ---------- */
  applyFilter() {
    // trivial - actual filtering done in viewCandidates()
  }

  clearFilter() {
    this.globalFilter = '';
    this.filterStage = '';
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

  /** ---------- Screening: multi-select handling ---------- */
  applyScreening() {
    if (!this.screeningSelectedCandidates || this.screeningSelectedCandidates.length === 0) {
      alert('Select at least one candidate for screening.');
      return;
    }
    const dt = this.todayTime();
    for (const c of this.screeningSelectedCandidates) {
      const record = {
        recruiter: (this.screeningRecruiters && this.screeningRecruiters.length) ? this.screeningRecruiters.join(', ') : 'Auto',
        status: this.screeningResult,
        remarks: this.screeningRemarks || '',
        date: dt
      };
      c.screening.push(record);
      // move stage to 2 (Screening) if pass/hold; reject keeps stage maybe set to 1 but store screening record
      if (this.screeningResult === 'Pass') { c.stage = Math.max(c.stage, 2); }
      if (this.screeningResult === 'Reject') { c.stage = 1; } // stays in intake but marked
    }
    // reset
    this.screeningSelectedCandidates = [];
    this.screeningRecruiters = [];
    this.screeningResult = 'Pass';
    this.screeningRemarks = '';
    alert('Screening applied.');
  }

  /** ---------- Interview scheduling & feedback ---------- */
  scheduleInterview() {
    if (!this.interviewForm.candidate) { alert('Select candidate'); return; }
    const iv = {
      level: this.interviewForm.level,
      interviewer: this.interviewForm.interviewer || 'TBD',
      dt: this.interviewForm.dt || this.todayTime(),
      location: this.interviewForm.location || 'Office',
      cabin: this.interviewForm.cabin || '-',
      result: this.interviewForm.result || 'Pending',
      feedback: this.interviewForm.feedback || ''
    };
    // push interview to candidate record
    this.interviewForm.candidate.interviews.push(iv);

    // update candidate stage depending on level result
    if (iv.result === 'Pass') {
      // determine stage mapping: interview stage considered as stage 3
      this.interviewForm.candidate.stage = Math.max(this.interviewForm.candidate.stage, 3);
    } else if (iv.result === 'Fail') {
      // keep at interview stage but note result
      this.interviewForm.candidate.stage = Math.max(this.interviewForm.candidate.stage, 3);
    }

    // reset small parts of form (keep candidate preselected for scheduling subsequent rounds)
    this.interviewForm.level = Math.min(3, this.interviewForm.level + 1);
    this.interviewForm.interviewer = '';
    this.interviewForm.dt = '';
    this.interviewForm.location = '';
    this.interviewForm.cabin = '';
    this.interviewForm.result = 'Pending';
    this.interviewForm.feedback = '';
  }

  /** ---------- Offer management ---------- */
  onOfferLetter(evt: any) {
    const f = evt.target.files;
    this.offerForm.file = f && f.length ? f[0].name : null;
  }

  applyOffer() {
    if (!this.offerForm.candidate) { alert('Select candidate for offer'); return; }
    const off = {
      role: this.offerForm.role,
      ctc: this.offerForm.ctc,
      doj: this.offerForm.doj,
      status: this.offerForm.status,
      hrName: this.offerForm.hrName,
      letter: this.offerForm.file || null,
      date: this.todayTime()
    };
    this.offerForm.candidate.offer = off;
    if (off.status === 'Offered' || off.status === 'Accepted') {
      this.offerForm.candidate.stage = Math.max(this.offerForm.candidate.stage, 4);
    }
    // reset (but keep candidate selected)
    this.offerForm.role = ''; this.offerForm.ctc = ''; this.offerForm.doj = ''; this.offerForm.status = 'Offered'; this.offerForm.hrName = ''; this.offerForm.file = null;
    alert('Offer saved.');
  }

  /** ---------- Onboarding ---------- */
  applyOnboarding() {
    if (!this.onboardForm.candidate) { alert('Select candidate'); return; }
    const on = {
      joiningDate: this.onboardForm.joiningDate,
      docsCollected: this.onboardForm.docsCollected,
      bgCheck: this.onboardForm.bgCheck,
      laptop: this.onboardForm.laptop,
      buddy: this.onboardForm.buddy,
      date: this.todayTime()
    };
    this.onboardForm.candidate.onboarding = on;
    if (on.docsCollected && on.bgCheck === 'Clear') {
      this.onboardForm.candidate.stage = this.totalStages; // fully onboarded
    } else {
      this.onboardForm.candidate.stage = Math.max(this.onboardForm.candidate.stage, 5);
    }
    // reset
    this.onboardForm.joiningDate = ''; this.onboardForm.docsCollected = false; this.onboardForm.bgCheck = 'Pending'; this.onboardForm.laptop = false; this.onboardForm.buddy = '';
    alert('Onboarding updated.');
  }

  /** ---------- Helpers ---------- */
  advanceStage(c: any) {
    if (c.stage < this.totalStages) c.stage++;
  }

  moveToNextStage(candidate: any) {
    this.advanceStage(candidate);
  }

  calculateProgress(c: any) {
    if (!c) return 0;
    // basic progress mapping across 5 stages (1..5) -> percentage
    const pct = Math.round(((c.stage - 1) / (this.totalStages - 1)) * 100);
    return pct;
  }

  getProgressColor(c: any) {
    const pct = this.calculateProgress(c);
    if (pct >= 80) return 'green';
    if (pct >= 40) return 'yellow';
    return 'red';
  }

  today() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  todayTime() {
    const d = new Date();
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }

  /** ---------- dummy data ---------- */
  loadDummyData() {
    const base = [
      {
        id: 1, name: 'Anita Sharma', email: 'anita.sharma@example.com', mobile: '9810001111', technology: 'Angular, TypeScript',
        experience: 4, currentCTC: '8 LPA', resume: ['anita_sharma.pdf'], appliedDate: '2025-09-15',
        stage: 1, screening: [], interviews: [], offer: {}, onboarding: {}
      },
      {
        id: 2, name: 'Vikram Singh', email: 'vikram.singh@example.com', mobile: '9810002222', technology: 'Java, Spring',
        experience: 6, currentCTC: '14 LPA', resume: ['vikram_singh_cv.pdf'], appliedDate: '2025-09-20',
        stage: 3,
        screening: [{ recruiter: 'Rohit (RECR-02)', status: 'Pass', remarks: 'Good match', date: this.todayTime() }],
        interviews: [
          { level: 1, interviewer: 'Alice', dt: '2025-09-25 10:00', location: 'Office', cabin: 'B-201', result: 'Pass', feedback: 'Strong technical' }
        ],
        offer: {}, onboarding: {}
      },
      {
        id: 3, name: 'Sneha Patel', email: 'sneha.patel@example.com', mobile: '9810003333', technology: 'QA, Automation',
        experience: 3, currentCTC: '6 LPA', resume: ['sneha_pat.pdf'], appliedDate: '2025-09-25',
        stage: 4,
        screening: [{ recruiter: 'Asha (RECR-01)', status: 'Pass', remarks: 'Okay', date: this.todayTime() }],
        interviews: [
          { level: 1, interviewer: 'Bob', dt: '2025-09-28 11:00', location: 'Office', cabin: 'A-101', result: 'Pass', feedback: 'Decent' },
          { level: 2, interviewer: 'Charlie', dt: '2025-10-01 14:00', location: 'Office', cabin: 'A-102', result: 'Pass', feedback: 'Culture fit' }
        ],
        offer: { role: 'QA Engineer', ctc: '7 LPA', doj: '2025-11-01', status: 'Offered', hrName: 'Priya (HR)' },
        onboarding: {}
      }
    ];
    this.candidates = base;
    this.selectedCandidate = this.candidates[0];
  }
}

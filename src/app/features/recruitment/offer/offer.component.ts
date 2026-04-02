import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { RecruitmentService } from '../service/recruitment.service';
@Component({
  selector: 'app-offer',
  standalone: false,
  templateUrl: './offer.component.html',
  styleUrl: './offer.component.css'
})
export class OfferComponent {
 departments: any[] = [];
designations: any[] = [];
 onDesignationChange() {
    const selected = this.designations.find(
      d => d.designationId == this.offerForm.designationId
    );

    if (selected) {
      this.offerForm.department = selected.departmentName || 'Not Assigned';
      this.offerForm.designation = selected.designationName; // VERY IMPORTANT
    } else {
      this.offerForm.department = '';
      this.offerForm.designation = '';
    }
  }
  candidates: any[] = [
    {
      id: 1,
      name: 'John',
      
      stage: 4,
      offer: {}
    },
    {
      id: 2,
      name: 'Soma',
      stage: 4,
      offer: {}
    }
  ];

  // ===== OFFER FORM =====
  offerForm: any = {
    candidate: null,
    role: '',
    ctc: '',
    doj: '',
    status: 'Offered',
    hrName: '',
    file: null
  };

  tabs = ['Resume Upload', 'Screening', 'Interview', 'Appointment', 'Offer', 'Onboarding'];
  totalStages = this.tabs.length;
  globalFilter = '';
  filterStage: any = '';
  screeningCandidates: any[] = [];  
screeningSelectedCandidates: any[] = [];
 userId!: number;
  companyId!: number;
  regionId!: number;
hrUsers: any[] = [];

  // ===== SAVE OFFER (STATIC POST) =====
 applyOffer() {
  if (this.screeningSelectedCandidates.length === 0) {
    Swal.fire('Warning', 'Select at least one candidate', 'warning');
    return;
  }

  const candidate = this.screeningSelectedCandidates[0]; // single select

  const payload = {
    regionId: this.regionId,
    companyId: this.companyId,
    userId: this.userId,
    candidateId: candidate.candidateId,
    offeredCtc: this.offerForm.ctc,
    expectedDoj: this.offerForm.doj,
    offerStatus: this.offerForm.status,
    hrName: this.offerForm.hrName,
    offerLetterPath: null,
    filePath: null
  };

  this.recruitmentService.saveCandidateOffer(payload).subscribe({
    next: () => {
      Swal.fire('Success', 'Offer saved successfully', 'success');

      // 🔥 Refresh offers list
      this.loadOfferRecords();

      // 🔥 Remove candidate from top table
      this.screeningCandidates =
        this.screeningCandidates.filter(c => c !== candidate);

      this.screeningSelectedCandidates = [];

      // 🔥 Reset form
      this.offerForm.ctc = '';
      this.offerForm.doj = '';
      this.offerForm.status = 'Offered';
      this.offerForm.hrName = '';
    },
    error: () => {
      Swal.fire('Error', 'Failed to save offer', 'error');
    }
  });
}

  constructor(private recruitmentService: RecruitmentService) {}
    ngOnInit(): void {
    
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
  
    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
    this.loadHRUsers(); 
    this.loadOfferRecords(); 
    this.loadDesignations();
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
  loadOfferRecords() {
  this.recruitmentService
    .getOfferRecords(this.userId, this.companyId, this.regionId)
    .subscribe({
      next: (res:any) => {
        this.candidates = res.map((x:any) => ({
          offerId: x.offerId, 
          candidateId: x.candidateId,
          name: x.candidateName,
          stage: x.stageId,
          offer: {
            role: x.designation,
            ctc: x.offeredCtc,
            doj: x.expectedDoj,
            hrName: x.hrName,
            status: x.offerStatus
          }
        }));
      },
      error: () => {
        Swal.fire('Error', 'Failed to load offers list', 'error');
      }
    });
}

loadHRUsers() {
  this.recruitmentService
    .getHRUsers(this.companyId, this.regionId)
    .subscribe({
      next: (res:any) => {
        this.hrUsers = res;
      },
      error: () => {
        Swal.fire('Error', 'Failed to load HR users', 'error');
      }
    });
}

 showResume() {
   if (!this.offerForm.department || !this.offerForm.designation) {
     Swal.fire('Warning', 'Select Department & Designation', 'warning');
     return;
   }
 
   this.recruitmentService
     .getOfferCandidatesTopTable(
      //  this.companyId,
      //  this.regionId,
      //  this.offerForm.department,
      //  this.offerForm.designation
      this.userId
     )
     .subscribe({
       next: (res:any) => {
         this.screeningCandidates = res.map((x:any) => ({
           candidateId: x.candidateId,   // 🔥 REQUIRED
           seqNo: x.seqNo,
           name: x.name,
           mobile: x.mobile,
           expectedCtc: x.expected,
           stage: 5,
           screening: []
         }));
 
       },
       error: () => {
         Swal.fire('Error', 'Failed to load resumes', 'error');
       }
     });
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
  // ===== HELPERS =====
  calculateProgress(c: any) {
    return Math.round(((c.stage - 1) / (this.totalStages - 1)) * 100);
  }

  getProgressColor(c: any) {
    const pct = this.calculateProgress(c);
    if (pct >= 80) return 'bg-success';
    if (pct >= 40) return 'bg-warning';
    return 'bg-danger';
  }

  todayTime() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  viewCandidates() {
    return this.candidates;
  }
 sendOffer(c: any) {
  this.recruitmentService.sendOfferLetter(c.offerId).subscribe({
    next: () => Swal.fire('Success', 'Offer letter sent to candidate', 'success'),
    error: () => Swal.fire('Error', 'Failed to send offer letter', 'error')
  });
}

viewOffer(c: any) {
  this.recruitmentService.downloadOfferLetter(c.offerId).subscribe((blob:any) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Offer_${c.name}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  });
}

}

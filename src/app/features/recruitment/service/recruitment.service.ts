import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
 private baseUrl = environment.apiUrl; // same pattern as LeaveService
  constructor(private http: HttpClient) { }
  ///////////////////////////////////////////////////////
//////////////Resuem Upload - Recruitment /////////////
///////////////////////////////////////////////////////
  getReferenceUsers(companyId: number, regionId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetReferenceUsers/${companyId}/${regionId}`
  );
}
getDesignations(companyId: number, regionId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetDesignations/${companyId}/${regionId}`
  );
}
getNoticePeriods(companyId: number, regionId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetNoticePeriods/${companyId}/${regionId}`
  );
}

  
getMaritalStatuses(companyId: number, regionId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetMaritalStatuses/${companyId}/${regionId}`
  );
}
  // 🔹 Stage Master
  getStages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Recruitment/GetStages`);
  }

  // 🔹 Save Candidate (Resume Upload)
  saveCandidate(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/Recruitment/SaveCandidate`, formData);
  }

  // 🔹 Get Candidates Listing
  getCandidates(userId: number,companyId: number, regionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Recruitment/GetCandidates/${userId}/${companyId}/${regionId}`);
  }

  // 🔹 Move Stage
  moveStage(candidateId: number, stageId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/Recruitment/MoveStage?candidateId=${candidateId}&stageId=${stageId}`,
      {}
    );
  }
deleteCandidate(candidateId: number) {
  return this.http.delete(
    `${this.baseUrl}/Recruitment/DeleteCandidate/${candidateId}`
  );
}

getCandidateById(candidateId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/Recruitment/GetCandidateById/${candidateId}`
  );
}
updateCandidate(formData: FormData) {
  return this.http.post(
    `${this.baseUrl}/Recruitment/UpdateCandidate`,
    formData
  );
}


downloadResume(fileName: string) {
  return this.http.get(
    `${this.baseUrl}/Recruitment/DownloadResume/${fileName}`,
    { responseType: 'blob' }
  );
}
// parseResume(file: File) {
//   const formData = new FormData();
//   formData.append('resume', file);
//   return this.http.post<any>(
//     `${this.baseUrl}/Recruitment/ParseResume`,
//     formData
//   );
// }


///////screening Service ///////////



// getRecruiterseUsers() {
//   return this.http.get<any[]>(
//     `${this.baseUrl}/Recruitment/GetRecruiters`
//   );
// }
getScreeningCandidatesTopTable(
  // companyId: number,
  // regionId: number,
  // department: string,
  // designation: string,
  userId :number
) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetScreeningCandidatesTopTable`,
    {
      params: {
       
        userId
      }
    }
  );
}


saveCandidateScreening(payload: any): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/Recruitment/SaveCandidateScreening`,
    payload
  );
}
getScreeningRecords(userId: number,companyId: number, regionId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetScreeningRecords/${userId}/${companyId}/${regionId}`
  );
}
updateCandidateScreening(payload: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/Recruitment/UpdateScreening`, payload);
}



//////////////Interview Service /////////////
getScreeningCandidatesTopTableInterview(
  // companyId: number,
  // regionId: number,
  // department: string,
  // designation: string
  userId :number
) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetScreeningCandidatesTopTableInterview`,
    {
      params: {
        userId
      }
    }
  );
}
getInterviewLevels(companyId: number, regionId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetInterviewLevels/${companyId}/${regionId}`
  );
}
saveCandidateInterview(payload: any): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/Recruitment/SaveCandidateInterview`,
    payload
  );
}

getInterviewRecords(userId: number,companyId: number, regionId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetInterviewRecords/${userId}/${companyId}/${regionId}`
  );
}
updateCandidateInterview(payload: any) {
  return this.http.post(
    `${this.baseUrl}/Recruitment/UpdateCandidateInterview`,
    payload
  );
}
// 🔹 Appointment Screen
getAppointments(interviewerId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetAppointments/${interviewerId}`
  );
}
getAppointmentCandidateDetails(candidateId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/Recruitment/GetAppointmentCandidateDetails/${candidateId}`
  );
}

updateAppointmentResult(payload: any) {
  return this.http.post(
    `${this.baseUrl}/Recruitment/UpdateCandidateInterview`,
    payload
  );
}

////////// Offer
getOfferCandidatesTopTable(
  // companyId: number,
  // regionId: number,
  // department: string,
  // designation: string
  userId :number
) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetOfferCandidatesTopTable`,
    {
      params: {
        // companyId,
        // regionId,
        // department,
        // designation
        userId
      }
    }
  );
}
saveCandidateOffer(payload: any): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/Recruitment/SaveCandidateOffer`,
    payload
  );
}
getOfferRecords(userId: number, companyId: number, regionId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetOfferRecords/${userId}/${companyId}/${regionId}`
  );
}
getHRUsers(companyId: number, regionId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetHRUsers/${companyId}/${regionId}`
  );
}
sendOfferLetter(offerId: number) {
  return this.http.post(
    `${this.baseUrl}/Recruitment/SendOfferLetter/${offerId}`,
    {}
  );
}

downloadOfferLetter(offerId: number) {
  return this.http.get(
    `${this.baseUrl}/Recruitment/DownloadOfferLetter/${offerId}`,
    { responseType: 'blob' }
  );
}

///////onboarding
getonboardingCandidatesTopTable(
  companyId: number,
  regionId: number,
  department: string,
  designation: string
) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetonboardingCandidatesTopTable`,
    {
      params: {
        companyId,
        regionId,
        department,
        designation
      }
    }
  );
}
saveCandidateOnboarding(payload: any): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/Recruitment/SaveCandidateOnboarding`,
    payload
  );
}
getOnboardedCandidates(companyId: number, regionId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetOnboardedCandidates`,
    { params: { companyId, regionId } }
  );
}
getOfferCandidatesTable(
  // companyId: number,
  // regionId: number,
  // department: string,
  // designation: string
  userId :number
) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetonboardingCandidatesTopTable`,
    {
      params: {
        // companyId,
        // regionId,
        // department,
        // designation
        userId
      }
    }
  );
}
 
}
